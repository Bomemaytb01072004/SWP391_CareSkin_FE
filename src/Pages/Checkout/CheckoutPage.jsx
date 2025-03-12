import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const CheckoutPage = () => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    paymentMethod: 'cod', // Default payment method
    voucherCode: '', // ✅ Ensure this is always initialized as an empty string
  });

  const navigate = useNavigate();

  // ✅ Load only the selected items for checkout
  useEffect(() => {
    const storedSelectedItems =
      JSON.parse(localStorage.getItem('checkoutItems')) || [];
    setSelectedItems(storedSelectedItems);
  }, []);

  // ✅ Calculate totals using SalePrice if available
  const originalTotal = selectedItems.reduce(
    (total, item) => total + (item.Price || 0) * (item.Quantity || 1),
    0
  );

  const discountTotal = selectedItems.reduce((total, item) => {
    return (
      total +
      (item.Price - (item.SalePrice || item.Price)) * (item.Quantity || 1)
    );
  }, 0);

  const totalOrder = originalTotal - discountTotal;

  const handleInputChange = (e) => {
    setCustomerInfo({ ...customerInfo, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      alert('Please fill in all required fields.');
      return;
    }

    if (customerInfo.paymentMethod === 'cod') {
      handleCODCheckout();
    } else {
      handleOnlinePayment();
    }
  };

  // ✅ Formik + Yup Schema
  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      paymentMethod: 'cod',
      voucherCode: '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Full name is required'),
      email: Yup.string().email('Invalid email format'),
      phone: Yup.string()
        .matches(/^\d{10,15}$/, 'Phone number must be 10-15 digits')
        .required('Phone number is required'),
      address: Yup.string().required('Address is required'),
      paymentMethod: Yup.string().required('Payment method is required'),
      voucherCode: Yup.string(),
    }),
    onSubmit: (values) => {
      if (values.paymentMethod === 'cod') {
        handleCODCheckout(values);
      } else {
        handleOnlinePayment(values);
      }
    },
  });

  const handleCODCheckout = async () => {
    const CustomerId = localStorage.getItem('CustomerId')
      ? parseInt(localStorage.getItem('CustomerId'))
      : null;

    // ✅ Ensure Cart IDs are collected
    const selectedCartItemIds = selectedItems
      .map((item) => item.CartId)
      .filter((id) => id !== null && id !== undefined);

    // ✅ Set `PromotionId` based on voucher code
    const PromotionId = customerInfo.voucherCode.trim() ? 2 : 1; // Assuming 2 is a valid promotion ID for a voucher

    console.log('🔹 CustomerId:', CustomerId);
    console.log('🔹 SelectedCartItemIds:', selectedCartItemIds);
    console.log('🔹 PromotionId:', PromotionId);
    console.log('🔹 Voucher Code:', customerInfo.voucherCode);

    if (selectedCartItemIds.length === 0) {
      alert('No valid items selected for checkout.');
      return;
    }

    const orderPayload = {
      CustomerId,
      OrderStatusId: 1, // Assuming 1 = "Pending"
      PromotionId, // ✅ Apply promotion or default to 1
      Name: customerInfo.name,
      Phone: customerInfo.phone,
      Address: customerInfo.address,
      SelectedCartItemIds: selectedCartItemIds,
    };

    console.log('🔹 Sending Order Payload:', JSON.stringify(orderPayload));

    try {
      const response = await fetch(
        'http://careskinbeauty.shop:4456/api/Order',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('Token') || ''}`,
          },
          body: JSON.stringify(orderPayload),
        }
      );

      const responseText = await response.text();

      if (!response.ok) {
        console.error('⚠️ Server Response:', responseText);
        alert(`Failed to place order: ${responseText}`);
        return;
      }

      console.log('✅ Order Response:', responseText);
      alert('Order placed successfully!');

      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      const updatedCart = cart.filter(
        (item) => !selectedItems.find((s) => s.CartId === item.CartId)
      );

      localStorage.setItem('cart', JSON.stringify(updatedCart));
      localStorage.removeItem('checkoutItems');

      window.dispatchEvent(new Event('storage'));

      navigate('/order-confirmation');
    } catch (error) {
      console.error('❌ Order API Error:', error);
      alert('An error occurred while placing the order.');
    }
  };

  // Handle MoMo / VNPay Online Payment (Not Working)
  const handleOnlinePayment = () => {
    let paymentUrl = '';

    if (customerInfo.paymentMethod === 'momo') {
      paymentUrl = `https://momo.vn/payment?amount=${total}&name=${encodeURIComponent(
        customerInfo.name
      )}&phone=${customerInfo.phone}`;
    } else if (customerInfo.paymentMethod === 'vnpay') {
      paymentUrl = `https://vnpay.vn/payment?amount=${total}&name=${encodeURIComponent(
        customerInfo.name
      )}&phone=${customerInfo.phone}`;
    }

    localStorage.setItem(
      'pendingOrder',
      JSON.stringify({ selectedItems, customerInfo })
    );

    window.location.href = paymentUrl;
  };

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-10 mt-24">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Checkout Form */}
          <form
            className="bg-white p-6 shadow-md rounded-lg"
            onSubmit={formik.handleSubmit}
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Shipping Details
            </h3>

            {/* ✅ Full Name Field */}
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              {...formik.getFieldProps('name')}
              className="w-full border px-3 py-2 rounded-md mb-4"
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-red-500 text-sm">{formik.errors.name}</p>
            )}

            {/* ✅ Email Field */}
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email (Optional)
            </label>
            <input
              type="email"
              name="email"
              {...formik.getFieldProps('email')}
              className="w-full border px-3 py-2 rounded-md mb-4"
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-red-500 text-sm">{formik.errors.email}</p>
            )}

            {/* ✅ Phone Number Field */}
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              {...formik.getFieldProps('phone')}
              className="w-full border px-3 py-2 rounded-md mb-4"
            />
            {formik.touched.phone && formik.errors.phone && (
              <p className="text-red-500 text-sm">{formik.errors.phone}</p>
            )}

            {/* ✅ Shipping Address Field */}
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Shipping Address
            </label>
            <input
              type="text"
              name="address"
              {...formik.getFieldProps('address')}
              className="w-full border px-3 py-2 rounded-md mb-4"
            />
            {formik.touched.address && formik.errors.address && (
              <p className="text-red-500 text-sm">{formik.errors.address}</p>
            )}

            {/* ✅ Voucher Code Field */}
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Voucher Code (Optional)
            </label>
            <input
              type="text"
              name="voucherCode"
              {...formik.getFieldProps('voucherCode')}
              className="w-full border px-3 py-2 rounded-md mb-4"
            />

            {/* ✅ Payment Method Section */}
            <h3 className="text-xl font-semibold text-gray-800 mt-6">
              Payment Method
            </h3>
            <div className="flex gap-4 mt-2">
              {['cod', 'momo', 'vnpay'].map((method) => (
                <label
                  key={method}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={formik.values.paymentMethod === method}
                    onChange={formik.handleChange}
                    className={`w-5 h-5 ${
                      method === 'cod'
                        ? 'accent-emerald-600'
                        : method === 'momo'
                          ? 'accent-pink-600'
                          : 'accent-blue-600'
                    }`}
                  />
                  {method === 'cod'
                    ? 'Cash on Delivery (COD)'
                    : method === 'momo'
                      ? 'MoMo (E-Wallet)'
                      : 'VNPay (Bank Transfer)'}
                </label>
              ))}
            </div>

            <button
              type="submit"
              className="w-full mt-6 py-3 bg-emerald-600 text-white font-semibold rounded-md hover:bg-emerald-700 transition"
            >
              {formik.values.paymentMethod === 'cod'
                ? 'Place Order'
                : 'Proceed to Payment'}
            </button>
          </form>

          {/* Order Summary */}
          <div className="bg-white p-6 shadow-md rounded-lg">
            <h3 className="text-xl font-semibold text-gray-800">
              Order Summary
            </h3>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Original Price</span>
                <span>${originalTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between ">
                <span className=" text-gray-600">Discount</span>
                <span className="text-red-500 font-semibold">
                  -${discountTotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-gray-800 font-semibold text-lg">
                <span>Total</span>
                <span>${totalOrder.toFixed(2)}</span>
              </div>
            </div>
            {/* Selected Items Summary */}
            <div className="mt-4 border-t pt-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                Selected Items:
              </h4>
              <div className="max-h-80 overflow-y-auto pr-2">
                {selectedItems.length > 0 ? (
                  selectedItems.map((item) => (
                    <div
                      key={item.ProductId}
                      className="flex items-center gap-2 mb-2"
                    >
                      <img
                        src={item.PictureUrl}
                        alt={item.ProductName}
                        className="w-12 h-12 object-cover rounded-md border"
                      />
                      <span className="text-gray-700 text-sm">
                        {item.ProductName} x{item.Quantity}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-sm">
                    No items selected for checkout.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CheckoutPage;
