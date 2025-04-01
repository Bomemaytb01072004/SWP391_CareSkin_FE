import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Header from '../../components/Layout/Header';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  faUser,
  faQuestionCircle,
  faShoppingCart,
  faBars,
  faTimes,
  faTrash,
  faShoppingBag,
  faHeart,
  faSignOutAlt,
  faLock,
} from '@fortawesome/free-solid-svg-icons';
import { generateProductSlug } from '../../utils/urlUtils';
const backendUrl = import.meta.env.VITE_BACKEND_URL;

function Navbar() {
  const location = useLocation();
  const [scrollingUp, setScrollingUp] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(window.scrollY);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const token = localStorage.getItem('token');
  const CustomerId = localStorage.getItem('CustomerId');
  const [userName, setUserName] = useState(null);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const sidebarRef = useRef(null);
  const lastUserId = useRef(null);
  let closeTimeout = null;

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const [user, setUser] = useState(null);
  const [cartMergedFlag, setCartMergedFlag] = useState(
    localStorage.getItem('cartMerged') === 'true'
  );

  useEffect(() => {
    // Check if user session exists
    const userSession = localStorage.getItem('user');
    setIsLoggedIn(!!userSession);
  }, []);

  // Update the handleLogout function to use our new global method
  const handleLogout = () => {
    // Clean up the chat session using our global method
    if (window.CareSkin && window.CareSkin.endTawkChat) {
      window.CareSkin.endTawkChat();
    }

    // Clear your own user/session data
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('CustomerId');
    localStorage.removeItem('cart');
    localStorage.removeItem('checkoutItems');

    // Reset cart merge flag when logging out
    localStorage.removeItem('cartMerged');
    setCartMergedFlag(false);

    setIsLoggedIn(false);
    setCart([]);

    // Dispatch event to notify about user change
    window.dispatchEvent(new Event('careSkinUserChanged'));
    window.dispatchEvent(new Event('storage'));

    // Force a full page reload to ensure everything is fresh
    window.location.href = '/';
  };

  useEffect(() => {
    function handleScroll() {
      setIsCartOpen(false);
    }

    // Close sidebar when clicking outside
    function handleClickOutside(event) {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        isSidebarOpen
      ) {
        setIsSidebarOpen(false);
      }
    }

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollingUp(currentScrollY < lastScrollY);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const fetchUserData = async () => {
      // Check if user is admin first
      if (isAdminUser()) {
        try {
          // For admin users, fetch from the admin API
          const response = await fetch(`${backendUrl}/api/Admin`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!response.ok) throw new Error(`Error: ${response.status}`);

          const adminData = await response.json();

          // Transform admin data to match expected user structure
          const formattedAdminData = {
            UserName: adminData.UserName || 'admin',
            FullName: adminData.FullName || 'Admin User',
            Email: adminData.Email || 'admin@careskin.com',
            PictureUrl: adminData.PictureUrl,
            Role: 'Admin',
          };

          setUserName(formattedAdminData.FullName);
          setUser(formattedAdminData);

          // Cache admin data in localStorage
          localStorage.setItem('user', JSON.stringify(formattedAdminData));
          window.dispatchEvent(new Event('careSkinUserChanged'));

          return; // Skip the customer API call
        } catch (error) {
          console.error('Error fetching admin data:', error);

          // Try to use cached admin data if available
          const cachedUser = JSON.parse(localStorage.getItem('user') || '{}');
          if (cachedUser && Object.keys(cachedUser).length > 0) {
            setUser(cachedUser);
            setUserName(cachedUser.FullName || cachedUser.UserName || 'Admin');
            return;
          }

          // Fallback for admin
          setUserName('Admin User');
          setUser({
            UserName: 'admin',
            FullName: 'Admin User',
            Role: 'Admin',
          });
          return;
        }
      }

      // Original code for non-admin users
      if (CustomerId && token) {
        try {
          const response = await fetch(
            `${backendUrl}/api/Customer/${CustomerId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (!response.ok) throw new Error(`Error: ${response.status}`);

          const userData = await response.json();
          setUserName(userData.FullName || userData.UserName || 'Unknown User');

          // Store the complete user data object
          setUser(userData);

          // Also cache in localStorage for faster loading on refresh
          localStorage.setItem('user', JSON.stringify(userData));
          // Dispatch event for chat to update user info
          window.dispatchEvent(new Event('careSkinUserChanged'));
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUserName('Unknown User');

          // Try to load from cache if API fails
          const cachedUser = JSON.parse(localStorage.getItem('user') || '{}');
          if (cachedUser && Object.keys(cachedUser).length > 0) {
            setUser(cachedUser);
          }
        }
      } else {
        // Clear user state if not logged in
        setUser(null);
        setUserName(null);
      }
    };

    fetchUserData();
  }, [CustomerId, token]);

  // Create a custom event for notifying other components about cart updates
  const notifyCartUpdated = (updatedCart) => {
    window.dispatchEvent(
      new CustomEvent('navbarCartUpdated', { detail: { cart: updatedCart } })
    );
  };

  // Helper function to check if user is admin
  const isAdminUser = () => {
    try {
      // Check JWT token
      const token = localStorage.getItem('token');
      if (token) {
        // Parse the JWT token payload
        const payload = JSON.parse(atob(token.split('.')[1]));

        // Check if the role claim exists and is "Admin"
        if (
          payload[
            'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
          ] === 'Admin'
        ) {
          return true;
        }
      }

      // Also check user object in localStorage as a fallback
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (
          user.role === 'Admin' ||
          user[
            'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
          ] === 'Admin'
        ) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  };

  // Replace your existing fetchCart function
  const fetchCart = async () => {
    try {
      // Skip cart fetching for admin users
      if (isAdminUser()) {
        console.log('Admin user detected - skipping cart fetch');
        setCart([]);
        notifyCartUpdated([]);
        return [];
      }

      if (CustomerId && token) {
        // For logged in users, fetch from API
        const response = await fetch(
          `${backendUrl}/api/Cart/customer/${CustomerId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok)
          throw new Error(`Error fetching cart: ${response.status}`);

        const cartData = await response.json();

        const updatedCart = cartData.map((item) => ({
          ...item,
          ProductVariationId: item.ProductVariationId,
          ProductVariations: Array.isArray(item.ProductVariations)
            ? item.ProductVariations
            : [],
          SalePrice:
            item.ProductVariations?.find(
              (v) => v.ProductVariationId === item.ProductVariationId
            )?.SalePrice ?? item.Price,
        }));

        setCart(updatedCart);

        // Notify other components about the updated cart
        notifyCartUpdated(updatedCart);

        return updatedCart;
      } else {
        // For guest users, use localStorage
        const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
        setCart(storedCart);
        notifyCartUpdated(storedCart);
        return storedCart;
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
      setCart(storedCart);
      notifyCartUpdated(storedCart);
      return storedCart;
    }
  };

  useEffect(() => {
    fetchCart();
  }, [CustomerId, token]);

  useEffect(() => {
    const updateCart = () => {
      const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
      setCart(storedCart);
    };

    window.addEventListener('storage', updateCart);
    return () => window.removeEventListener('storage', updateCart);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setIsProfileDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleCartUpdated = () => {
      // Re-fetch cart data when cart is updated elsewhere
      fetchCart();
    };

    window.addEventListener('cartUpdated', handleCartUpdated);
    return () => window.removeEventListener('cartUpdated', handleCartUpdated);
  }, []);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleVariationChange = async (productId, newVariationId) => {
    const cartItem = cart.find((item) => item.ProductId === productId);
    if (!cartItem) {
      console.error(`Cart item with ProductId ${productId} not found.`);
      return;
    }

    const selectedVariation = cartItem.ProductVariations?.find(
      (v) => v.ProductVariationId === newVariationId
    );

    if (CustomerId) {
      try {
        const payload = {
          CustomerId: parseInt(CustomerId),
          ProductId: cartItem.ProductId,
          ProductVariationId: newVariationId,
          Quantity: cartItem.Quantity,
        };

        const response = await fetch(`${backendUrl}/api/Cart/update`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Failed to update variation (ProductId: ${cartItem.ProductId}). Response: ${response.status} - ${errorText}`
          );
        }

        const responseData = await response.json();
        const updatedCart = cart.map((item) =>
          item.ProductId === productId
            ? {
                ...item,
                ProductVariationId: newVariationId,
                SalePrice:
                  selectedVariation?.SalePrice > 0
                    ? selectedVariation.SalePrice
                    : selectedVariation?.Price || item.Price,
              }
            : item
        );

        setCart(updatedCart);
      } catch (error) {
        console.error('Error updating cart variation:', error);
      }
    } else {
      setCart((prevCart) => {
        const updatedCart = prevCart.map((item) =>
          item.ProductId === productId
            ? {
                ...item,
                ProductVariationId: newVariationId,
                SalePrice:
                  selectedVariation?.SalePrice > 0
                    ? selectedVariation.SalePrice
                    : selectedVariation?.Price || item.Price,
              }
            : item
        );

        localStorage.setItem('cart', JSON.stringify(updatedCart));
        return updatedCart;
      });

      window.dispatchEvent(new Event('storage'));
    }
  };

  const removeFromCart = async (cartId, productId, productVariationId) => {
    const CustomerId = localStorage.getItem('CustomerId');
    const token = localStorage.getItem('token');

    if (CustomerId && token) {
      try {
        const response = await fetch(
          `${backendUrl}/api/Cart/remove/${cartId}`,
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        const updatedCart = cart.filter((item) => item.CartId !== cartId);
        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        window.dispatchEvent(new Event('storage'));
      } catch (error) {
        console.error('Error removing item from API:', error);
      }
      return;
    }

    if (!productId || !productVariationId) {
      console.error(
        'Error: Missing productId or productVariationId for local cart removal.'
      );
      return;
    }

    let localCart = JSON.parse(localStorage.getItem('cart')) || [];
    const updatedCart = localCart.filter(
      (item) =>
        !(
          item.ProductId === productId &&
          item.ProductVariationId === productVariationId
        )
    );

    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('storage'));
  };

  const handleProfileClick = () => {
    if (isLoggedIn) {
      navigate('/profile');
    } else {
      navigate('/joinus');
    }
  };

  const handleMouseEnter = () => {
    if (closeTimeout) {
      clearTimeout(closeTimeout);
    }
    setIsCartOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeout = setTimeout(() => {
      setIsCartOpen(false);
    }, 200);
  };

  const handleDragStart = (e) => {
    setIsDragging(true);
  };

  const handleDrag = (e) => {
    if (isDragging) {
      requestAnimationFrame(() => {
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const newX = Math.max(
          10,
          Math.min(window.innerWidth - 50, clientX - 20)
        );
        const newY = Math.max(
          10,
          Math.min(window.innerHeight - 50, clientY - 20)
        );

        setPosition({ x: newX, y: newY });
      });
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'SkinQuiz', path: '/skinquiz' },
    { name: 'Blogs', path: '/blogs' },
    { name: 'About', path: '/about' },
  ];

  // Calculate subtotal for cart
  const cartSubtotal = cart.reduce((total, item) => {
    return (
      total +
      ((item.SalePrice > 0 ? item.SalePrice : item.Price) || 0) *
        (item.Quantity || 1)
    );
  }, 0);

  // Replace mergeCartsAfterLogin function
  const mergeCartsAfterLogin = async (customerId, authToken) => {
    if (localStorage.getItem('cartMerged') === 'true') return;

    try {
      const localCart = JSON.parse(localStorage.getItem('cart')) || [];
      if (localCart.length === 0) {
        localStorage.setItem('cartMerged', 'true');
        setCartMergedFlag(true);
        return;
      }

      // Fetch current server cart
      const currentCartRes = await fetch(
        `${backendUrl}/api/Cart/customer/${customerId}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      const currentCart = (await currentCartRes.json()) || [];

      // For each local item, either update quantity if it exists or add if not
      for (const localItem of localCart) {
        const match = currentCart.find(
          (serverItem) =>
            serverItem.ProductId === localItem.ProductId &&
            serverItem.ProductVariationId === localItem.ProductVariationId
        );

        if (match) {
          // Update existing item with new total quantity
          const updatedQty = (match.Quantity || 1) + (localItem.Quantity || 1);
          await fetch(`${backendUrl}/api/Cart/update`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
              CustomerId: parseInt(customerId),
              ProductId: match.ProductId,
              ProductVariationId: match.ProductVariationId,
              Quantity: updatedQty,
            }),
          });
        } else {
          // Add item to the server cart
          await fetch(`${backendUrl}/api/Cart/add`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
              CustomerId: parseInt(customerId),
              ProductId: localItem.ProductId,
              ProductVariationId: localItem.ProductVariationId,
              Quantity: localItem.Quantity || 1,
            }),
          });
        }
      }

      localStorage.setItem('cartMerged', 'true');
      setCartMergedFlag(true);
      localStorage.removeItem('cart'); // Clear local cart

      // Refresh the server cart
      fetchCart();
    } catch (error) {
      console.error('Error merging carts:', error);
    }
  };

  // Add this useEffect to handle login redirects
  useEffect(() => {
    // Handle redirect after login if there was a pending checkout
    if (isLoggedIn && localStorage.getItem('pendingCheckout') === 'true') {
      localStorage.removeItem('pendingCheckout');
      // Small delay to ensure cart merge completes
      const timer = setTimeout(() => navigate('/cart'), 500);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (CustomerId && token) {
      const localCart = JSON.parse(localStorage.getItem('cart')) || [];
      const alreadyMerged = localStorage.getItem('cartMerged') === 'true';

      if (localCart.length > 0 && !alreadyMerged) {
        console.log('Merging local cart with API cart from Navbar...');
        mergeCartsAfterLogin(CustomerId, token);
      }
    }
  }, [CustomerId, token]);

  return (
    <>
      {/* Enhanced Main Navbar */}
      <nav
        className={`bg-white shadow-md fixed top-0 w-full z-50 transition-all duration-300 hidden md:block lg:block ${
          scrollingUp ? 'translate-y-0' : '-translate-y-full'
        }`}
        style={{ zIndex: 1000 }}
      >
        <Header />
        <div className="mx-auto px-4 lg:px-8 flex items-center justify-between h-16">
          {/* Logo */}
          <div className="lg:flex hidden">
            <Link to="/">
              <img
                src="/src/assets/logo.png"
                alt="CareSkin Logo"
                className="w-[13.125rem] h-[4.375rem] hover:opacity-90 transition-opacity"
              />
            </Link>
          </div>

          {/* Navigation Links - Enhanced */}
          <ul className="flex-1 flex justify-center lg:space-x-12 lg:mr-2 mx-auto space-x-4 text-gray-700 lg:font-medium">
            {Array.isArray(navLinks) &&
              navLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className={`transition py-5 px-2 inline-block relative ${
                      location?.pathname === link.path
                        ? 'text-emerald-600 font-bold' // Active link styling
                        : 'text-gray-700 hover:text-emerald-600'
                    }`}
                  >
                    {link.name}
                    {location?.pathname === link.path && (
                      <span className="absolute bottom-9 left-0 w-full h-0.5 bg-emerald-500 rounded-full"></span>
                    )}
                  </Link>
                </li>
              ))}
          </ul>

          {/* Right Side Icons - Enhanced */}
          <div className="lg:flex md:flex space-x-5 items-center">
            <div className="lg:flex md:flex hidden space-x-6 items-center">
              {/* Profile Icon */}
              <div className="relative group" ref={profileDropdownRef}>
                {isLoggedIn ? (
                  // Logged in state - show avatar with dropdown
                  <div
                    onClick={() =>
                      setIsProfileDropdownOpen(!isProfileDropdownOpen)
                    }
                    className="cursor-pointer flex items-center"
                  >
                    <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-emerald-200 hover:border-emerald-500 transition-all">
                      <img
                        src={
                          user?.PictureUrl ||
                          'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg'
                        }
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src =
                            'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg';
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  // Not logged in - show icon
                  <button onClick={handleProfileClick} className="relative">
                    <FontAwesomeIcon
                      icon={faUser}
                      className="text-gray-700 hover:text-emerald-600 text-xl transition duration-200 hover:scale-110"
                    />
                    <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Sign In
                    </span>
                  </button>
                )}

                {/* Profile Dropdown Menu */}
                <AnimatePresence>
                  {isLoggedIn && isProfileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-11 w-64 bg-white shadow-xl border border-gray-200 rounded-lg p-4 z-50"
                    >
                      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-200">
                          <img
                            src={
                              user?.PictureUrl ||
                              'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg'
                            }
                            alt="Profile"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src =
                                'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg';
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">
                            {userName || 'User'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user?.Email || 'loading@email.com'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 space-y-1.5">
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 p-2 hover:bg-emerald-50 rounded-md transition-colors text-gray-700"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <FontAwesomeIcon
                            icon={faUser}
                            className="text-emerald-600 w-4"
                          />
                          <span>View Profile</span>
                        </Link>

                        <Link
                          to="/profile?tab=Order%20History"
                          className="flex items-center gap-3 p-2 hover:bg-emerald-50 rounded-md transition-colors text-gray-700"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <FontAwesomeIcon
                            icon={faShoppingBag}
                            className="text-emerald-600 w-4"
                          />
                          <span>Order History</span>
                        </Link>

                        {isAdminUser() && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-3 p-2 hover:bg-emerald-50 rounded-md transition-colors text-gray-700"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <FontAwesomeIcon
                              icon={faLock}
                              className="text-emerald-600 w-4"
                            />
                            <span>Admin Dashboard</span>
                          </Link>
                        )}

                        {/* <Link
                          to="/wishlist"
                          className="flex items-center gap-3 p-2 hover:bg-emerald-50 rounded-md transition-colors text-gray-700"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <FontAwesomeIcon
                            icon={faHeart}
                            className="text-emerald-600 w-4"
                          />
                          <span>Wishlist</span>
                        </Link> */}
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            handleLogout();
                          }}
                          className="flex w-full items-center gap-3 p-2 hover:bg-red-50 rounded-md transition-colors text-red-600"
                        >
                          <FontAwesomeIcon
                            icon={faSignOutAlt}
                            className="w-4"
                          />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* FAQ Icon */}
              <Link to="/faq" className="relative group">
                <FontAwesomeIcon
                  icon={faQuestionCircle}
                  className="text-xl text-gray-700 hover:text-emerald-600 transition-colors"
                />
                <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  FAQ
                </span>
              </Link>

              {/* Enhanced Cart Icon with Dropdown */}
              <div
                className="relative group"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  to="/cart"
                  className="relative text-gray-700 hover:text-emerald-600 transition-colors"
                >
                  <FontAwesomeIcon
                    icon={faShoppingCart}
                    className="text-xl hover:scale-110 transition-transform"
                  />
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                      {cart.length}
                    </span>
                  )}
                </Link>
                <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  Cart
                </span>

                {/* Enhanced Cart Dropdown */}
                <AnimatePresence>
                  {isCartOpen && cart.length > 0 && (
                    <motion.div
                      ref={dropdownRef}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute -right-20 top-11 w-96 bg-white shadow-xl border border-gray-200 rounded-lg p-4 z-50"
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold text-gray-800">
                          My Cart ({cart.length})
                        </h3>
                        <span className="text-sm text-emerald-600 font-medium">
                          ${cartSubtotal.toFixed(2)} total
                        </span>
                      </div>

                      <div className="max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 space-y-3">
                        {cart.map((item) => (
                          <motion.div
                            key={`${item.ProductId}-${item.ProductVariationId}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-3 border-b pb-3 last:border-none"
                          >
                            <Link to={`/product/${generateProductSlug(item)}`}>
                              <img
                                src={item.PictureUrl}
                                alt={item.ProductName}
                                className="w-16 h-16 object-cover rounded-md shadow-sm cursor-pointer"
                              />
                            </Link>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-800 line-clamp-1">
                                {item.ProductName}
                              </p>
                              <div className="mt-1">
                                <select
                                  value={
                                    item.ProductVariationId ||
                                    item.ProductVariations?.[0]
                                      ?.ProductVariationId ||
                                    ''
                                  }
                                  onChange={(e) =>
                                    handleVariationChange(
                                      item.ProductId,
                                      parseInt(e.target.value)
                                    )
                                  }
                                  className="text-xs border rounded px-2 py-1 text-gray-700 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                >
                                  {Array.isArray(item.ProductVariations) &&
                                  item.ProductVariations.length > 0 ? (
                                    item.ProductVariations.map((variation) => (
                                      <option
                                        key={variation.ProductVariationId}
                                        value={variation.ProductVariationId}
                                      >
                                        {variation.Ml}ml - $
                                        {variation.SalePrice > 0
                                          ? variation.SalePrice
                                          : variation.Price}
                                      </option>
                                    ))
                                  ) : (
                                    <option disabled>
                                      No variations available
                                    </option>
                                  )}
                                </select>
                              </div>
                              <div className="flex items-center justify-between mt-1">
                                <p className="text-xs text-gray-600">
                                  Qty: {item.Quantity ?? 1}
                                </p>
                                <p className="text-xs font-bold text-emerald-600">
                                  $
                                  {(
                                    (item?.SalePrice > 0
                                      ? item.SalePrice
                                      : item.Price || 0) * (item.Quantity || 1)
                                  ).toFixed(2)}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                removeFromCart(
                                  item.CartId,
                                  item.ProductId,
                                  item.ProductVariationId
                                )
                              }
                              className="p-1.5 bg-red-50 hover:bg-red-100 rounded-full transition-colors"
                            >
                              <FontAwesomeIcon
                                icon={faTrash}
                                className="text-red-500 text-xs"
                              />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                      <div className="mt-4 ">
                        <Link
                          to="/cart"
                          onClick={(e) => {
                            if (cart.length > 0 && !isLoggedIn) {
                              e.preventDefault();
                              // Save cart state
                              localStorage.setItem('pendingCheckout', 'true');
                              // Redirect to login
                              navigate('/login', {
                                state: { returnUrl: '/cart' },
                              });
                              setIsCartOpen(false);
                            }
                          }}
                          className="block bg-emerald-600 text-white font-medium text-center py-2 px-3 rounded-md hover:bg-emerald-700 transition-colors text-sm"
                        >
                          {isLoggedIn ? 'View Cart' : 'View Cart'}
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Login/Logout Button - Enhanced */}
            <div className="lg:flex hidden space-x-4 items-center">
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="text-gray-700 font-medium hover:text-red-500 transition-colors px-4 py-1.5 rounded-full hover:bg-red-50"
                >
                  Log Out
                </button>
              ) : (
                <Link
                  to="/joinus"
                  className="text-emerald-600 font-medium hover:text-white transition-colors px-4 py-1.5 rounded-full border-2 border-emerald-600 hover:bg-emerald-600"
                >
                  Join Us
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Enhanced Mobile Floating Button */}
      <motion.div
        className="fixed w-14 h-14 bg-emerald-600 rounded-full flex items-center justify-center cursor-pointer z-[10000] md:flex lg:hidden sm:flex shadow-lg"
        style={{
          left: position.x,
          top: position.y,
          transition: isDragging ? 'none' : 'transform 0.1s ease-in-out',
        }}
        onMouseDown={handleDragStart}
        onMouseMove={handleDrag}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDrag}
        onTouchEnd={handleDragEnd}
        onClick={() => setIsSidebarOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <FontAwesomeIcon icon={faBars} className="text-white text-xl" />
      </motion.div>

      {/* Enhanced Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black z-[9998]"
              onClick={() => setIsSidebarOpen(false)}
            />

            <motion.div
              ref={sidebarRef}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-[9999] overflow-y-auto"
            >
              <div className="p-5 flex justify-between items-center border-b border-gray-200">
                <img
                  src="/src/assets/logo.png"
                  alt="CareSkin Logo"
                  className="h-8"
                />
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              {/* User Section */}
              <div className="p-5 border-b border-gray-200">
                {isLoggedIn ? (
                  <div className="flex flex-col">
                    <p className="text-sm text-gray-500 mb-2">Signed in as</p>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-800">
                        {userName ? userName : 'Loading...'}
                      </span>
                      <button
                        onClick={handleLogout}
                        className="text-xs text-red-500 px-3 py-1 border border-red-500 rounded-full hover:bg-red-50"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Link
                      to="/joinus"
                      className="bg-emerald-600 text-white font-medium text-center py-2 rounded-md hover:bg-emerald-700 transition-colors"
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      Sign In / Register
                    </Link>
                  </div>
                )}
              </div>

              {/* Navigation Links */}
              <div className="p-5">
                <ul className="space-y-4">
                  {navLinks.map((link, index) => (
                    <li key={index} className="hover:bg-emerald-50 rounded-md">
                      <Link
                        to={link.path}
                        onClick={() => setIsSidebarOpen(false)}
                        className={`block px-3 py-2 transition-colors ${
                          location.pathname === link.path
                            ? 'text-emerald-600 font-semibold bg-emerald-50 border-l-4 border-emerald-600 pl-2'
                            : 'text-gray-700'
                        }`}
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quick Links Section */}
              <div className="border-t border-gray-200 p-5">
                <div className="mb-4">
                  <h4 className="text-sm uppercase text-gray-500 font-medium tracking-wider mb-2">
                    Quick Links
                  </h4>
                  <div className="space-y-3">
                    <Link
                      to="/cart"
                      className="flex items-center justify-between text-gray-700 hover:text-emerald-600"
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faShoppingCart} />
                        <span>Shopping Cart</span>
                      </div>
                      {cart.length > 0 && (
                        <span className="bg-emerald-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                          {cart.length}
                        </span>
                      )}
                    </Link>
                    <Link
                      to="/faq"
                      className="flex items-center gap-2 text-gray-700 hover:text-emerald-600"
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <FontAwesomeIcon icon={faQuestionCircle} />
                      <span>FAQ</span>
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 text-gray-700 hover:text-emerald-600"
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <FontAwesomeIcon icon={faUser} />
                      <span>My Account</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Contact/Social Links */}
              <div className="border-t border-gray-200 p-5">
                <div className="text-center text-sm text-gray-500">
                  <p> 2025 CareSkin</p>
                  <p className="mt-1">All rights reserved</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;
