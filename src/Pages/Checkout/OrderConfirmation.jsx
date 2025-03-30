import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faTimesCircle,
  faShippingFast,
  faMoneyBillWave,
  faExclamationTriangle,
  faSpinner,
  faLock,
  faBox,
  faReceipt,
  faMapMarkerAlt,
  faPhoneAlt,
  faUser,
  faCalendarAlt,
  faCreditCard,
  faHome,
  faHistory,
  faHeadset,
  faBoxOpen,
} from '@fortawesome/free-solid-svg-icons';
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(null);
  const [message, setMessage] = useState('Verifying your order...');
  const [orderId, setOrderId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isValidRequest, setIsValidRequest] = useState(true);
  const [orderDetails, setOrderDetails] = useState(null);
  const [progressStep, setProgressStep] = useState(1); // For the progress stepper

  // Add these new state variables for exchange rate
  const [exchangeRate, setExchangeRate] = useState(24000); // Default fallback rate
  const [isLoadingRate, setIsLoadingRate] = useState(true);

  useEffect(() => {
    const verifyOrderRequest = async () => {
      try {
        const queryParams = new URLSearchParams(location.search);
        const transactionStatus = queryParams.get('vnp_TransactionStatus');
        const txnRef = queryParams.get('vnp_TxnRef');
        const responseCode = queryParams.get('vnp_ResponseCode');
        const bankCode = queryParams.get('vnp_BankCode');
        const transactionDate = queryParams.get('vnp_PayDate');
        const paymentAmount = queryParams.get('vnp_Amount');

        // Check if we have transaction parameters (online payment)
        if (txnRef) {
          setPaymentMethod('online');

          // Basic validation: Check if all required parameters exist
          if (!transactionStatus || !responseCode || !bankCode) {
            console.error('Missing required payment parameters');
            setIsValidRequest(false);
            setIsSuccess(false);
            setMessage('Invalid payment data. Please contact support.');
            setIsLoading(false);
            return;
          }

          // Parse order ID from transaction reference
          const extractedOrderId = txnRef.split('_')[0];
          setOrderId(extractedOrderId);

          // VNPay uses '00' for success, check both status and responseCode
          const isPaymentSuccess =
            transactionStatus === '00' && responseCode === '00';

          if (isPaymentSuccess) {
            // Store successful transaction in localStorage to prevent URL manipulation
            const successfulTxn = {
              orderId: extractedOrderId,
              txnRef: txnRef,
              timestamp: Date.now(),
              status: 'success',
            };
            localStorage.setItem(
              `txn_${txnRef}`,
              JSON.stringify(successfulTxn)
            );

            await updateOrderStatus(extractedOrderId, 3); // Successful payment
            const details = await fetchOrderDetails(extractedOrderId); // Fetch order details
            setOrderDetails(details);

            // Calculate payment amount in USD (amount from VNPAY is in VND x 100)
            if (paymentAmount && details) {
              // VNPAY amount is in smallest currency unit (VND * 100)
              const amountInVND = parseInt(paymentAmount) / 100;

              // Convert to USD using the dynamic exchange rate
              const amountInUSD = amountInVND / exchangeRate;

              console.log(
                `Converting ${amountInVND} VND to USD using rate ${exchangeRate} = ${amountInUSD.toFixed(2)} USD`
              );

              // Send payment confirmation email
              await sendPaymentConfirmationEmail(
                extractedOrderId,
                details.Email || details.email || localStorage.getItem('email'),
                details.Name ||
                  details.name ||
                  localStorage.getItem('username'),
                amountInUSD.toFixed(2),
                'VNPAY' // Add payment method parameter
              );
            }

            setIsSuccess(true);
            setProgressStep(3);
            setMessage(
              'Order payment successful! Your order is now being processed.'
            );
          } else {
            // Store failed transaction in localStorage
            const failedTxn = {
              orderId: extractedOrderId,
              txnRef: txnRef,
              timestamp: Date.now(),
              status: 'failed',
            };
            localStorage.setItem(`txn_${txnRef}`, JSON.stringify(failedTxn));

            await updateOrderStatus(extractedOrderId, 5); // Failed payment
            setIsSuccess(false);
            setMessage(
              'Order payment failed. Please try again or contact support.'
            );
          }
        } else {
          // No transaction parameters means COD
          setPaymentMethod('cod');
          setIsSuccess(true);
          setProgressStep(2); // For Cash on Delivery
          setMessage(
            'Order placed successfully! Your order will be delivered soon.'
          );
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setIsSuccess(false);
        setMessage(
          'Error processing payment. Please contact customer support.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    // Check if this transaction was already processed (prevents URL manipulation)
    const checkExistingTransaction = () => {
      const queryParams = new URLSearchParams(location.search);
      const txnRef = queryParams.get('vnp_TxnRef');

      if (txnRef) {
        const existingTxn = localStorage.getItem(`txn_${txnRef}`);

        if (existingTxn) {
          const txnData = JSON.parse(existingTxn);
          const extractedOrderId = txnRef.split('_')[0];
          setOrderId(extractedOrderId);
          setPaymentMethod('online');

          // Use stored transaction result instead of URL parameters
          if (txnData.status === 'success') {
            setIsSuccess(true);
            setProgressStep(3);
            setMessage(
              'Order payment successful! Your order is now being processed.'
            );
          } else {
            setIsSuccess(false);
            setMessage(
              'This payment has already been processed and was unsuccessful.'
            );
          }
          setIsLoading(false);
          return true; // Transaction was already processed
        }
      }
      return false; // New transaction
    };

    // Only process if not already handled
    if (!checkExistingTransaction()) {
      verifyOrderRequest();
    }
  }, [location.search, exchangeRate]);

  // Add this new useEffect to fetch the exchange rate
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        // Try to fetch current exchange rate from API
        const response = await fetch('https://open.er-api.com/v6/latest/USD');

        if (!response.ok) {
          throw new Error('Failed to fetch exchange rate');
        }

        const data = await response.json();

        // VND rate per 1 USD
        if (data.rates && data.rates.VND) {
          setExchangeRate(data.rates.VND);
          console.log(`Retrieved exchange rate: 1 USD = ${data.rates.VND} VND`);
        }
      } catch (error) {
        console.error('Error fetching exchange rate:', error);
        // Keep using the fallback rate
        console.log(
          `Using fallback exchange rate: 1 USD = ${exchangeRate} VND`
        );
      } finally {
        setIsLoadingRate(false);
      }
    };

    fetchExchangeRate();
  }, []);

  const updateOrderStatus = async (orderId, status) => {
    try {
      // Make sure orderId and status are properly formatted
      const numericOrderId = parseInt(orderId, 10);
      const numericStatus = parseInt(status, 10);

      if (isNaN(numericOrderId) || isNaN(numericStatus)) {
        throw new Error('Invalid order ID or status');
      }

      const response = await fetch(
        `${backendUrl}/api/Order/${numericOrderId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
          body: JSON.stringify(numericStatus),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to update order status:', errorText);
        throw new Error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error; // Re-throw to be handled by the caller
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await fetch(`${backendUrl}/api/Order/${orderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch order details:', errorText);
        throw new Error('Failed to fetch order details');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error; // Re-throw to be handled by the caller
    }
  };

  // Progress steps component
  const ProgressStepper = ({ currentStep }) => {
    const steps = [
      { label: 'Order Placed', icon: faBox },
      { label: 'Payment Confirmed', icon: faCreditCard },
      { label: 'Processing', icon: faBoxOpen },
      { label: 'Shipped', icon: faShippingFast },
    ];

    return (
      <div className="w-full max-w-3xl mx-auto mt-8 mb-8">
        <div className="flex items-center justify-between relative">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex flex-col items-center relative z-10"
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  index < currentStep
                    ? 'bg-emerald-500 text-white'
                    : index === currentStep
                      ? 'bg-blue-500 text-white animate-pulse'
                      : 'bg-gray-200 text-gray-500'
                }`}
              >
                <FontAwesomeIcon icon={step.icon} className="text-lg" />
              </div>
              <p
                className={`mt-2 text-xs sm:text-sm font-medium ${
                  index < currentStep
                    ? 'text-emerald-600'
                    : index === currentStep
                      ? 'text-blue-600'
                      : 'text-gray-500'
                }`}
              >
                {step.label}
              </p>
            </div>
          ))}

          {/* Progress bar connecting the steps */}
          <div className="absolute top-6 left-0 h-1 bg-gray-200 w-full -z-10"></div>
          <div
            className="absolute top-6 left-0 h-1 bg-emerald-500 -z-5 transition-all duration-500"
            style={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            }}
          ></div>
        </div>
      </div>
    );
  };

  // Show loading spinner while verifying
  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
          <div className="w-full max-w-4xl mx-auto px-6 py-14 bg-white shadow-xl rounded-2xl border border-gray-100">
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-30"></div>
                <FontAwesomeIcon
                  icon={faSpinner}
                  className="text-7xl text-blue-500 animate-spin"
                />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mt-6 mb-2">
                Verifying your payment...
              </h2>
              <p className="text-gray-600 text-lg mt-3 max-w-lg text-center">
                Please wait while we confirm your order details. This may take a
                few moments.
              </p>
              <div className="mt-8 w-full max-w-md h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 animate-pulse rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!isValidRequest) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
          <div className="w-full max-w-4xl mx-auto px-6 py-14 bg-white shadow-xl rounded-2xl border border-red-100">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center">
                <FontAwesomeIcon
                  icon={faLock}
                  className="text-6xl text-red-500"
                />
              </div>
              <h2 className="text-3xl font-bold text-red-800 mt-6 mb-2">
                Invalid Payment Request
              </h2>
              <div className="h-1 w-24 bg-red-300 my-4 rounded-full"></div>
              <p className="text-gray-600 mt-3 max-w-lg text-center">
                We've detected an invalid payment request. This has been logged
                for security purposes.
              </p>
              <div className="mt-10">
                <Link
                  to="/"
                  className="px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-1 flex items-center space-x-2"
                >
                  <FontAwesomeIcon icon={faHome} />
                  <span>Back to Home</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
        <div className="w-full max-w-4xl mx-auto mt-20 px-6 py-10 bg-white shadow-xl rounded-2xl border border-gray-100">
          {/* Status Header */}
          <div className="flex flex-col items-center">
            <div
              className={`w-32 h-32 ${isSuccess ? 'bg-emerald-100' : 'bg-red-100'} rounded-full flex items-center justify-center`}
            >
              {isSuccess ? (
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className="text-7xl text-emerald-500"
                />
              ) : (
                <FontAwesomeIcon
                  icon={faTimesCircle}
                  className="text-7xl text-red-500"
                />
              )}
            </div>

            <h2
              className={`text-3xl md:text-4xl font-bold mt-6 ${
                isSuccess ? 'text-gray-800' : 'text-red-800'
              }`}
            >
              {isSuccess ? 'Thank You for Your Order!' : 'Payment Failed'}
            </h2>

            <div
              className={`h-1 w-24 ${isSuccess ? 'bg-emerald-300' : 'bg-red-300'} my-4 rounded-full`}
            ></div>

            <p
              className={`text-lg ${isSuccess ? 'text-gray-600' : 'text-red-600'} mt-3 max-w-lg text-center font-medium`}
            >
              {message}
            </p>
          </div>

          {/* Progress Stepper for Successful Orders */}
          {isSuccess && <ProgressStepper currentStep={progressStep} />}

          {isSuccess ? (
            <div className="mt-8">
              {/* Payment Info Card */}
              <div
                className={`bg-gradient-to-r ${paymentMethod === 'cod' ? 'from-amber-50 to-amber-100' : 'from-blue-50 to-blue-100'} p-5 rounded-xl mt-4 w-full shadow-md border ${paymentMethod === 'cod' ? 'border-amber-200' : 'border-blue-200'}`}
              >
                <div className="flex items-center justify-center mb-2">
                  <div
                    className={`w-12 h-12 ${paymentMethod === 'cod' ? 'bg-amber-200' : 'bg-blue-200'} rounded-full flex items-center justify-center mr-3`}
                  >
                    <FontAwesomeIcon
                      icon={
                        paymentMethod === 'cod' ? faMoneyBillWave : faCreditCard
                      }
                      className={`text-xl ${paymentMethod === 'cod' ? 'text-amber-700' : 'text-blue-700'}`}
                    />
                  </div>
                  <div>
                    <h3
                      className={`text-lg font-semibold ${paymentMethod === 'cod' ? 'text-amber-800' : 'text-blue-800'}`}
                    >
                      Payment Method
                    </h3>
                    <p
                      className={`${paymentMethod === 'cod' ? 'text-amber-900' : 'text-blue-900'} font-medium`}
                    >
                      {paymentMethod === 'cod'
                        ? 'Cash On Delivery'
                        : 'Online Payment'}
                    </p>
                  </div>
                </div>
                <p
                  className={`text-sm mt-2 ${paymentMethod === 'cod' ? 'text-amber-700' : 'text-blue-700'} text-center`}
                >
                  {paymentMethod === 'cod'
                    ? 'Payment will be collected upon delivery. No advance payment required.'
                    : 'Your payment has been processed successfully. Thank you!'}
                </p>
              </div>

              {/* Delivery Timeline */}
              <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-5 rounded-xl mt-6 w-full shadow-md border border-emerald-200">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-12 h-12 bg-emerald-200 rounded-full flex items-center justify-center mr-3">
                    <FontAwesomeIcon
                      icon={faShippingFast}
                      className="text-xl text-emerald-700"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-emerald-800">
                      Estimated Delivery
                    </h3>
                    <p className="text-emerald-900 font-medium">
                      3 - 5 Business Days
                    </p>
                  </div>
                </div>

                {/* Shipping Timeline */}
                <div className="relative mt-6 pt-2 pb-4">
                  <div className="absolute top-0 left-6 bottom-0 w-1 bg-emerald-200"></div>

                  <div className="flex mb-4 items-center">
                    <div className="z-10 flex items-center justify-center w-12 h-12 bg-emerald-500 rounded-full">
                      <FontAwesomeIcon icon={faBox} className="text-white" />
                    </div>
                    <div className="flex-grow ml-4">
                      <h3 className="font-semibold text-emerald-800">
                        Order Confirmed
                      </h3>
                      <p className="text-sm text-emerald-700">
                        Your order has been confirmed and will be processed
                        shortly.
                      </p>
                    </div>
                  </div>

                  <div className="flex mb-4 items-center">
                    <div className="z-10 flex items-center justify-center w-12 h-12 bg-emerald-200 rounded-full">
                      <FontAwesomeIcon
                        icon={faBoxOpen}
                        className="text-emerald-700"
                      />
                    </div>
                    <div className="flex-grow ml-4">
                      <h3 className="font-semibold text-emerald-800">
                        Packaging
                      </h3>
                      <p className="text-sm text-emerald-700">
                        Your items are being carefully packaged for shipping.
                      </p>
                    </div>
                  </div>

                  <div className="flex mb-4 items-center">
                    <div className="z-10 flex items-center justify-center w-12 h-12 bg-emerald-200 rounded-full">
                      <FontAwesomeIcon
                        icon={faShippingFast}
                        className="text-emerald-700"
                      />
                    </div>
                    <div className="flex-grow ml-4">
                      <h3 className="font-semibold text-emerald-800">
                        Shipping
                      </h3>
                      <p className="text-sm text-emerald-700">
                        Your package will be handed over to our shipping
                        partner.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="z-10 flex items-center justify-center w-12 h-12 bg-emerald-200 rounded-full">
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        className="text-emerald-700"
                      />
                    </div>
                    <div className="flex-grow ml-4">
                      <h3 className="font-semibold text-emerald-800">
                        Delivery
                      </h3>
                      <p className="text-sm text-emerald-700">
                        Your items will be delivered to your doorstep.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              {orderDetails && (
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl mt-6 w-full shadow-md border border-gray-200">
                  <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
                    <div className="flex items-center mb-4 sm:mb-0">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <FontAwesomeIcon
                          icon={faReceipt}
                          className="text-xl text-gray-700"
                        />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800">
                        Order Summary
                      </h3>
                    </div>
                    <div className="bg-gray-800 text-white px-4 py-2 rounded-lg">
                      Order #{orderDetails.OrderId}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <FontAwesomeIcon
                          icon={faUser}
                          className="text-gray-600 mt-1 mr-3"
                        />
                        <div>
                          <p className="text-sm text-gray-500">Full Name</p>
                          <p className="font-medium text-gray-800">
                            {orderDetails.Name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <FontAwesomeIcon
                          icon={faPhoneAlt}
                          className="text-gray-600 mt-1 mr-3"
                        />
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium text-gray-800">
                            {orderDetails.Phone}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <FontAwesomeIcon
                          icon={faMapMarkerAlt}
                          className="text-gray-600 mt-1 mr-3"
                        />
                        <div>
                          <p className="text-sm text-gray-500">
                            Delivery Address
                          </p>
                          <p className="font-medium text-gray-800">
                            {orderDetails.Address}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start">
                        <FontAwesomeIcon
                          icon={faCalendarAlt}
                          className="text-gray-600 mt-1 mr-3"
                        />
                        <div>
                          <p className="text-sm text-gray-500">Order Date</p>
                          <p className="font-medium text-gray-800">
                            {orderDetails.OrderDate}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <FontAwesomeIcon
                          icon={faCreditCard}
                          className="text-gray-600 mt-1 mr-3"
                        />
                        <div>
                          <p className="text-sm text-gray-500">
                            Payment Method
                          </p>
                          <p className="font-medium text-gray-800">
                            {paymentMethod === 'cod'
                              ? 'Cash On Delivery'
                              : 'Online Payment'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <FontAwesomeIcon
                          icon={faMoneyBillWave}
                          className="text-gray-600 mt-1 mr-3"
                        />
                        <div>
                          <p className="text-sm text-gray-500">Total Amount</p>
                          <p className="font-medium text-gray-800 text-lg">
                            $
                            {orderDetails.TotalPriceSale === 0
                              ? orderDetails.TotalPrice
                              : orderDetails.TotalPriceSale}
                          </p>
                          {/* Add exchange rate information */}
                          {paymentMethod === 'online' && !isLoadingRate && (
                            <p className="text-xs text-gray-500">
                              Exchange rate: 1 USD ={' '}
                              {exchangeRate.toLocaleString()} VND
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items Summary Card - Can be expanded with actual order items */}
                  <div className="bg-white p-4 rounded-lg mt-6 border border-gray-200">
                    <p className="text-gray-800 text-center font-medium">
                      A confirmation email has been sent to your inbox with
                      detailed order information.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Failure Content */
            <div className="mt-8">
              <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-xl mt-6 w-full shadow-md border border-red-200">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-red-200 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faExclamationTriangle}
                      className="text-3xl text-red-600"
                    />
                  </div>

                  <h3 className="text-xl font-semibold text-red-800 mt-4">
                    Payment Failed
                  </h3>

                  <div className="h-1 w-16 bg-red-300 my-3 rounded-full"></div>

                  <p className="text-red-700 text-center mt-2">
                    Order #{orderId || 'Unknown'}
                  </p>

                  <p className="text-gray-600 mt-4 max-w-lg text-center">
                    There was an issue processing your payment. Your order has
                    not been confirmed. If you believe this is an error, please
                    contact our customer support team.
                  </p>

                  <div className="bg-white p-4 rounded-lg mt-6 border border-red-200 w-full">
                    <div className="flex items-center justify-center">
                      <FontAwesomeIcon
                        icon={faHeadset}
                        className="text-red-600 mr-2"
                      />
                      <span className="text-red-800 font-medium">
                        Customer Support: 1-800-CARE-SKIN
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/"
              className={`px-8 py-4 ${
                isSuccess
                  ? 'bg-gradient-to-r from-gray-600 to-gray-700'
                  : 'bg-gradient-to-r from-gray-600 to-gray-700'
              } text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-1 flex items-center space-x-2 w-full sm:w-auto justify-center`}
            >
              <FontAwesomeIcon icon={faHome} />
              <span>Back to Home</span>
            </Link>

            {isSuccess ? (
              <Link
                to="/order-history"
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-1 flex items-center space-x-2 w-full sm:w-auto justify-center"
              >
                <FontAwesomeIcon icon={faHistory} />
                <span>View My Orders</span>
              </Link>
            ) : (
              <Link
                to="/contact"
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-1 flex items-center space-x-2 w-full sm:w-auto justify-center"
              >
                <FontAwesomeIcon icon={faHeadset} />
                <span>Contact Support</span>
              </Link>
            )}
          </div>
        </div>

        {/* Support banner */}
        <div className="w-full max-w-4xl mx-auto mt-8 px-6 py-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold">Need Help?</h3>
              <p className="text-blue-100">
                Our customer support team is available 24/7
              </p>
            </div>
            <Link
              to="/contact"
              className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-md hover:bg-blue-50 transition duration-300"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

const sendPaymentConfirmationEmail = async (
  orderId,
  email,
  customerName,
  paymentAmount,
  paymentMethod = 'VNPAY'
) => {
  try {
    if (!orderId || !email) {
      console.error(
        'Missing required parameters for payment confirmation email'
      );
      return;
    }

    const response = await fetch(
      `${backendUrl}/api/Email/send-payment-confirmation`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({
          OrderId: parseInt(orderId, 10),
          Email: email,
          CustomerName: customerName || 'Valued Customer',
          PaymentAmount: paymentAmount,
          PaymentMethod: paymentMethod, // Use the parameter
        }),
      }
    );

    // Rest of the function remains unchanged
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to send payment confirmation email:', errorText);
      throw new Error('Failed to send payment confirmation email');
    }

    console.log('Payment confirmation email sent successfully');
  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
    // We don't want to break the order flow if the email fails to send
    // Just log the error and continue
  }
};

export default OrderConfirmation;
