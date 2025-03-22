import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { fetchActivePromotions } from '../../utils/api';
import { motion } from 'framer-motion'; // Make sure to import motion if not already

const CheckoutPage = () => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [isRedirecting, setIsRedirecting] = useState(false); // Add this state to handle redirection UI

  const navigate = useNavigate();

  // Authentication check - run this first
  useEffect(() => {
    const CustomerId = localStorage.getItem('CustomerId');
    const token =
      localStorage.getItem('Token') || localStorage.getItem('token');

    if (!CustomerId || !token) {
      setIsRedirecting(true);

      // Save current cart URL to return after login
      localStorage.setItem('redirectAfterLogin', '/checkout');

      // Show message briefly before redirecting
      setTimeout(() => {
        navigate('/login', {
          state: {
            from: 'checkout',
            message: 'Please log in or register to proceed with checkout',
          },
        });
      }, 2000);
    }
  }, [navigate]);

  // Existing useEffect for loading checkout items
  useEffect(() => {
    const storedSelectedItems =
      JSON.parse(localStorage.getItem('checkoutItems')) || [];
    setSelectedItems(storedSelectedItems);
    // Fetch available promotions from API
    fetchActivePromotions()
      .then(setPromotions)
      .catch((error) => console.error('Error fetching promotions:', error));
  }, []);

  // Calculate totals using SalePrice if available
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

  // Dynamically update `totalOrder` when a promotion is selected
  const totalBeforePromotion = originalTotal - discountTotal;
  const discountAmount = (totalBeforePromotion * discountPercent) / 100;
  const totalOrder = totalBeforePromotion - discountAmount;

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

  // Formik + Yup Schema
  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      paymentMethod: 'cod',
      promotionId: '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Full name is required'),
      email: Yup.string()
        .required('Email is required')
        .email('Invalid email format'),
      phone: Yup.string()
        .matches(/^\d{10,15}$/, 'Phone number must be 10-15 digits')
        .required('Phone number is required'),
      address: Yup.string().required('Address is required'),
      paymentMethod: Yup.string().required('Payment method is required'),
      promotionId: Yup.string(),
    }),
    onSubmit: (values) => {
      if (values.paymentMethod === 'cod') {
        handleCODCheckout(values);
      } else if (values.paymentMethod === 'vnpay') {
        handleOnlinePayment(values);
      } else if (values.paymentMethod === 'momo') {
        handleMoMoPayment(values);
      }
    },
  });

  const handleCODCheckout = async (values) => {
    const CustomerId = localStorage.getItem('CustomerId')
      ? parseInt(localStorage.getItem('CustomerId'))
      : null;

    // Ensure Cart IDs are collected
    const selectedCartItemIds = selectedItems
      .map((item) => item.CartId)
      .filter((id) => id !== null && id !== undefined);

    if (selectedCartItemIds.length === 0) {
      alert('No valid items selected for checkout.');
      return;
    }

    // Get PromotionId from Formik
    const PromotionId = values.promotionId ? parseInt(values.promotionId) : 1;

    // Build order payload using Formik values
    const orderPayload = {
      CustomerId,
      OrderStatusId: 1, // Assuming 1 = "Pending"
      PromotionId, // Apply selected promotion or default to 1
      Name: values.name,
      Phone: values.phone,
      Email: values.email, // Include email in the payload
      Address: values.address,
      SelectedCartItemIds: selectedCartItemIds,
    };

    console.log('Sending Order Payload:', JSON.stringify(orderPayload));

    try {
      const response = await fetch(
        'http://careskinbeauty.shop:4456/api/Order',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
          body: JSON.stringify(orderPayload),
        }
      );

      const responseText = await response.text();

      if (!response.ok) {
        console.error('Server Response:', responseText);
        alert(`Failed to place order: ${responseText}`);
        return;
      }

      console.log('Order Response:', responseText);
      alert('Order placed successfully!');

      // Remove purchased items from cart
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      const updatedCart = cart.filter(
        (item) => !selectedItems.find((s) => s.CartId === item.CartId)
      );

      localStorage.setItem('cart', JSON.stringify(updatedCart));
      localStorage.removeItem('checkoutItems');

      window.dispatchEvent(new Event('storage'));

      navigate('/order-confirmation');
    } catch (error) {
      console.error('Order API Error:', error);
      alert('An error occurred while placing the order.');
    }
  };

  const handleOnlinePayment = async (values) => {
    const CustomerId = localStorage.getItem('CustomerId')
      ? parseInt(localStorage.getItem('CustomerId'))
      : null;

    const selectedCartItemIds = selectedItems
      .map((item) => item.CartId)
      .filter((id) => id !== null && id !== undefined);

    if (selectedCartItemIds.length === 0) {
      alert('No valid items selected for checkout.');
      return;
    }

    const PromotionId = values.promotionId ? parseInt(values.promotionId) : 1;

    const orderPayload = {
      CustomerId,
      OrderStatusId: 1, // Assuming 1 = "Pending"
      PromotionId,
      Name: values.name,
      Phone: values.phone,
      Email: values.email, // Include email in the payload
      Address: values.address,
      SelectedCartItemIds: selectedCartItemIds,
    };

    console.log('🔹 Sending Order Payload:', JSON.stringify(orderPayload));

    try {
      // Step 1: Place Order
      const orderResponse = await fetch(
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

      if (!orderResponse.ok) {
        const errorMessage = await orderResponse.text();
        console.error('⚠️ Order Response:', errorMessage);
        alert(`Failed to place order: ${errorMessage}`);
        return;
      }

      const orderData = await orderResponse.json();
      const OrderId = orderData.OrderId; // Ensure your backend returns the OrderId

      console.log('✅ Order Placed Successfully:', orderData);

      // Step 2: Get VNPay Payment URL
      const paymentPayload = {
        OrderId,
        Amount: totalOrder * 100 * 240, // Convert to VND smallest unit
        OrderDescription: `Payment for Order #${OrderId}`,
        OrderType: 'other',
        CustomerName: values.name,
      };

      const paymentResponse = await fetch(
        'http://careskinbeauty.shop:4456/api/vnpay/create-payment',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(paymentPayload),
        }
      );

      const paymentData = await paymentResponse.json();

      if (
        paymentData &&
        paymentData.paymentUrl &&
        paymentData.paymentUrl.Result
      ) {
        console.log('✅ Redirecting to VNPay:', paymentData.paymentUrl.Result);
        window.location.href = paymentData.paymentUrl.Result; // Redirect user to VNPay
      } else {
        console.error('❌ Invalid payment response:', paymentData);
        alert('Failed to generate VNPay payment URL.');
      }
    } catch (error) {
      console.error('❌ Payment API Error:', error);
      alert('An error occurred while processing the order.');
    }
  };

  const handleMoMoPayment = async (values) => {
    const CustomerId = localStorage.getItem('CustomerId')
      ? parseInt(localStorage.getItem('CustomerId'))
      : null;

    const selectedCartItemIds = selectedItems
      .map((item) => item.CartId)
      .filter((id) => id !== null && id !== undefined);

    if (selectedCartItemIds.length === 0) {
      alert('No valid items selected for checkout.');
      return;
    }

    const PromotionId = values.promotionId ? parseInt(values.promotionId) : 1;

    const orderPayload = {
      CustomerId,
      OrderStatusId: 1, // Assuming 1 = "Pending"
      PromotionId,
      Name: values.name,
      Phone: values.phone,
      Email: values.email,
      Address: values.address,
      SelectedCartItemIds: selectedCartItemIds,
    };

    try {
      // Step 1: Place Order and fetch OrderId
      const orderResponse = await fetch(
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

      if (!orderResponse.ok) {
        const errorMessage = await orderResponse.text();
        console.error('⚠️ Order Response:', errorMessage);
        alert(`Failed to place order: ${errorMessage}`);
        return;
      }

      const orderData = await orderResponse.json();
      const OrderId = orderData.OrderId;

      console.log('✅ Order Placed Successfully:', orderData);

      // Step 2: Get MoMo Payment URL using the fetched OrderId
      const paymentPayload = {
        OrderId,
        Amount: Math.round(totalOrder * 24000), // Convert to VND smallest unit and ensure it's an integer
      };

      console.log('🔹 Sending MoMo Payment Payload:', paymentPayload);

      const paymentResponse = await fetch(
        'http://careskinbeauty.shop:4456/api/momo/create-payment',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(paymentPayload),
        }
      );

      const paymentData = await paymentResponse.json();

      if (paymentResponse.ok && paymentData.payUrl) {
        console.log('✅ Redirecting to MoMo:', paymentData.payUrl);
        window.location.href = paymentData.payUrl; // Redirect user to MoMo
      } else {
        console.error('❌ Invalid payment response:', paymentData);
        alert(paymentData.message || 'Failed to generate MoMo payment URL.');
      }
    } catch (error) {
      console.error('❌ Payment API Error:', error);
      alert('An error occurred while processing the order.');
    }
  };

  // Handle Promotion Selection
  const handlePromotionChange = (e) => {
    const selectedPromotionId = e.target.value;
    formik.setFieldValue('promotionId', selectedPromotionId);

    // Find the selected promotion's discount percent
    const selectedPromotion = promotions.find(
      (promo) => promo.PromotionId.toString() === selectedPromotionId
    );

    if (selectedPromotion) {
      setDiscountPercent(selectedPromotion.DiscountPercent);
    } else {
      setDiscountPercent(0); // Reset if no promotion is selected
    }
  };

  // Add this conditional rendering for redirecting state
  if (isRedirecting) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-emerald-50 to-teal-50 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full text-center"
          >
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Authentication Required
            </h2>
            <p className="text-gray-600 mb-6">
              Please sign in or register to continue with your checkout process.
            </p>
            <div className="flex flex-col space-y-3">
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-emerald-500 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2 }}
                />
              </div>
              <p className="text-sm text-gray-500">
                Redirecting to login page...
              </p>
            </div>
          </motion.div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 py-10">
        <div className="max-w-6xl mx-auto px-6 pt-24 pb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 text-center mb-2">
            Complete Your Purchase
          </h1>
          <p className="text-center text-gray-600 mb-6">
            You're just a few steps away from your amazing products!
          </p>

          {/* Checkout Progress */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <span className="text-xs mt-1 text-gray-600">Cart</span>
              </div>
              <div className="w-16 h-1 bg-emerald-600"></div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <span className="text-xs mt-1 text-gray-600">Checkout</span>
              </div>
              <div className="w-16 h-1 bg-gray-300"></div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <span className="text-xs mt-1 text-gray-600">Confirmation</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Checkout Form */}
            <div className="bg-white p-8 shadow-lg rounded-xl border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b border-gray-100">
                Shipping Details
              </h2>

              <form className="space-y-5" onSubmit={formik.handleSubmit}>
                {/* Full Name Field */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    {...formik.getFieldProps('name')}
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-emerald-300 focus:border-emerald-500 outline-none transition-all"
                    placeholder="Enter your full name"
                  />
                  {formik.touched.name && formik.errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.name}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    {...formik.getFieldProps('email')}
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-emerald-300 focus:border-emerald-500 outline-none transition-all"
                    placeholder="example@email.com"
                  />
                  {formik.touched.email && formik.errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.email}
                    </p>
                  )}
                </div>

                {/* Phone Number Field */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    {...formik.getFieldProps('phone')}
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-emerald-300 focus:border-emerald-500 outline-none transition-all"
                    placeholder="Enter your phone number"
                  />
                  {formik.touched.phone && formik.errors.phone && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.phone}
                    </p>
                  )}
                </div>

                {/* Shipping Address Field */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Shipping Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    {...formik.getFieldProps('address')}
                    className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-300 focus:border-emerald-500 outline-none transition-all"
                    placeholder="Enter your full shipping address"
                    rows="2"
                  ></textarea>
                  {formik.touched.address && formik.errors.address && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.address}
                    </p>
                  )}
                </div>

                {/* Select Available Promotion */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Select Promotion
                  </label>
                  <div className="relative">
                    <select
                      name="promotionId"
                      value={formik.values.promotionId}
                      onChange={handlePromotionChange}
                      className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-emerald-300 focus:border-emerald-500 outline-none transition-all appearance-none"
                    >
                      <option value="">No Promotion</option>
                      {promotions.length > 0 ? (
                        promotions.map((promo) => (
                          <option
                            key={promo.PromotionId}
                            value={promo.PromotionId}
                          >
                            {promo.Name} - {promo.DiscountPercent}% Off
                          </option>
                        ))
                      ) : (
                        <option disabled>No promotions available</option>
                      )}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg
                        className="fill-current h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Payment Method Section - Enhanced */}
                <div className="pt-2">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Payment Method
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {/* Cash on Delivery */}
                    <label
                      className={`border rounded-lg flex items-center cursor-pointer transition-all duration-200 hover:shadow-md ${
                        formik.values.paymentMethod === 'cod'
                          ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                          : 'border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={formik.values.paymentMethod === 'cod'}
                        onChange={formik.handleChange}
                        className="form-radio h-5 w-5 text-emerald-600 ml-4"
                      />
                      <div className="flex items-center justify-between flex-grow py-3 px-4">
                        <div className="flex items-center">
                          <div className="p-1.5 bg-gray-100 rounded-full mr-3">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6 text-gray-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                              />
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">
                              Cash on Delivery
                            </div>
                            <div className="text-xs text-gray-500">
                              Pay when you receive your order
                            </div>
                          </div>
                        </div>
                        {formik.values.paymentMethod === 'cod' && (
                          <span className="relative flex h-6 w-6">
                            <span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="relative h-6 w-6 text-emerald-600"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        )}
                      </div>
                    </label>

                    {/* VNPAY */}
                    <label
                      className={`border rounded-lg flex items-center cursor-pointer transition-all duration-300 hover:shadow-md transform hover:-translate-y-1 ${
                        formik.values.paymentMethod === 'vnpay'
                          ? 'border-emerald-500 bg-emerald-50 shadow-md'
                          : 'border-gray-200 hover:border-emerald-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="vnpay"
                        checked={formik.values.paymentMethod === 'vnpay'}
                        onChange={formik.handleChange}
                        className="form-radio h-5 w-5 text-emerald-600 ml-4 focus:ring-emerald-500"
                      />
                      <div className="flex items-center justify-between flex-grow py-3 px-4">
                        <div className="flex items-center">
                          <div className="mr-3 bg-white rounded-md p-1 border border-gray-100 shadow-sm w-20 h-14 flex items-center justify-center">
                            {/* VNPAY Logo */}
                            <img
                              src="https://downloadlogomienphi.com/sites/default/files/logos/download-logo-vector-vnpay-mien-phi.jpg"
                              alt="VNPAY"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div>
                            <div className="font-medium text-gray-800 text-lg">
                              VNPay
                            </div>
                            <div className="text-sm text-gray-500">
                              Pay with bank card, QR code or e-wallet
                            </div>
                          </div>
                        </div>
                        {formik.values.paymentMethod === 'vnpay' && (
                          <span className="relative flex h-6 w-6">
                            <span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="relative h-6 w-6 text-emerald-600"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        )}
                      </div>
                    </label>

                    {/* MoMo */}
                    <label
                      className={`border rounded-lg flex items-center cursor-pointer transition-all duration-300 hover:shadow-md transform hover:-translate-y-1 ${
                        formik.values.paymentMethod === 'momo'
                          ? 'border-emerald-500 bg-emerald-50 shadow-md'
                          : 'border-gray-200 hover:border-emerald-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="momo"
                        checked={formik.values.paymentMethod === 'momo'}
                        onChange={formik.handleChange}
                        className="form-radio h-5 w-5 text-emerald-600 ml-4"
                      />
                      <div className="flex items-center justify-between flex-grow py-3 px-4">
                        <div className="flex items-center">
                          <div className="mr-3 bg-white rounded-md p-1 border border-gray-100 shadow-sm w-20 h-14 flex items-center justify-center">
                            {/* MoMo Logo */}
                            <img
                              src="https://itviec.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBM0E3SHc9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--3873048b5c25240e612222d38b001c927993024c/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdCem9MWm05eWJXRjBTU0lJY0c1bkJqb0dSVlE2RkhKbGMybDZaVjkwYjE5c2FXMXBkRnNIYVFJc0FXa0NMQUU9IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--15c3f2f3e11927673ae52b71712c1f66a7a1b7bd/MoMo%20Logo.png"
                              alt="MoMo"
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                          <div>
                            <div className="font-medium text-gray-800 text-lg">
                              MoMo
                            </div>
                            <div className="text-sm text-gray-500">
                              Pay with MoMo e-wallet
                            </div>
                          </div>
                        </div>
                        {formik.values.paymentMethod === 'momo' && (
                          <span className="relative flex h-6 w-6">
                            <span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="relative h-6 w-6 text-emerald-600"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-6 w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg flex items-center justify-center"
                >
                  {formik.values.paymentMethod === 'cod' ? (
                    <>
                      <span className="mr-2">Place Order</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </>
                  ) : (
                    <>
                      <span className="mr-2">Proceed to Payment</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="bg-white p-8 shadow-lg rounded-xl border border-gray-100 h-fit">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b border-gray-100">
                Order Summary
              </h2>

              {/* Price Summary */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Original Price</span>
                  <span className="font-medium">
                    ${originalTotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Product Discount</span>
                  <span className="text-red-500 font-medium">
                    -${discountTotal.toFixed(2)}
                  </span>
                </div>
                {/* Discount from Promotion */}
                <div className="flex justify-between">
                  <span className="text-gray-600">Promotion Discount</span>
                  <span className="text-red-500 font-medium">
                    -${discountAmount.toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-dashed border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between text-gray-800 font-bold text-xl">
                    <span>Total</span>
                    <span>${totalOrder.toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-gray-500 text-right mt-1">
                    (Including taxes and fees)
                  </div>
                </div>
              </div>

              {/* Selected Items */}
              <div className="mt-6 border-t border-gray-100 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Your Items ({selectedItems.length})
                </h3>

                <div className="max-h-96 overflow-y-auto pr-2 space-y-4">
                  {selectedItems.length > 0 ? (
                    selectedItems.map((item) => (
                      <div
                        key={item.ProductId}
                        className="flex gap-4 pb-4 border-b border-gray-100"
                      >
                        <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                          <img
                            src={item.PictureUrl}
                            alt={item.ProductName}
                            className="h-full w-full object-cover object-center"
                          />
                        </div>
                        <div className="flex flex-col flex-grow">
                          <h4 className="text-sm font-medium text-gray-900">
                            {item.ProductName}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            Quantity: {item.Quantity}
                          </p>
                          <div className="flex justify-between items-end mt-auto">
                            <div className="text-sm font-medium text-gray-900">
                              $
                              {(
                                (item.SalePrice || item.Price) * item.Quantity
                              ).toFixed(2)}
                            </div>
                            {item.SalePrice && (
                              <div className="text-xs text-gray-500 line-through">
                                ${(item.Price * item.Quantity).toFixed(2)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">
                        No items selected for checkout
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Secure Checkout Badge */}
              <div className="mt-8 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-center text-gray-500 text-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Secure Checkout
                </div>
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
