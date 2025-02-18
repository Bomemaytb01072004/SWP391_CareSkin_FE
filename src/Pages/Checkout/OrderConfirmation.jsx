import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';

const OrderConfirmation = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if there's a pending order from online payment
    const pendingOrder = JSON.parse(localStorage.getItem('pendingOrder'));

    if (pendingOrder) {
      // Clear stored pending order after confirmation
      localStorage.removeItem('pendingOrder');

      // Optionally, update backend with payment status if needed
    }
  }, []);

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto text-center mt-20 p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-bold text-green-600 mb-4">
          🎉 Order Confirmed!
        </h2>
        <p className="text-gray-700">
          Thank you for your order. We have received your details and will begin
          processing your order soon.
        </p>
        <p className="text-gray-500 mt-2">
          You will receive an email confirmation shortly.
        </p>

        <button
          onClick={() => navigate('/')}
          className="mt-6 px-6 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition"
        >
          Back to Home
        </button>
      </div>
      <Footer />
    </>
  );
};

export default OrderConfirmation;
