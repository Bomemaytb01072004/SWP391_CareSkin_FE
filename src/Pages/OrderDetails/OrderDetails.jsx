import React, { useEffect, useState } from 'react';
import {
  useSearchParams,
  useNavigate,
  useLocation,
  Link,
} from 'react-router-dom';
import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSpinner,
  faExclamationTriangle,
  faArrowLeft,
  faTruck,
  faCheck,
  faCreditCard,
  faBoxOpen,
  faTimes,
  faInfoCircle,
  faShippingFast,
  faMoneyBillWave,
  faTag,
} from '@fortawesome/free-solid-svg-icons';
import { generateProductSlug } from '../../utils/urlUtils';

const OrderDetails = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = searchParams.get('orderId');
  const [orderDetails, setOrderDetails] = useState(null);
  const [productDetails, setProductDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/Order/${orderId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch order details');
        }
        const data = await response.json();
        setOrderDetails(data);

        // Fetch product variation details for each product in the order
        const productPromises = data.OrderProducts.map((product) =>
          fetch(`${backendUrl}/api/Product/${product.ProductId}`)
            .then((res) => res.json())
            .catch((err) =>
              console.error(`Error fetching product ${product.ProductId}:`, err)
            )
        );

        const productResults = await Promise.all(productPromises);

        // Create a map of product details
        const productDetailsMap = {};
        productResults.forEach((productData, index) => {
          if (productData) {
            productDetailsMap[data.OrderProducts[index].ProductId] =
              productData;
          }
        });

        setProductDetails(productDetailsMap);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId, backendUrl]);

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return parseFloat(amount).toFixed(2);
  };

  // Get selected variation details
  const getVariationDetails = (productId, variationId) => {
    const product = productDetails[productId];
    if (!product || !product.Variations) return null;

    return (
      product.Variations.find((v) => v.ProductVariationId === variationId) ||
      null
    );
  };

  // Get status color and icon
  const getStatusDetails = (statusId, statusName) => {
    switch (Number(statusId)) {
      case 1:
        return {
          color: 'bg-yellow-100 text-yellow-800',
          bgColor: 'bg-yellow-50',
          icon: faInfoCircle,
          label: 'Pending',
        };
      case 2:
        return {
          color: 'bg-blue-100 text-blue-800',
          bgColor: 'bg-blue-50',
          icon: faShippingFast,
          label: 'Out For Delivery',
        };
      case 3:
        return {
          color: 'bg-purple-100 text-purple-800',
          bgColor: 'bg-purple-50',
          icon: faMoneyBillWave,
          label: 'Paid',
        };
      case 4:
        return {
          color: 'bg-green-100 text-green-800',
          bgColor: 'bg-green-50',
          icon: faCheck,
          label: 'Completed',
        };
      case 5:
        return {
          color: 'bg-red-100 text-red-800',
          bgColor: 'bg-red-50',
          icon: faTimes,
          label: 'Cancelled',
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          bgColor: 'bg-gray-50',
          icon: faInfoCircle,
          label: statusName || 'Unknown',
        };
    }
  };

  // Calculate the original total price (before discounts)
  const originalTotalPrice = orderDetails?.OrderProducts?.reduce(
    (total, item) => total + item.Price * item.Quantity,
    0
  );

  // Calculate the final sale price (after discounts)
  const finalSalePrice = orderDetails?.OrderProducts?.reduce(
    (total, item) => total + (item.SalePrice || item.Price) * item.Quantity,
    0
  );

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center py-32">
              <div className="animate-spin mr-3">
                <FontAwesomeIcon
                  icon={faSpinner}
                  size="2x"
                  className="text-emerald-500"
                />
              </div>
              <p className="text-emerald-600 font-medium text-lg">
                Loading order details...
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 my-8 text-center">
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                className="text-red-500 text-4xl mb-4"
              />
              <h2 className="text-2xl font-bold text-red-700 mb-2">
                Error Loading Order
              </h2>
              <p className="text-red-600 mb-6">{error}</p>
              <button
                onClick={() => navigate('/user-profile')}
                className="px-5 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                Return to Order History
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const statusDetails = orderDetails?.OrderStatusId
    ? getStatusDetails(orderDetails.OrderStatusId, orderDetails.OrderStatusName)
    : {
        color: 'bg-gray-100 text-gray-800',
        icon: faInfoCircle,
        label: 'Unknown',
      };

  // Calculate subtotal (before shipping)
  const subtotal = orderDetails.TotalPrice - (orderDetails.TotalPriceSale || 0);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <div className="mb-8">
            <button
              onClick={() => {
                navigate('/user-profile', {
                  state: location.state || {},
                });
              }}
              className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Back to Order History
            </button>
          </div>

          {/* Order Header */}
          <div className="bg-white rounded-lg shadow-lg mb-8 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Order #{orderId}
                  </h1>
                  <p className="text-gray-500 mt-1">
                    Placed on {formatDate(orderDetails?.OrderDate)}
                  </p>
                </div>
                <div className="mt-4 md:mt-0">
                  <span
                    className={`inline-flex items-center px-4 py-2 rounded-full ${statusDetails.color}`}
                  >
                    <FontAwesomeIcon
                      icon={statusDetails.icon}
                      className="mr-2"
                    />
                    {statusDetails.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Summary Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
              {/* Shipping Information */}
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                <h3 className="text-sm uppercase tracking-wide text-gray-500 font-semibold mb-3">
                  Shipping Information
                </h3>
                <div className="text-gray-900">
                  <p className="font-medium">{orderDetails?.Name || 'N/A'}</p>
                  <p className="mt-1">{orderDetails?.Address || 'N/A'}</p>
                  <p className="mt-1">{orderDetails?.Phone || 'N/A'}</p>
                  <p className="mt-1">{orderDetails?.Email || 'N/A'}</p>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                <h3 className="text-sm uppercase tracking-wide text-gray-500 font-semibold mb-3">
                  Payment Information
                </h3>
                <div className="text-gray-900">
                  <p>
                    Status:{' '}
                    <span className="text-purple-600 font-medium">Paid</span>
                  </p>
                  {orderDetails.PromotionId && (
                    <div className="mt-3 flex items-start">
                      <FontAwesomeIcon
                        icon={faTag}
                        className="text-emerald-500 mt-1 mr-2"
                      />
                      <div>
                        <p className="font-medium">Promotion Applied</p>
                        <p className="text-sm text-gray-600">
                          {orderDetails.PromotionName}
                        </p>
                        <p className="text-emerald-600 mt-1">
                          You saved $
                          {formatCurrency(originalTotalPrice - finalSalePrice)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                <h3 className="text-sm uppercase tracking-wide text-gray-500 font-semibold mb-3">
                  Order Summary
                </h3>
                <div className="text-gray-900">
                  <div className="flex justify-between mb-1">
                    <span>Original</span>
                    <span>${formatCurrency(originalTotalPrice)}</span>
                  </div>

                  {originalTotalPrice > finalSalePrice && (
                    <div className="flex justify-between mb-1 text-emerald-600">
                      <span>Discount</span>
                      <span>
                        -${formatCurrency(originalTotalPrice - finalSalePrice)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between font-medium text-lg mt-3 pt-3 border-t border-gray-200">
                    <span>Total</span>
                    <span className="text-emerald-600">
                      ${formatCurrency(finalSalePrice)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <h2 className="py-4 px-6 bg-gray-50 border-b border-gray-200 font-semibold text-gray-800">
              Order Items
            </h2>
            <div className="divide-y divide-gray-200">
              {orderDetails?.OrderProducts?.length > 0 ? (
                orderDetails.OrderProducts.map((item) => {
                  // Get variation details if available
                  const variationDetails = getVariationDetails(
                    item.ProductId,
                    item.ProductVariationId
                  );
                  const showSalePrice = item.SalePrice < item.Price;

                  return (
                    <div
                      key={`${item.ProductId}-${item.ProductVariationId}`}
                      className="p-6 flex items-center"
                    >
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        <Link
                          to={`/product/${generateProductSlug(item)}`}
                        >
                          <img
                            src={item.PictureUrl || '/placeholder-product.jpg'}
                            alt={item.ProductName || 'Product'}
                            className="h-full w-full object-cover object-center cursor-pointer"
                          />
                        </Link>
                      </div>
                      <div className="ml-6 flex-1 flex flex-col">
                        <div className="flex flex-col sm:flex-row sm:justify-between text-base font-medium text-gray-900">
                          <h3 className="mb-1 sm:mb-0">{item.ProductName}</h3>
                          <div className="flex flex-col items-end">
                            {showSalePrice ? (
                              <>
                                <p className="line-through text-sm text-gray-500">
                                  ${formatCurrency(item.Price)}
                                </p>
                                <p className="text-emerald-600">
                                  ${formatCurrency(item.SalePrice)}
                                </p>
                              </>
                            ) : (
                              <p>${formatCurrency(item.Price)}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mt-2">
                          <div className="text-sm text-gray-500">
                            <p>Quantity: {item.Quantity}</p>
                            {variationDetails && (
                              <p className="mt-1">
                                Size: {variationDetails.Ml}ml
                              </p>
                            )}
                          </div>
                          <p className="text-emerald-600 font-medium mt-2 sm:mt-0">
                            ${formatCurrency(item.SalePrice * item.Quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No items found in this order.
                </div>
              )}
            </div>

            {/* Order Totals */}
            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <div className="max-w-lg ml-auto">
                <div className="flex justify-between text-base font-medium text-gray-900 mb-2">
                  <p>Original</p>
                  <p>${formatCurrency(originalTotalPrice)}</p>
                </div>

                {originalTotalPrice > finalSalePrice && (
                  <div className="flex justify-between text-base font-medium text-emerald-600 mb-2">
                    <p>Discount</p>
                    <p>
                      -${formatCurrency(originalTotalPrice - finalSalePrice)}
                    </p>
                  </div>
                )}

                <div className="flex justify-between text-lg font-bold text-gray-900 pt-4 border-t border-gray-200">
                  <p>Total</p>
                  <p className="text-emerald-600">
                    ${formatCurrency(finalSalePrice)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate('/products')}
              className="px-6 py-3 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition text-center font-medium"
            >
              Continue Shopping
            </button>
            <button
              onClick={() =>
                navigate('/profile', {
                  state: location.state || {},
                })
              }
              className="px-6 py-3 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 transition text-center"
            >
              Back
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OrderDetails;
