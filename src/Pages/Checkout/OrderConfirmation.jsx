import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faShippingFast,
  faMoneyBillWave,
} from '@fortawesome/free-solid-svg-icons';

const OrderConfirmation = () => {
  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-12 mt-24 mb-24 text-center bg-white shadow-lg rounded-lg">
        <div className="flex flex-col items-center">
          {/* Success Icon with Animation */}
          <div className="relative">
            <FontAwesomeIcon
              icon={faCheckCircle}
              className="text-6xl text-emerald-500 animate-bounce"
            />
            <span className="absolute top-[-0.938rem] right-[-0.625rem] text-xl animate-ping">
              🎊
            </span>
          </div>

          {/* Order Confirmation Message */}
          <h2 className="text-3xl font-bold text-gray-800 mt-4">
            🎉 Order Confirmed!
          </h2>

          <p className="text-gray-600 mt-3 max-w-lg">
            Thank you for your order! We’ve received your details and will begin
            processing it soon.
          </p>

          <p className="text-gray-600 mt-1">
            A confirmation email has been sent to your inbox.
          </p>

          {/* Estimated Delivery Section */}
          <div className="bg-emerald-100 p-4 rounded-lg mt-6 w-full max-w-md shadow-md border border-emerald-300">
            <p className="text-emerald-700 font-medium">Estimated Delivery:</p>
            <p className="text-emerald-900 font-bold text-lg mt-1">
              🚚 3 - 5 Business Days
            </p>
          </div>

          {/* Back to Home Button */}
          <Link
            to="/"
            className="mt-6 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-md shadow-md hover:bg-emerald-700 transition transform hover:scale-105"
          >
            Back to Home
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OrderConfirmation;
