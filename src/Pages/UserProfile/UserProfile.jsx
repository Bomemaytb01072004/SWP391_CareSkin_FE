import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';
import { Link, useNavigate } from 'react-router-dom';
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
  faEye,
  faEyeSlash,
  faHeadset,
  faStar,
  faComment,
  faTrash,
  faImage,
  faAngleDown,
  faAngleUp,
} from '@fortawesome/free-solid-svg-icons';
import { format } from 'date-fns';
import { useLocation } from 'react-router-dom';
import { generateProductSlug } from '../../utils/urlUtils';
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const UserProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();

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

  // State for user reviews
  const [userReviews, setUserReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState('');
  const [selectedReviewImages, setSelectedReviewImages] = useState([]);
  const [reviewLightboxOpen, setReviewLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [expandedReviewId, setExpandedReviewId] = useState(null);
  const [reviewsPage, setReviewsPage] = useState(1);
  const reviewsPerPage = 5;

  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const [resetEmail, setResetEmail] = useState('');
  const [resetStep, setResetStep] = useState(0);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetOTP, setResetOTP] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
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
          return;
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

    fetch(`${backendUrl}/api/Customer/${CustomerId}`, {
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

    if (activeTab === 'My Reviews' && CustomerId) {
      fetchUserReviews();
    }
  }, [activeTab, CustomerId]);

  useEffect(() => {
    if (location.state) {
      if (location.state.activeTab) {
        setActiveTab(location.state.activeTab);
      }

      if (location.state.currentPage)
        setCurrentPage(location.state.currentPage);
      if (location.state.searchTerm !== undefined)
        setSearchTerm(location.state.searchTerm);
      if (location.state.filterStatus !== undefined)
        setFilterStatus(location.state.filterStatus);
      if (location.state.startDate !== undefined)
        setStartDate(location.state.startDate);
      if (location.state.endDate !== undefined)
        setEndDate(location.state.endDate);

      if (location.state.scrollPosition) {
        setTimeout(() => {
          window.scrollTo(0, location.state.scrollPosition);
        }, 100);
      }
    }
  }, [location.state]);

  const fetchOrderHistory = async () => {
    setOrderLoading(true);
    setOrderError('');
    try {
      const response = await fetch(
        `${backendUrl}/api/Order/customer/${CustomerId}`,
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
      console.log('Orders data structure:', data);
      setOrderHistory(data);
    } catch (error) {
      console.error('Error fetching order history:', error);
      setOrderError('Failed to load order history. Please try again later.');
    } finally {
      setOrderLoading(false);
    }
  };

  const fetchUserReviews = async () => {
    setReviewsLoading(true);
    setReviewsError('');
    try {
      const response = await fetch(
        `${backendUrl}/api/RatingFeedback/RatingFeedback/my-ratings/${CustomerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error fetching reviews: ${response.status}`);
      }

      const data = await response.json();
      console.log('User reviews data:', data);
      setUserReviews(data);
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      setReviewsError('Failed to load your reviews. Please try again later.');
    } finally {
      setReviewsLoading(false);
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
      const response = await fetch(`${backendUrl}/api/Customer/${CustomerId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const responseData = await response.json();
      console.log('Update response status:', response.status);
      console.log('Update response data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to update profile');
      }

      setMessage('Profile updated successfully!');
      setEditMode(false);

      if (selectedFile && responseData.PictureUrl) {
        setUser({ ...user, PictureUrl: responseData.PictureUrl });
      }

      setPreviewImage(null);
      setSelectedFile(null);
    } catch (error) {
      setMessage('Error updating profile. Please try again.');
      console.error('Update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

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
    .filter((order) => {
      if (!startDate && !endDate) return true;

      const orderDate = new Date(order.OrderDate);

      if (startDate && !endDate) {
        return orderDate >= new Date(startDate);
      }

      if (!startDate && endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        return orderDate <= endOfDay;
      }

      const startDateTime = new Date(startDate);
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);

      return orderDate >= startDateTime && orderDate <= endDateTime;
    })
    .sort((a, b) => b.OrderId - a.OrderId);

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

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString || 'Invalid date';
    }
  };

  const viewOrderDetails = (orderId) => {
    const scrollPosition = window.scrollY;
    navigate(`/order-details?orderId=${orderId}`, {
      state: {
        scrollPosition,
        activeTab,
        currentPage,
        searchTerm,
        filterStatus,
        startDate,
        endDate,
      },
    });
  };

  const openLightbox = (images, index) => {
    setSelectedReviewImages(images);
    setCurrentImageIndex(index);
    setReviewLightboxOpen(true);
  };

  const closeLightbox = () => {
    setReviewLightboxOpen(false);
    setSelectedReviewImages([]);
    setCurrentImageIndex(0);
  };

  const navigateImage = (direction) => {
    const newIndex = currentImageIndex + direction;
    if (newIndex >= 0 && newIndex < selectedReviewImages.length) {
      setCurrentImageIndex(newIndex);
    }
  };

  const formatReviewDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy h:mm a');
    } catch (error) {
      return dateString || 'Invalid date';
    }
  };

  const renderOrderHistory = () => {
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

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

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border text-center border-gray-300 max-w-36 rounded-lg py-2 px-1 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />

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
                setFilterStatus('all');
                setSearchTerm('');
                fetchOrderHistory();
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
                <p className="font-medium">Failed to load order history</p>
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
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition cursor-pointer"
                  onClick={() => viewOrderDetails(order.OrderId)}
                >
                  <div className="bg-gray-50 p-4 flex flex-wrap items-center justify-between gap-3">
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
                  </div>
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Account':
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
                  type="email"
                  name="Email"
                  value={user.Email}
                  onChange={handleChange}
                  disabled={!editMode}
                  className={`mt-1 w-full border p-3 rounded-md focus:ring ${
                    editMode
                      ? 'focus:ring-blue-200 border-blue-300'
                      : 'bg-gray-50'
                  }`}
                />
                {editMode && (
                  <p className="text-xs text-amber-500 mt-1">
                    Note: Changing your email will require verification
                  </p>
                )}
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
                className={`mt-4 p-3 rounded-md ${
                  message.includes('Error')
                    ? 'bg-red-100 text-red-700'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {message}
              </div>
            )}
          </>
        );

      case 'Order History':
        return renderOrderHistory();

      case 'My Reviews':
        return (
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              My Product Reviews
            </h2>

            {reviewsLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin mr-3">
                  <FontAwesomeIcon
                    icon={faSpinner}
                    size="2x"
                    className="text-emerald-500"
                  />
                </div>
                <p className="text-emerald-600 font-medium">
                  Loading your reviews...
                </p>
              </div>
            ) : reviewsError ? (
              <div className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-lg">
                <div className="flex items-center">
                  <FontAwesomeIcon
                    icon={faExclamationTriangle}
                    className="text-red-500 mr-3"
                  />
                  <div>
                    <p className="font-medium">Failed to load reviews</p>
                    <p>{reviewsError}</p>
                  </div>
                </div>
              </div>
            ) : userReviews.filter((review) => review.IsActive).length === 0 ? (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
                  <FontAwesomeIcon
                    icon={faComment}
                    className="text-gray-400 text-3xl"
                  />
                </div>
                <h3 className="text-xl font-medium text-gray-700 mb-2">
                  No Reviews Yet
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  You haven't reviewed any products yet. Share your experience
                  with products you've purchased!
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
                <div className="space-y-4">
                  {userReviews
                    .filter((review) => review.IsActive)
                    .slice(
                      (reviewsPage - 1) * reviewsPerPage,
                      reviewsPage * reviewsPerPage
                    )
                    .map((review) => (
                      <div
                        key={review.RatingFeedbackId}
                        className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition"
                      >
                        {/* Review Header - Always Visible */}
                        <div
                          className="p-4 flex items-start gap-4 cursor-pointer"
                          onClick={() =>
                            toggleReviewExpand(review.RatingFeedbackId)
                          }
                        >
                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            <Link
                              to={`/product/${generateProductSlug({
                                ProductId: review.ProductId,
                                ProductName: review.ProductName,
                              })}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <img
                                src={
                                  review.FeedbackImages?.[0]
                                    ?.FeedbackImageUrl ||
                                  'https://via.placeholder.com/100x100?text=Product'
                                }
                                alt={review.ProductName}
                                className="w-16 h-16 object-cover rounded-md cursor-pointer"
                              />
                            </Link>
                          </div>

                          {/* Basic Review Info */}
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <Link
                                to={`/product/${generateProductSlug({
                                  ProductId: review.ProductId,
                                  ProductName: review.ProductName,
                                })}`}
                                className="text-lg font-semibold text-gray-800 hover:text-emerald-600 transition"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {review.ProductName}
                              </Link>
                              <span className="text-sm text-gray-500">
                                {formatReviewDate(review.CreatedDate)}
                              </span>
                            </div>

                            {/* Rating Stars */}
                            <div className="flex items-center my-1">
                              {[...Array(5)].map((_, i) => (
                                <FontAwesomeIcon
                                  key={i}
                                  icon={faStar}
                                  className={`${
                                    i < review.Rating
                                      ? 'text-yellow-400'
                                      : 'text-gray-300'
                                  } text-lg`}
                                />
                              ))}
                              <span className="ml-2 text-gray-600 font-medium">
                                {review.Rating}/5
                              </span>
                            </div>

                            {/* Preview of Review Text */}
                            <p className="text-gray-700 line-clamp-1">
                              {review.FeedBack}
                            </p>

                            {/* Expand/Collapse Indicator */}
                            <div className="flex items-center text-emerald-600 mt-1">
                              <span className="text-sm font-medium">
                                {expandedReviewId === review.RatingFeedbackId
                                  ? 'Hide Details'
                                  : 'Show Details'}
                              </span>
                              <FontAwesomeIcon
                                icon={
                                  expandedReviewId === review.RatingFeedbackId
                                    ? faAngleUp
                                    : faAngleDown
                                }
                                className="ml-1"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Expanded Content */}
                        {expandedReviewId === review.RatingFeedbackId && (
                          <div className="px-4 pb-4 pt-0 border-t border-gray-100">
                            {/* Full Review Text */}
                            <div className="mb-3">
                              <h4 className="text-sm font-medium text-gray-500 mb-1">
                                Your Review:
                              </h4>
                              <p className="text-gray-700">{review.FeedBack}</p>
                            </div>

                            {/* Review Images */}
                            {review.FeedbackImages &&
                              review.FeedbackImages.length > 0 && (
                                <div className="mt-3">
                                  <p className="text-sm text-gray-600 mb-2">
                                    <FontAwesomeIcon
                                      icon={faImage}
                                      className="mr-2"
                                    />
                                    {review.FeedbackImages.length}{' '}
                                    {review.FeedbackImages.length === 1
                                      ? 'Image'
                                      : 'Images'}
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {review.FeedbackImages.slice(0, 5).map(
                                      (image, index) => (
                                        <div
                                          key={image.RatingFeedbackImageId}
                                          className="relative cursor-pointer"
                                          onClick={() =>
                                            openLightbox(
                                              review.FeedbackImages.map(
                                                (img) => img.FeedbackImageUrl
                                              ),
                                              index
                                            )
                                          }
                                        >
                                          <img
                                            src={image.FeedbackImageUrl}
                                            alt={`Review ${index + 1}`}
                                            className="w-16 h-16 object-cover rounded-md"
                                          />
                                        </div>
                                      )
                                    )}
                                    {review.FeedbackImages.length > 5 && (
                                      <div
                                        className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center cursor-pointer"
                                        onClick={() =>
                                          openLightbox(
                                            review.FeedbackImages.map(
                                              (img) => img.FeedbackImageUrl
                                            ),
                                            5
                                          )
                                        }
                                      >
                                        <span className="text-gray-600 font-medium">
                                          +{review.FeedbackImages.length - 5}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
                        )}
                      </div>
                    ))}
                </div>

                {/* Pagination Controls */}
                {Math.ceil(
                  userReviews.filter((review) => review.IsActive).length /
                    reviewsPerPage
                ) > 1 && (
                  <div className="flex justify-center mt-8">
                    <nav className="flex items-center space-x-1">
                      <button
                        onClick={() => setReviewsPage(1)}
                        disabled={reviewsPage === 1}
                        className={`px-2 py-1 rounded ${
                          reviewsPage === 1
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <FontAwesomeIcon icon={faAngleDoubleLeft} />
                      </button>
                      <button
                        onClick={() => setReviewsPage(reviewsPage - 1)}
                        disabled={reviewsPage === 1}
                        className={`px-2 py-1 rounded ${
                          reviewsPage === 1
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <FontAwesomeIcon icon={faAngleLeft} />
                      </button>

                      {[
                        ...Array(
                          Math.ceil(
                            userReviews.filter((review) => review.IsActive)
                              .length / reviewsPerPage
                          )
                        ),
                      ].map((_, index) => {
                        const pageNum = index + 1;
                        // Show current page, first page, last page, and one page before and after current
                        if (
                          pageNum === 1 ||
                          pageNum ===
                            Math.ceil(
                              userReviews.filter((review) => review.IsActive)
                                .length / reviewsPerPage
                            ) ||
                          (pageNum >= reviewsPage - 1 &&
                            pageNum <= reviewsPage + 1)
                        ) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setReviewsPage(pageNum)}
                              className={`w-8 h-8 flex items-center justify-center rounded ${
                                reviewsPage === pageNum
                                  ? 'bg-emerald-600 text-white'
                                  : 'text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        }

                        // Show ellipsis for gaps
                        if (
                          (pageNum === 2 && reviewsPage > 3) ||
                          (pageNum ===
                            Math.ceil(
                              userReviews.filter((review) => review.IsActive)
                                .length / reviewsPerPage
                            ) -
                              1 &&
                            reviewsPage <
                              Math.ceil(
                                userReviews.filter((review) => review.IsActive)
                                  .length / reviewsPerPage
                              ) -
                                2)
                        ) {
                          return (
                            <span
                              key={pageNum}
                              className="w-8 h-8 flex items-center justify-center text-gray-500"
                            >
                              ...
                            </span>
                          );
                        }

                        return null;
                      })}

                      <button
                        onClick={() => setReviewsPage(reviewsPage + 1)}
                        disabled={
                          reviewsPage ===
                          Math.ceil(
                            userReviews.filter((review) => review.IsActive)
                              .length / reviewsPerPage
                          )
                        }
                        className={`px-2 py-1 rounded ${
                          reviewsPage ===
                          Math.ceil(
                            userReviews.filter((review) => review.IsActive)
                              .length / reviewsPerPage
                          )
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <FontAwesomeIcon icon={faAngleRight} />
                      </button>
                      <button
                        onClick={() =>
                          setReviewsPage(
                            Math.ceil(
                              userReviews.filter((review) => review.IsActive)
                                .length / reviewsPerPage
                            )
                          )
                        }
                        disabled={
                          reviewsPage ===
                          Math.ceil(
                            userReviews.filter((review) => review.IsActive)
                              .length / reviewsPerPage
                          )
                        }
                        className={`px-2 py-1 rounded ${
                          reviewsPage ===
                          Math.ceil(
                            userReviews.filter((review) => review.IsActive)
                              .length / reviewsPerPage
                          )
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <FontAwesomeIcon icon={faAngleDoubleRight} />
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}

            {/* Image Lightbox */}
            {reviewLightboxOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
                <div className="relative max-w-4xl w-full">
                  <button
                    onClick={closeLightbox}
                    className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 z-10"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>

                  <div className="relative">
                    <img
                      src={selectedReviewImages[currentImageIndex]}
                      alt="Review"
                      className="mx-auto max-h-[80vh] max-w-full object-contain"
                    />

                    {selectedReviewImages.length > 1 && (
                      <>
                        <button
                          onClick={() => navigateImage(-1)}
                          disabled={currentImageIndex === 0}
                          className={`absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full ${
                            currentImageIndex === 0
                              ? 'opacity-50 cursor-not-allowed'
                              : 'hover:bg-opacity-70'
                          }`}
                        >
                          <FontAwesomeIcon icon={faAngleLeft} />
                        </button>

                        <button
                          onClick={() => navigateImage(1)}
                          disabled={
                            currentImageIndex ===
                            selectedReviewImages.length - 1
                          }
                          className={`absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full ${
                            currentImageIndex ===
                            selectedReviewImages.length - 1
                              ? 'opacity-50 cursor-not-allowed'
                              : 'hover:bg-opacity-70'
                          }`}
                        >
                          <FontAwesomeIcon icon={faAngleRight} />
                        </button>
                      </>
                    )}
                  </div>

                  <div className="text-center text-white mt-4">
                    {selectedReviewImages.length > 1 && (
                      <p>
                        {currentImageIndex + 1} / {selectedReviewImages.length}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'Password':
        return (
          <div className="p-16 mx-auto  ">
            <div className="max-w-md mx-auto bg-white rounded-lg align-middle">
              {resetStep === 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Reset Your Password
                  </h3>
                  <p className="text-gray-600 mb-4">
                    We'll send a one-time password (OTP) to your email to verify
                    your identity.
                  </p>

                  {resetError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md mb-4">
                      <div className="flex">
                        <FontAwesomeIcon
                          icon={faExclamationTriangle}
                          className="text-red-500 mt-0.5 mr-2"
                        />
                        <p>{resetError}</p>
                      </div>
                    </div>
                  )}

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendResetOTP();
                    }}
                  >
                    <div className="mb-4">
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={resetEmail || user.Email}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="w-full border border-gray-300 rounded-md p-2.5 bg-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        disabled={true}
                        placeholder="Enter your email address"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-md transition duration-200 flex justify-center items-center"
                      disabled={resetLoading}
                    >
                      {resetLoading ? (
                        <>
                          <FontAwesomeIcon
                            icon={faSpinner}
                            className="animate-spin mr-2"
                          />
                          Sending...
                        </>
                      ) : (
                        'Send Reset Code'
                      )}
                    </button>
                  </form>
                </div>
              )}

              {resetStep === 1 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Verify OTP Code
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Please enter the 6-digit code we sent to{' '}
                    <strong>{resetEmail || user.Email}</strong>
                  </p>

                  {resetError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md mb-4">
                      <div className="flex">
                        <FontAwesomeIcon
                          icon={faExclamationTriangle}
                          className="text-red-500 mt-0.5 mr-2"
                        />
                        <p>{resetError}</p>
                      </div>
                    </div>
                  )}

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleVerifyOTP();
                    }}
                  >
                    <div className="mb-4">
                      <label
                        htmlFor="otp"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Verification Code
                      </label>
                      <input
                        id="otp"
                        type="text"
                        value={resetOTP}
                        onChange={(e) =>
                          setResetOTP(e.target.value.replace(/[^0-9]/g, ''))
                        }
                        className="w-full border border-gray-300 rounded-md p-2.5 text-center tracking-widest focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        disabled={resetLoading}
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        required
                      />
                    </div>

                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-md transition duration-200 flex justify-center items-center"
                        disabled={resetLoading}
                      >
                        {resetLoading ? (
                          <>
                            <FontAwesomeIcon
                              icon={faSpinner}
                              className="animate-spin mr-2"
                            />
                            Verifying...
                          </>
                        ) : (
                          'Verify Code'
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setResetStep(0);
                          setResetOTP('');
                          setResetError('');
                        }}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2.5 px-4 rounded-md transition duration-200"
                        disabled={resetLoading}
                      >
                        Back
                      </button>
                    </div>

                    <div className="mt-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleSendResetOTP()}
                        className="text-emerald-600 text-sm hover:underline"
                        disabled={resetLoading}
                      >
                        Didn't receive a code? Send again
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {resetStep === 2 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Set New Password
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Create a new password for your account.
                  </p>

                  {resetError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md mb-4">
                      <div className="flex">
                        <FontAwesomeIcon
                          icon={faExclamationTriangle}
                          className="text-red-500 mt-0.5 mr-2"
                        />
                        <p>{resetError}</p>
                      </div>
                    </div>
                  )}

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleResetPassword();
                    }}
                  >
                    <div className="mb-4">
                      <label
                        htmlFor="new-password"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          id="new-password"
                          type={showPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full border border-gray-300 rounded-md p-2.5 pr-10 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          disabled={resetLoading}
                          placeholder="Enter new password"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <FontAwesomeIcon
                            icon={showPassword ? faEyeSlash : faEye}
                            className="text-gray-400 hover:text-gray-600"
                          />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Password must be at least 6 characters
                      </p>
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor="confirm-password"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          id="confirm-password"
                          type={showPassword ? 'text' : 'password'}
                          value={confirmNewPassword}
                          onChange={(e) =>
                            setConfirmNewPassword(e.target.value)
                          }
                          className="w-full border border-gray-300 rounded-md p-2.5 pr-10 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          disabled={resetLoading}
                          placeholder="Confirm new password"
                          required
                        />
                      </div>
                      {confirmNewPassword &&
                        newPassword !== confirmNewPassword && (
                          <p className="text-xs text-red-500 mt-1">
                            Passwords do not match
                          </p>
                        )}
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-md transition duration-200 flex justify-center items-center"
                      disabled={
                        resetLoading || newPassword !== confirmNewPassword
                      }
                    >
                      {resetLoading ? (
                        <>
                          <FontAwesomeIcon
                            icon={faSpinner}
                            className="animate-spin mr-2"
                          />
                          Updating...
                        </>
                      ) : (
                        'Update Password'
                      )}
                    </button>
                  </form>
                </div>
              )}

              {resetStep === 3 && (
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      className="text-emerald-600 text-3xl"
                    />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Password Changed!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Your password has been updated successfully.
                  </p>
                  <button
                    onClick={() => setResetStep(0)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-6 rounded-md transition duration-200"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      // case 'Notification':
      //   return (
      //     <div className="text-center py-12">
      //       <h2 className="text-2xl font-semibold text-gray-800 mb-4">
      //         Notification Settings
      //       </h2>
      //       <p className="text-gray-600">
      //         Notification preferences coming soon!
      //       </p>
      //     </div>
      //   );

      // default:
      // return null;
    }
  };

  const handleSendResetOTP = async () => {
    setResetLoading(true);
    setResetError('');

    const email = resetEmail || user.Email;

    try {
      const response = await fetch(
        `${backendUrl}/api/Customer/forgot-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            Email: email,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset code');
      }

      setResetStep(1);
    } catch (error) {
      console.error('Password reset error:', error);
      setResetError(
        error.message || 'Failed to send reset code. Please try again.'
      );
    } finally {
      setResetLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (resetOTP.length !== 6) {
      setResetError('Please enter a valid 6-digit code');
      return;
    }

    setResetLoading(true);
    setResetError('');

    try {
      const response = await fetch(
        `${backendUrl}/api/Customer/verify-reset-pin`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ResetPin: resetOTP,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid verification code');
      }

      setResetStep(2);
    } catch (error) {
      console.error('OTP verification error:', error);
      setResetError(
        error.message || 'Invalid verification code. Please try again.'
      );
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmNewPassword) {
      setResetError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setResetError('Password must be at least 6 characters');
      return;
    }

    setResetLoading(true);
    setResetError('');

    const email = resetEmail || user.Email;

    try {
      const response = await fetch(
        `${backendUrl}/api/Customer/reset-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            Email: email,
            NewPassword: newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      setNewPassword('');
      setConfirmNewPassword('');
      setResetOTP('');

      setResetStep(3);
    } catch (error) {
      console.error('Password change error:', error);
      setResetError(
        error.message || 'Failed to reset password. Please try again.'
      );
    } finally {
      setResetLoading(false);
    }
  };

  const toggleReviewExpand = (reviewId) => {
    if (expandedReviewId === reviewId) {
      setExpandedReviewId(null);
    } else {
      setExpandedReviewId(reviewId);
    }
  };

  return (
    <>
      <Navbar />
      <div
        className="min-h-screen flex items-center justify-center bg-cover py-16 bg-center p-4 mt-24"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="w-full max-w-6xl bg-white shadow-lg rounded-xl flex flex-col md:flex-row overflow-hidden">
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
                  { id: 'My Reviews', label: 'My Reviews', icon: faStar },
                  // { id: 'Notification', label: 'Notifications', icon: faBell },
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
                <Link
                  to="/contact"
                  className="text-emerald-600 hover:underline space-x-1"
                >
                  <span>Contact Support</span>
                  <FontAwesomeIcon className="" icon={faHeadset} />
                </Link>
              </p>
            </div>
          </div>

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
