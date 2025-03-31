import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faTimesCircle,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const OrderConfirmationMoMo = () => {
  const location = useLocation();
  const [isSuccess, setIsSuccess] = useState(null);
  const [message, setMessage] = useState('Verifying your order...');
  const [orderId, setOrderId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isValidRequest, setIsValidRequest] = useState(true);
  const [apiCallStatus, setApiCallStatus] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(24000); // Default fallback rate
  const [isLoadingRate, setIsLoadingRate] = useState(true);

  // Add updateOrderStatus function (similar to OrderConfirmation.jsx)
  const updateOrderStatus = async (orderId, status) => {
    try {
      // Make sure orderId and status are properly formatted
      const numericOrderId = parseInt(orderId, 10);
      const numericStatus = parseInt(status, 10);

      if (isNaN(numericOrderId) || isNaN(numericStatus)) {
        throw new Error('Invalid order ID or status');
      }

      console.log(
        `Updating order ${numericOrderId} to status ${numericStatus}`
      );

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

      console.log(`Order status updated successfully to ${numericStatus}`);
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  };

  // Add fetchOrderDetails function (similar to OrderConfirmation.jsx)
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
      return null;
    }
  };

  // Add this function to send payment confirmation emails
  const sendPaymentConfirmationEmail = async (orderDetails, amount) => {
    try {
      if (!orderDetails) {
        console.error('Cannot send email: Order details are missing');
        return false;
      }

      // Extract customer information from orderDetails
      const email = orderDetails.Customer?.Email || orderDetails.Email;
      const customerName =
        orderDetails.Customer?.FullName ||
        orderDetails.CustomerName ||
        'Valued Customer';
      const orderId = orderDetails.OrderId;

      // Use the amount from MoMo response or fall back to order total
      // Convert to USD using the dynamic exchange rate
      const paymentAmount = amount / exchangeRate || orderDetails.TotalAmount;
      console.log(
        `Converting ${amount} VND to USD using rate ${exchangeRate} = ${paymentAmount.toFixed(2)} USD`
      );

      if (!email || !orderId) {
        console.error(
          'Cannot send email: Missing required customer information',
          {
            email,
            orderId,
          }
        );
        return false;
      }

      console.log('Sending payment confirmation email to:', email);

      const emailPayload = {
        OrderId: orderId,
        Email: email,
        CustomerName: customerName,
        PaymentAmount: paymentAmount.toFixed(2),
        PaymentMethod: 'Momo',
      };

      console.log('Email confirmation payload:', emailPayload);

      const response = await fetch(
        `${backendUrl}/api/Email/send-payment-confirmation`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailPayload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to send payment confirmation email:', errorText);
        return false;
      }

      console.log('Payment confirmation email sent successfully');
      return true;
    } catch (error) {
      console.error('Error sending payment confirmation email:', error);
      return false;
    }
  };

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

  useEffect(() => {
    const verifyMoMoCallback = async () => {
      try {
        const queryParams = new URLSearchParams(location.search);
        const orderIdParam = queryParams.get('orderId');
        const resultCode = queryParams.get('resultCode');

        // Extract all required parameters for the API call
        const partnerCode = queryParams.get('partnerCode');
        const requestId = queryParams.get('requestId');
        const amount = queryParams.get('amount');
        const orderInfo = queryParams.get('orderInfo');
        const orderType = queryParams.get('orderType');
        const transId = queryParams.get('transId');
        const message = queryParams.get('message');
        const responseTime = queryParams.get('responseTime');
        const signature = queryParams.get('signature');

        // Basic validation: Check if required parameters exist
        if (!orderIdParam || !resultCode) {
          console.error('Missing required MoMo parameters');
          setIsValidRequest(false);
          setIsSuccess(false);
          setMessage('Invalid payment data. Please contact support.');
          setIsLoading(false);
          return;
        }

        // Extract the numeric orderId from the MoMo orderId format (e.g., "ORDER_76_1742322073" -> "76")
        const orderIdMatch = orderIdParam.match(/ORDER_(\d+)_/);
        const extractedOrderId = orderIdMatch ? orderIdMatch[1] : null;

        if (!extractedOrderId) {
          console.error(
            'Could not extract numeric order ID from:',
            orderIdParam
          );
          setIsValidRequest(false);
          setIsSuccess(false);
          setMessage('Invalid order ID format. Please contact support.');
          setIsLoading(false);
          return;
        }

        setOrderId(extractedOrderId);
        console.log(
          `Extracted Order ID: ${extractedOrderId} from ${orderIdParam}`
        );

        // Send data to MoMo IPN API
        const payloadToSend = {
          callbackDto: {
            // Wrap everything in callbackDto
            partnerCode: partnerCode,
            orderId: orderIdParam,
            requestId: requestId,
            amount: Number(amount),
            orderInfo: orderInfo,
            orderType: orderType,
            transId: transId, // Keep as string, don't convert to Number
            resultCode: Number(resultCode),
            message: message,
            payType: '',
            responseTime: Number(responseTime),
            extraData: '',
            signature: signature,
          },
        };

        console.log('Sending to MoMo IPN API:', payloadToSend);

        // Call the MoMo IPN API
        const response = await fetch(`${backendUrl}/api/momo/momo_ipn`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payloadToSend),
        });

        const responseData = await response.json();
        console.log('MoMo IPN API response:', responseData);

        if (response.ok) {
          setApiCallStatus('success');
        } else {
          setApiCallStatus('failed');
          console.error('API call failed:', responseData);
        }

        // MoMo uses '0' as the success resultCode
        const isPaymentSuccess = resultCode === '0';

        // Update order status based on payment result
        if (isPaymentSuccess) {
          // Update order status to 3 (payment successful)
          await updateOrderStatus(extractedOrderId, 3);

          // Fetch order details
          const details = await fetchOrderDetails(extractedOrderId);
          if (details) {
            setOrderDetails(details);

            // Wait until exchange rate is loaded before sending email
            if (!isLoadingRate) {
              // Send payment confirmation email with dynamic exchange rate
              await sendPaymentConfirmationEmail(details, Number(amount));
            } else {
              // If rate isn't loaded yet, wait briefly then try again
              setTimeout(async () => {
                await sendPaymentConfirmationEmail(details, Number(amount));
              }, 1000);
            }
          }

          // Rest of the code remains the same
          setIsSuccess(true);
          setMessage(
            'Order payment successful! Your order is now being processed.'
          );

          // Store successful transaction in localStorage to prevent URL manipulation
          const successfulTxn = {
            orderId: extractedOrderId,
            transId: transId,
            timestamp: Date.now(),
            status: 'success',
          };
          localStorage.setItem(
            `momo_txn_${transId}`,
            JSON.stringify(successfulTxn)
          );
        } else {
          // Update order status to 5 (payment failed)
          await updateOrderStatus(extractedOrderId, 5);

          setIsSuccess(false);
          setMessage(
            'Order payment failed. Please try again or contact support.'
          );

          // Store failed transaction in localStorage
          const failedTxn = {
            orderId: extractedOrderId,
            transId: transId,
            timestamp: Date.now(),
            status: 'failed',
          };
          localStorage.setItem(
            `momo_txn_${transId}`,
            JSON.stringify(failedTxn)
          );
        }
      } catch (error) {
        console.error('Error processing MoMo callback:', error);
        setApiCallStatus('failed');
        setIsSuccess(false);
        setMessage('Error verifying payment. Please contact support.');
      } finally {
        setIsLoading(false);
      }
    };

    // Check if transaction was already processed (prevents URL manipulation)
    const checkExistingTransaction = () => {
      try {
        const queryParams = new URLSearchParams(location.search);
        const transId = queryParams.get('transId');

        if (transId) {
          const existingTxn = localStorage.getItem(`momo_txn_${transId}`);

          if (existingTxn) {
            const txnData = JSON.parse(existingTxn);

            setOrderId(txnData.orderId);

            // Use stored transaction result instead of URL parameters
            if (txnData.status === 'success') {
              setIsSuccess(true);
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
      } catch (error) {
        console.error('Error checking existing transaction:', error);
        return false;
      }
    };

    // Only process if not already handled
    if (!checkExistingTransaction()) {
      verifyMoMoCallback();
    }
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
            {apiCallStatus && (
              <p
                className={`text-sm mt-2 ${apiCallStatus === 'success' ? 'text-emerald-600' : 'text-amber-600'}`}
              >
                {apiCallStatus === 'success'
                  ? 'Payment verification completed.'
                  : 'Payment verification system encountered an issue. Your order is still being processed.'}
              </p>
            )}

            {orderId && (
              <div className="bg-gray-100 px-4 py-2 mt-4 rounded-lg">
                <span className="text-gray-700 font-medium">Order ID: </span>
                <span className="text-gray-900">{orderId}</span>
              </div>
            )}

            {/* Add exchange rate information */}
            {!isLoadingRate && isSuccess && (
              <div className="bg-blue-50 px-4 py-2 mt-2 rounded-lg text-sm">
                <span className="text-blue-700 font-medium">
                  Exchange Rate:{' '}
                </span>
                <span className="text-blue-900">
                  1 USD = {exchangeRate.toLocaleString()} VND
                </span>
              </div>
            )}
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/"
              className="px-8 py-4 bg-gray-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition duration-300 w-full sm:w-auto text-center"
            >
              Back to Home
            </Link>
            {isSuccess && (
              <Link
                to="/order-history"
                className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition duration-300 w-full sm:w-auto text-center"
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
