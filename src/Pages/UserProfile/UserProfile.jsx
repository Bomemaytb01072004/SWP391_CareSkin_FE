import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';
import bgImage from '../../assets/bg-login.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faLock,
  faShoppingBag,
  faBell,
  faEdit,
  faSave,
  faTimes,
  faInfoCircle,
  faChevronRight,
  faBox,
  faTruck,
  faCheckCircle,
  faTimesCircle,
  faSpinner,
  faTag,
  faSearch,
  faExclamationTriangle,
  faMoneyBill,
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
  faAngleLeft,
  faAngleRight,
  faAngleDoubleLeft,
  faAngleDoubleRight,
} from '@fortawesome/free-solid-svg-icons';
import { format } from 'date-fns';

const UserProfile = () => {
  // Keep existing state variables
  const [user, setUser] = useState({
    CustomerId: null,
    UserName: '',
    Email: '',
    FullName: '',
    Phone: '',
    Dob: '',
    Gender: '',
    PictureUrl: '',
    Address: '',
  });

  const [token, setToken] = useState(localStorage.getItem('token'));
  const [CustomerId, setCustomerId] = useState(
    localStorage.getItem('CustomerId')
  );
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('Account');
  const [orderHistory, setOrderHistory] = useState([]);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [previewImage, setPreviewImage] = useState(null);

  // Add new state variables for order filtering and details
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Add these pagination state variables near your other state variables
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(4);

  // Add this effect at the top level (not inside renderOrderHistory)
  useEffect(() => {
    // Reset to page 1 when filters change
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const nextPage = () => {
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const firstPage = () => setCurrentPage(1);

  const lastPage = () => {
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    setCurrentPage(totalPages);
  };

  // Keep existing useEffects and functions...

  useEffect(() => {
    if (!token) {
      console.error('No token found. User is not logged in.');
      return;
    }

    if (!CustomerId) {
      try {
        const decodedToken = jwtDecode(token);

        if (decodedToken.CustomerId) {
          setCustomerId(decodedToken.CustomerId);
          localStorage.setItem('CustomerId', decodedToken.CustomerId);
        } else {
          console.error('CustomerId not found in token');
          return; // Stop execution if no CustomerId
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        return;
      }
    }
  }, [token]);

  useEffect(() => {
    if (!CustomerId) {
      console.error('No CustomerId found, skipping API request.');
      return;
    }

    fetch(`http://careskinbeauty.shop:4456/api/Customer/${CustomerId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error fetching profile: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setUser({
          CustomerId: data.CustomerId,
          UserName: data.UserName,
          Email: data.Email || '',
          FullName: data.FullName || '',
          Phone: data.Phone || '',
          Dob: data.Dob ? data.Dob.split('T')[0] : '',
          Gender: data.Gender || '',
          PictureUrl: data.PictureUrl || 'https://via.placeholder.com/150',
          Address: data.Address || '',
        });
      })
      .catch((error) => console.error('Error fetching profile:', error));
  }, [CustomerId, token]);

  useEffect(() => {
    if (activeTab === 'Order History' && CustomerId) {
      fetchOrderHistory();
    }
  }, [activeTab, CustomerId]);

  const fetchOrderHistory = async () => {
    setOrderLoading(true);
    setOrderError('');
    try {
      const response = await fetch(
        `http://careskinbeauty.shop:4456/api/Order/customer/${CustomerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error fetching orders: ${response.status}`);
      }

      const data = await response.json();
      console.log('Orders data structure:', data); // Log to verify the structure
      setOrderHistory(data);
    } catch (error) {
      console.error('Error fetching order history:', error);
      setOrderError('Failed to load order history. Please try again later.');
    } finally {
      setOrderLoading(false);
    }
  };

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('FullName', user.FullName);
    formData.append('Email', user.Email);
    formData.append('Phone', user.Phone);
    formData.append('Dob', user.Dob);
    formData.append('Gender', user.Gender);
    formData.append('Address', user.Address);

    if (selectedFile) {
      formData.append('PictureFile', selectedFile);
    }

    try {
      const response = await fetch(
        `http://careskinbeauty.shop:4456/api/Customer/${CustomerId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const responseData = await response.json();
      console.log('Update response status:', response.status);
      console.log('Update response data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to update profile');
      }

      setMessage('Profile updated successfully!');
      setEditMode(false);

      // Update the user state with the new picture if uploaded
      if (selectedFile && responseData.PictureUrl) {
        setUser({ ...user, PictureUrl: responseData.PictureUrl });
      }

      // Clear preview and selected file
      setPreviewImage(null);
      setSelectedFile(null);
    } catch (error) {
      setMessage('Error updating profile. Please try again.');
      console.error('Update error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle expanded order view
  const toggleOrderDetails = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  // Filter orders based on search and filter status
  const filteredOrders = orderHistory
    .filter((order) => {
      if (filterStatus === 'all') return true;
      return order.OrderStatusId === parseInt(filterStatus);
    })
    .filter((order) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        order.OrderId.toString().includes(term) ||
        (order.OrderStatusName &&
          order.OrderStatusName.toLowerCase().includes(term)) ||
        (order.PromotionName &&
          order.PromotionName.toLowerCase().includes(term)) ||
        (order.OrderProducts &&
          order.OrderProducts.some((product) =>
            product.ProductName.toLowerCase().includes(term)
          ))
      );
    })
    // Sort orders by OrderId in descending order (highest to lowest)
    .sort((a, b) => b.OrderId - a.OrderId);

  // Updated getStatusDetails function based on OrderStatusId
  const getStatusDetails = (statusId, statusName) => {
    let color = 'bg-gray-100 text-gray-800';
    let icon = faInfoCircle;
    let label = statusName || 'Unknown';

    switch (statusId) {
      case 1:
        color = 'bg-yellow-100 text-yellow-800';
        icon = faSpinner;
        break;
      case 2:
        color = 'bg-blue-100 text-blue-800';
        icon = faMoneyBill;
        break;
      case 3:
        color = 'bg-green-100 text-green-800';
        icon = faBox;
        break;
      case 4:
        color = 'bg-indigo-100 text-indigo-800';
        icon = faTruck;
        break;
      case 5:
        color = 'bg-red-100 text-red-800';
        icon = faTimesCircle;
        break;
      case 6:
        color = 'bg-emerald-100 text-emerald-800';
        icon = faCheckCircle;
        break;
      default:
        break;
    }

    return { color, icon, label };
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString || 'Invalid date';
    }
  };

  // Update your renderOrderHistory function to include pagination
  const renderOrderHistory = () => {
    // Calculate total pages
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

    // Get current orders for display
    const indexOfLastOrder = currentPage * itemsPerPage;
    const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
    const currentOrders = filteredOrders.slice(
      indexOfFirstOrder,
      indexOfLastOrder
    );

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-2 border border-gray-300 max-w-36 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
            </div>

            {/* Start Date Input */}
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border text-center border-gray-300 max-w-36 rounded-lg py-2 px-1 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />

            {/* End Date Input */}
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border text-center border-gray-300 max-w-36 rounded-lg py-2 px-1 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border max-w-36 border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            >
              <option value="all">All Statuses</option>
              <option value="1">Pending</option>
              <option value="2">Out Of Delivery</option>
              <option value="3">Paid</option>
              <option value="4">Completed</option>
              <option value="5">Cancelled</option>
            </select>
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
                fetchOrderHistory;
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md transition duration-200"
            >
              Reset
            </button>
          </div>
        </div>

        {orderLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin mr-3">
              <FontAwesomeIcon
                icon={faSpinner}
                size="2x"
                className="text-emerald-500"
              />
            </div>
            <p className="text-emerald-600 font-medium">
              Loading your orders...
            </p>
          </div>
        ) : orderError ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-lg">
            <div className="flex items-center">
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                className="text-red-500 mr-3"
              />
              <div>
                <p className="font-medium">Failed to load orders</p>
                <p>{orderError}</p>
              </div>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
              <FontAwesomeIcon
                icon={faShoppingBag}
                className="text-gray-400 text-3xl"
              />
            </div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">
              No Orders Found
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {searchTerm || filterStatus !== 'all'
                ? 'No orders match your search criteria. Try adjusting your filters.'
                : "You haven't placed any orders yet. Start shopping to see your orders here!"}
            </p>
            <a
              href="/products"
              className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition"
            >
              Browse Products
            </a>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {currentOrders.map((order) => (
                <div
                  key={order.OrderId}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition"
                >
                  {/* Order Header */}
                  <div
                    onClick={() => toggleOrderDetails(order.OrderId)}
                    className="bg-gray-50 p-4 flex flex-wrap items-center justify-between gap-3 cursor-pointer"
                  >
                    <div>
                      <div className="text-xs text-gray-500">Order ID</div>
                      <div className="font-medium text-gray-900">
                        #{order.OrderId}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500">Date</div>
                      <div className="font-medium">
                        {formatDate(order.OrderDate)}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500">Total</div>
                      <div className="font-medium text-emerald-600">
                        ${(order.TotalPrice || 0).toFixed(2)}
                      </div>
                    </div>

                    <div>
                      {order.OrderStatusId && (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center ${
                            getStatusDetails(
                              order.OrderStatusId,
                              order.OrderStatusName
                            ).color
                          }`}
                        >
                          <FontAwesomeIcon
                            icon={
                              getStatusDetails(
                                order.OrderStatusId,
                                order.OrderStatusName
                              ).icon
                            }
                            className="mr-1"
                          />
                          {
                            getStatusDetails(
                              order.OrderStatusId,
                              order.OrderStatusName
                            ).label
                          }
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleOrderDetails(order.OrderId);
                      }}
                      className="ml-auto"
                    >
                      <FontAwesomeIcon
                        icon={faChevronRight}
                        className={`text-gray-500 transform transition-transform ${
                          expandedOrderId === order.OrderId ? 'rotate-90' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {/* Order Details (Expanded) */}
                  {expandedOrderId === order.OrderId && (
                    <div className="p-5 border-t border-gray-200">
                      {/* Order info sections */}
                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        {/* Customer Info */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                            <FontAwesomeIcon
                              icon={faUser}
                              className="text-gray-500 mr-2"
                            />
                            Customer Information
                          </h4>
                          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                            <div className="flex items-start">
                              <FontAwesomeIcon
                                icon={faUser}
                                className="text-gray-400 mt-1 w-5"
                              />
                              <div className="ml-2">
                                <div className="text-sm text-gray-500">
                                  Name
                                </div>
                                <div className="font-medium">{order.Name}</div>
                              </div>
                            </div>
                            <div className="flex items-start">
                              <FontAwesomeIcon
                                icon={faEnvelope}
                                className="text-gray-400 mt-1 w-5"
                              />
                              <div className="ml-2">
                                <div className="text-sm text-gray-500">
                                  Email
                                </div>
                                <div className="font-medium">{order.Email}</div>
                              </div>
                            </div>
                            <div className="flex items-start">
                              <FontAwesomeIcon
                                icon={faPhone}
                                className="text-gray-400 mt-1 w-5"
                              />
                              <div className="ml-2">
                                <div className="text-sm text-gray-500">
                                  Phone
                                </div>
                                <div className="font-medium">{order.Phone}</div>
                              </div>
                            </div>
                            <div className="flex items-start">
                              <FontAwesomeIcon
                                icon={faMapMarkerAlt}
                                className="text-gray-400 mt-1 w-5"
                              />
                              <div className="ml-2">
                                <div className="text-sm text-gray-500">
                                  Address
                                </div>
                                <div className="font-medium">
                                  {order.Address}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Order Summary */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                            <FontAwesomeIcon
                              icon={faTag}
                              className="text-gray-500 mr-2"
                            />
                            Order Summary
                          </h4>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between mb-2">
                              <span className="text-gray-600">Status:</span>
                              <span className="font-medium">
                                {order.OrderStatusName}
                              </span>
                            </div>

                            <div className="flex justify-between mb-2">
                              <span className="text-gray-600">Subtotal:</span>
                              <span className="font-medium">
                                $
                                {(
                                  (order.TotalPrice || 0) +
                                  (order.TotalPriceSale || 0)
                                ).toFixed(2)}
                              </span>
                            </div>

                            {order.TotalPriceSale > 0 && (
                              <div className="flex justify-between mb-2 text-green-600">
                                <span>Discount:</span>
                                <span>
                                  -${(order.TotalPriceSale || 0).toFixed(2)}
                                </span>
                              </div>
                            )}

                            {order.PromotionName && (
                              <div className="flex justify-between mb-2">
                                <span className="text-gray-600">
                                  Promotion:
                                </span>
                                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium">
                                  {order.PromotionName}
                                </span>
                              </div>
                            )}

                            <div className="flex justify-between font-bold mt-2 pt-2 border-t border-gray-200">
                              <span>Total:</span>
                              <span className="text-emerald-600">
                                ${(order.TotalPrice || 0).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Order Products */}
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <FontAwesomeIcon
                          icon={faBox}
                          className="text-gray-500 mr-2"
                        />
                        Products
                      </h4>

                      <div className="space-y-3 mb-4">
                        {order.OrderProducts &&
                          order.OrderProducts.map((product, idx) => (
                            <div
                              key={`${order.OrderId}-product-${idx}`}
                              className="flex items-center p-3 bg-gray-50 rounded-lg"
                            >
                              {/* Product image */}
                              <div className="w-16 h-16 rounded-md overflow-hidden border border-gray-200 bg-white flex-shrink-0">
                                {product.PictureUrl ? (
                                  <img
                                    src={product.PictureUrl}
                                    alt={product.ProductName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                                    No image
                                  </div>
                                )}
                              </div>

                              {/* Product info */}
                              <div className="ml-4 flex-grow">
                                <h5 className="font-medium text-gray-900">
                                  {product.ProductName}
                                </h5>
                                <div className="text-sm text-gray-500 flex flex-wrap items-center gap-x-3 mt-1">
                                  <span>Qty: {product.Quantity}</span>
                                  {product.Price !== product.SalePrice ? (
                                    <div>
                                      <span className="line-through mr-1">
                                        ${(product.Price || 0).toFixed(2)}
                                      </span>
                                      <span className="text-emerald-600 font-medium">
                                        ${(product.SalePrice || 0).toFixed(2)}
                                      </span>
                                    </div>
                                  ) : (
                                    <span>
                                      ${(product.Price || 0).toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Product subtotal */}
                              <div className="text-right">
                                <div className="font-medium text-emerald-600">
                                  $
                                  {(
                                    (product.SalePrice || product.Price || 0) *
                                    product.Quantity
                                  ).toFixed(2)}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap justify-between items-center pt-3 border-t border-gray-200">
                        <a
                          href={`/order-details/${order.OrderId}`}
                          className="text-blue-600 hover:text-blue-800 flex items-center transition"
                        >
                          View Order Details
                          <FontAwesomeIcon
                            icon={faChevronRight}
                            className="ml-1 text-xs"
                          />
                        </a>

                        {(order.OrderStatusId === 4 ||
                          order.OrderStatusId === 6) && (
                          <a
                            href={`/review/${order.OrderId}`}
                            className="px-4 py-2 bg-amber-100 text-amber-700 rounded-md hover:bg-amber-200 transition"
                          >
                            Write a Review
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination UI */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {indexOfFirstOrder + 1}-
                  {Math.min(indexOfLastOrder, filteredOrders.length)} of{' '}
                  {filteredOrders.length} orders
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={firstPage}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-md ${
                      currentPage === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <FontAwesomeIcon icon={faAngleDoubleLeft} />
                  </button>
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-md ${
                      currentPage === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <FontAwesomeIcon icon={faAngleLeft} />
                  </button>

                  {/* Page buttons - Show max 5 page numbers with current in middle */}
                  {Array.from({ length: Math.min(5, totalPages) }).map(
                    (_, idx) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = idx + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = idx + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + idx;
                      } else {
                        pageNumber = currentPage - 2 + idx;
                      }

                      if (pageNumber > 0 && pageNumber <= totalPages) {
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => paginate(pageNumber)}
                            className={`w-10 h-10 flex items-center justify-center rounded-md ${
                              currentPage === pageNumber
                                ? 'bg-emerald-600 text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      }
                      return null;
                    }
                  )}

                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-md ${
                      currentPage === totalPages
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <FontAwesomeIcon icon={faAngleRight} />
                  </button>
                  <button
                    onClick={lastPage}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-md ${
                      currentPage === totalPages
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <FontAwesomeIcon icon={faAngleDoubleRight} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  // Update renderTabContent to use the new renderOrderHistory function
  const renderTabContent = () => {
    switch (activeTab) {
      case 'Account':
        // Keep existing Account tab code
        return (
          <>
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-800">
                Account Settings
              </h2>
              <button
                onClick={() => setEditMode(!editMode)}
                className={`${
                  editMode
                    ? 'bg-gray-500'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                } text-white px-4 py-2 rounded-md transition flex items-center gap-2`}
              >
                <FontAwesomeIcon icon={editMode ? faTimes : faEdit} />
                {editMode ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {/* Keep existing account form */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-gray-600 text-sm font-medium">
                  Full Name
                </label>
                <input
                  type="text"
                  name="FullName"
                  value={user.FullName}
                  onChange={handleChange}
                  disabled={!editMode}
                  className={`mt-1 w-full border p-3 rounded-md focus:ring ${
                    editMode
                      ? 'focus:ring-blue-200 border-blue-300'
                      : 'bg-gray-50'
                  }`}
                />
              </div>
              <div>
                <label className="text-gray-600 text-sm font-medium">
                  Email
                </label>
                <input
                  type="Email"
                  name="Email"
                  value={user.Email}
                  disabled
                  className="mt-1 w-full border p-3 rounded-md bg-gray-50 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed
                </p>
              </div>
              <div>
                <label className="text-gray-600 text-sm font-medium">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="Phone"
                  value={user.Phone}
                  onChange={handleChange}
                  disabled={!editMode}
                  className={`mt-1 w-full border p-3 rounded-md focus:ring ${
                    editMode
                      ? 'focus:ring-blue-200 border-blue-300'
                      : 'bg-gray-50'
                  }`}
                />
              </div>
              <div>
                <label className="text-gray-600 text-sm font-medium">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="Dob"
                  value={user.Dob}
                  onChange={handleChange}
                  disabled={!editMode}
                  className={`mt-1 w-full border p-3 rounded-md focus:ring ${
                    editMode
                      ? 'focus:ring-blue-200 border-blue-300'
                      : 'bg-gray-50'
                  }`}
                />
              </div>
              <div>
                <label className="text-gray-600 text-sm font-medium">
                  Gender
                </label>
                <select
                  name="Gender"
                  value={user.Gender}
                  onChange={handleChange}
                  disabled={!editMode}
                  className={`mt-1 w-full border p-3 rounded-md focus:ring ${
                    editMode
                      ? 'focus:ring-blue-200 border-blue-300'
                      : 'bg-gray-50'
                  }`}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-gray-600 text-sm font-medium">
                  Address
                </label>
                <input
                  type="text"
                  name="Address"
                  value={user.Address}
                  onChange={handleChange}
                  disabled={!editMode}
                  className={`mt-1 w-full border p-3 rounded-md focus:ring ${
                    editMode
                      ? 'focus:ring-blue-200 border-blue-300'
                      : 'bg-gray-50'
                  }`}
                />
              </div>
            </div>

            {editMode && (
              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleUpdate}
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin">
                        <FontAwesomeIcon icon={faSpinner} />
                      </span>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faSave} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {message && (
              <div
                className={`mt-4 p-3 rounded-md ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
              >
                {message}
              </div>
            )}
          </>
        );

      case 'Order History':
        return renderOrderHistory();

      case 'Password':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Password Management
            </h2>
            <p className="text-gray-600">
              Password change functionality coming soon!
            </p>
          </div>
        );

      case 'Notification':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Notification Settings
            </h2>
            <p className="text-gray-600">
              Notification preferences coming soon!
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  // Rest of the component remains the same...
  return (
    <>
      <Navbar />
      <div
        className="min-h-screen flex items-center justify-center bg-cover py-16 bg-center p-4"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="w-full max-w-6xl bg-white shadow-lg rounded-xl flex flex-col md:flex-row overflow-hidden">
          {/* Sidebar - Responsive */}
          <div className="w-full md:w-1/3 bg-gray-50 p-6 border-r border-gray-200">
            <div className="flex flex-col items-center mb-8">
              <div className="relative group mb-3">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-emerald-500 shadow-md">
                  <img
                    src={previewImage || user.PictureUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                {editMode && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <label className="w-full h-full cursor-pointer flex items-center justify-center bg-black bg-opacity-50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <FontAwesomeIcon icon={faEdit} />
                      <span className="sr-only">Change Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
              <h2 className="font-bold text-xl text-gray-800">
                {user.FullName || 'User'}
              </h2>
              <p className="text-gray-500 text-sm">{user.Email}</p>
            </div>

            <nav>
              <ul className="space-y-1">
                {[
                  { id: 'Account', label: 'Account Settings', icon: faUser },
                  { id: 'Password', label: 'Password', icon: faLock },
                  {
                    id: 'Order History',
                    label: 'Order History',
                    icon: faShoppingBag,
                  },
                  { id: 'Notification', label: 'Notifications', icon: faBell },
                ].map((tab) => (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left p-3 rounded-lg flex items-center transition ${
                        activeTab === tab.id
                          ? 'bg-emerald-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={tab.icon}
                        className="w-5 h-5 mr-3"
                      />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mt-auto pt-6 text-center">
              <p className="text-xs text-gray-500">
                Need help?{' '}
                <a href="/contact" className="text-emerald-600 hover:underline">
                  Contact Support
                </a>
              </p>
            </div>
          </div>

          {/* Main Content - Responsive */}
          <div className="w-full md:w-2/3 p-6 md:p-8 bg-white">
            {renderTabContent()}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UserProfile;
