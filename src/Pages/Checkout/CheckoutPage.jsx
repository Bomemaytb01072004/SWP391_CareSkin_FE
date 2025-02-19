<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';
import { useNavigate } from 'react-router-dom';

const CheckoutPage = () => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    paymentMethod: 'cod', // Default payment method
  });

  const shippingCost = 5.0; // Fixed shipping fee
  const taxRate = 0.1; // 10% tax
  const navigate = useNavigate();

  useEffect(() => {
    const storedSelectedItems =
      JSON.parse(localStorage.getItem('checkoutItems')) || [];
    setSelectedItems(storedSelectedItems);
  }, []);

  const subtotal = selectedItems.reduce(
    (total, item) => total + item.price * (item.quantity || 1),
    0
  );
  const tax = subtotal * taxRate;
  const total = subtotal + tax + (subtotal > 0 ? shippingCost : 0);

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

  const handleCODCheckout = () => {
    alert('Order placed successfully!');

    // Remove selected items from cart
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const updatedCart = cart.filter(
      (item) => !selectedItems.find((s) => s.id === item.id)
    );

    localStorage.setItem('cart', JSON.stringify(updatedCart));
    localStorage.removeItem('checkoutItems');

    window.dispatchEvent(new Event('storage'));

    navigate('/order-confirmation');
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
            onSubmit={handleSubmit}
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Shipping Details
            </h3>

            <label className="block text-gray-700 text-sm font-bold mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={customerInfo.name}
              onChange={handleInputChange}
              required
              className="w-full border px-3 py-2 rounded-md mb-4"
            />

            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email (Optional)
            </label>
            <input
              type="email"
              name="email"
              value={customerInfo.email}
              onChange={handleInputChange}
              className="w-full border px-3 py-2 rounded-md mb-4"
            />

            <label className="block text-gray-700 text-sm font-bold mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={customerInfo.phone}
              onChange={handleInputChange}
              required
              className="w-full border px-3 py-2 rounded-md mb-4"
            />

            <label className="block text-gray-700 text-sm font-bold mb-2">
              Shipping Address
            </label>
            <input
              type="text"
              name="address"
              value={customerInfo.address}
              onChange={handleInputChange}
              required
              className="w-full border px-3 py-2 rounded-md mb-4"
            />

            {/* Payment Methods */}
            <h3 className="text-xl font-semibold text-gray-800 mt-6">
              Payment Method
            </h3>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={customerInfo.paymentMethod === 'cod'}
                  onChange={handleInputChange}
                  className="w-5 h-5 accent-emerald-600"
                />
                Cash on Delivery (COD)
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="momo"
                  checked={customerInfo.paymentMethod === 'momo'}
                  onChange={handleInputChange}
                  className="w-5 h-5 accent-pink-600"
                />
                MoMo (E-Wallet)
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="vnpay"
                  checked={customerInfo.paymentMethod === 'vnpay'}
                  onChange={handleInputChange}
                  className="w-5 h-5 accent-blue-600"
                />
                VNPay (Bank Transfer)
              </label>
            </div>

            <button
              type="submit"
              className="w-full mt-6 py-3 bg-emerald-600 text-white font-semibold rounded-md hover:bg-emerald-700 transition"
            >
              {customerInfo.paymentMethod === 'cod'
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
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>${subtotal > 0 ? shippingCost.toFixed(2) : '0.00'}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (10%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-800 font-semibold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
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
                    <div key={item.id} className="flex items-center gap-2 mb-2">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-md border"
                      />
                      <span className="text-gray-700 text-sm">
                        {item.name} x{item.quantity}
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
=======
import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';
import { useNavigate } from 'react-router-dom';

const CheckoutPage = () => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    paymentMethod: 'cod', // Default payment method
  });

  const shippingCost = 5.0; // Fixed shipping fee
  const taxRate = 0.1; // 10% tax
  const navigate = useNavigate();

  useEffect(() => {
    const storedSelectedItems =
      JSON.parse(localStorage.getItem('checkoutItems')) || [];
    setSelectedItems(storedSelectedItems);
  }, []);

  const subtotal = selectedItems.reduce(
    (total, item) => total + item.price * (item.quantity || 1),
    0
  );
  const tax = subtotal * taxRate;
  const total = subtotal + tax + (subtotal > 0 ? shippingCost : 0);

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

  const handleCODCheckout = () => {
    alert('Order placed successfully!');

    // Remove selected items from cart
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const updatedCart = cart.filter(
      (item) => !selectedItems.find((s) => s.id === item.id)
    );

    localStorage.setItem('cart', JSON.stringify(updatedCart));
    localStorage.removeItem('checkoutItems');

    window.dispatchEvent(new Event('storage'));

    navigate('/order-confirmation');
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
            onSubmit={handleSubmit}
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Shipping Details
            </h3>

            <label className="block text-gray-700 text-sm font-bold mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={customerInfo.name}
              onChange={handleInputChange}
              required
              className="w-full border px-3 py-2 rounded-md mb-4"
            />

            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email (Optional)
            </label>
            <input
              type="email"
              name="email"
              value={customerInfo.email}
              onChange={handleInputChange}
              className="w-full border px-3 py-2 rounded-md mb-4"
            />

            <label className="block text-gray-700 text-sm font-bold mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={customerInfo.phone}
              onChange={handleInputChange}
              required
              className="w-full border px-3 py-2 rounded-md mb-4"
            />

            <label className="block text-gray-700 text-sm font-bold mb-2">
              Shipping Address
            </label>
            <input
              type="text"
              name="address"
              value={customerInfo.address}
              onChange={handleInputChange}
              required
              className="w-full border px-3 py-2 rounded-md mb-4"
            />

            {/* Payment Methods */}
            <h3 className="text-xl font-semibold text-gray-800 mt-6">
              Payment Method
            </h3>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={customerInfo.paymentMethod === 'cod'}
                  onChange={handleInputChange}
                  className="w-5 h-5 accent-emerald-600"
                />
                Cash on Delivery (COD)
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="momo"
                  checked={customerInfo.paymentMethod === 'momo'}
                  onChange={handleInputChange}
                  className="w-5 h-5 accent-pink-600"
                />
                MoMo (E-Wallet)
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="vnpay"
                  checked={customerInfo.paymentMethod === 'vnpay'}
                  onChange={handleInputChange}
                  className="w-5 h-5 accent-blue-600"
                />
                VNPay (Bank Transfer)
              </label>
            </div>

            <button
              type="submit"
              className="w-full mt-6 py-3 bg-emerald-600 text-white font-semibold rounded-md hover:bg-emerald-700 transition"
            >
              {customerInfo.paymentMethod === 'cod'
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
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>${subtotal > 0 ? shippingCost.toFixed(2) : '0.00'}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (10%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-800 font-semibold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
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
                    <div key={item.id} className="flex items-center gap-2 mb-2">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-md border"
                      />
                      <span className="text-gray-700 text-sm">
                        {item.name} x{item.quantity}
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
>>>>>>> 724d2a6bb1720cf77d57fc8b265465a2ce398ac1
