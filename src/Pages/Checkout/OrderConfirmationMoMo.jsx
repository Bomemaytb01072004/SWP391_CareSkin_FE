import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faTimesCircle,
  faSpinner,
  faLock,
  faHome,
  faHistory,
} from '@fortawesome/free-solid-svg-icons';

const OrderConfirmationMoMo = () => {
  const location = useLocation();
  const [isSuccess, setIsSuccess] = useState(null);
  const [message, setMessage] = useState('Verifying your order...');
  const [orderId, setOrderId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isValidRequest, setIsValidRequest] = useState(true);

  useEffect(() => {
    const verifyMoMoCallback = () => {
      const queryParams = new URLSearchParams(location.search);
      const orderIdParam = queryParams.get('orderId');
      const resultCode = queryParams.get('resultCode');

      // Basic validation: Check if required parameters exist
      if (!orderIdParam || !resultCode) {
        console.error('Missing required MoMo parameters');
        setIsValidRequest(false);
        setIsSuccess(false);
        setMessage('Invalid payment data. Please contact support.');
        setIsLoading(false);
        return;
      }

      setOrderId(orderIdParam);

      // MoMo uses '0' as the success resultCode
      if (resultCode === '0') {
        setIsSuccess(true);
        setMessage(
          'Order payment successful! Your order is now being processed.'
        );
      } else {
        setIsSuccess(false);
        setMessage(
          'Order payment failed. Please try again or contact support.'
        );
      }

      setIsLoading(false);
    };

    verifyMoMoCallback();
  }, [location.search]);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
          <div className="w-full max-w-4xl mx-auto px-6 py-14 bg-white shadow-xl rounded-2xl border border-gray-100">
            <div className="flex flex-col items-center">
              <FontAwesomeIcon
                icon={faSpinner}
                className="text-7xl text-blue-500 animate-spin"
              />
              <h2 className="text-3xl font-bold text-gray-800 mt-6 mb-2">
                Verifying your payment...
              </h2>
              <p className="text-gray-600 text-lg mt-3 max-w-lg text-center">
                Please wait while we confirm your order details. This may take a
                few moments.
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

//   if (!isValidRequest) {
//     return (
//       <>
//         <Navbar />
//         <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
//           <div className="w-full max-w-4xl mx-auto px-6 py-14 bg-white shadow-xl rounded-2xl border border-red-100">
//             <div className="flex flex-col items-center">
//               <FontAwesomeIcon
//                 icon={faLock}
//                 className="text-6xl text-red-500"
//               />
//               <h2 className="text-3xl font-bold text-red-800 mt-6 mb-2">
//                 Invalid Payment Request
//               </h2>
//               <p className="text-gray-600 mt-3 max-w-lg text-center">
//                 We've detected an invalid payment request. This has been logged
//                 for security purposes.
//               </p>
//               <Link
//                 to="/"
//                 className="px-8 py-4 bg-gray-700 text-white font-semibold rounded-lg mt-6"
//               >
//                 Back to Home
//               </Link>
//             </div>
//           </div>
//         </div>
//         <Footer />
//       </>
//     );
//   }

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
        <div className="w-full max-w-4xl mx-auto mt-20 px-6 py-10 bg-white shadow-xl rounded-2xl border border-gray-100">
          <div className="flex flex-col items-center">
            <div
              className={`w-32 h-32 ${
                isSuccess ? 'bg-emerald-100' : 'bg-red-100'
              } rounded-full flex items-center justify-center`}
            >
              <FontAwesomeIcon
                icon={isSuccess ? faCheckCircle : faTimesCircle}
                className={`text-7xl ${
                  isSuccess ? 'text-emerald-500' : 'text-red-500'
                }`}
              />
            </div>
            <h2
              className={`text-3xl font-bold mt-6 ${
                isSuccess ? 'text-gray-800' : 'text-red-800'
              }`}
            >
              {isSuccess ? 'Thank You for Your Order!' : 'Payment Failed'}
            </h2>
            <p
              className={`text-lg mt-3 max-w-lg text-center ${
                isSuccess ? 'text-gray-600' : 'text-red-600'
              }`}
            >
              {message}
            </p>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/"
              className="px-8 py-4 bg-gray-700 text-white font-semibold rounded-lg"
            >
              Back to Home
            </Link>
            {isSuccess && (
              <Link
                to="/order-history"
                className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg"
              >
                View My Orders
              </Link>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OrderConfirmationMoMo;
