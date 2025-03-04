import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Header from '../../components/Layout/Header';
import { useLocation } from 'react-router-dom';
import {
  faUser,
  faHeart,
  faShoppingCart,
  faBars,
  faTimes,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';

function Navbar() {
  const location = useLocation(); // Get the current route
  const [scrollingUp, setScrollingUp] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(window.scrollY);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const Token = localStorage.getItem('token');
  const CustomerId = localStorage.getItem('CustomerId');
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  let closeTimeout = null;

  useEffect(() => {
    // Check if user session exists
    const userSession = localStorage.getItem('user');
    setIsLoggedIn(!!userSession);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('CustomerId');
    setIsLoggedIn(false);
    navigate('/');
  };

  useEffect(() => {
    function handleScroll() {
      setIsCartOpen(false); // Close dropdown on scroll
    }

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

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
    const fetchCart = async () => {
      if (CustomerId) {
        try {
          const response = await fetch(
            `http://careskinbeauty.shop:4456/api/Cart/customer/${CustomerId}`,
            {
              headers: {
                Authorization: `Bearer ${Token}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error(
              `Error fetching cart from server: ${response.status}`
            );
          }

          const cartData = await response.json();

          // Enrich cart items with product details
          const enrichedItems = await Promise.all(
            cartData.map(async (item) => {
              try {
                const productRes = await fetch(
                  `http://careskinbeauty.shop:4456/api/Product/${item.ProductId}`,
                  {
                    headers: {
                      Authorization: `Bearer ${Token}`,
                    },
                  }
                );

                if (!productRes.ok) {
                  throw new Error(
                    `Error fetching product ${item.ProductId}: ${productRes.status}`
                  );
                }

                const productData = await productRes.json();

                return {
                  ...item,
                  PictureUrl: productData.PictureUrl,
                  Variations: productData.Variations,
                };
              } catch (error) {
                console.error('Error enriching cart item:', error);
                return item; // Return the item without modification in case of error
              }
            })
          );

          setCart(enrichedItems);
        } catch (error) {
          console.error('Error fetching cart from server:', error);
        }
      } else {
        // Fallback to localStorage cart if user is not logged in
        const storedCart = JSON.parse(localStorage.getItem('cart'));
        if (storedCart && storedCart.length > 0) {
          setCart(storedCart);
        }

        const mergedCart = storedCart.reduce((acc, item) => {
          const existingItem = acc.find((i) => i.ProductId === item.ProductId);
          if (existingItem) {
            existingItem.quantity += item.quantity || 1;
          } else {
            acc.push({ ...item, quantity: item.quantity || 1 });
          }
          return acc;
        }, []);

        setCart(mergedCart);
      }
    };

    fetchCart();
  }, [CustomerId, Token]);
  useEffect(() => {
    const updateCart = () => {
      const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
      setCart(storedCart);
      setGlobalCart(storedCart);
    };

    window.addEventListener('storage', updateCart);
    return () => window.removeEventListener('storage', updateCart);
  }, []);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const handleQuantityChange = async (
    productId,
    newQuantity,
    productVariationId
  ) => {
    if (newQuantity < 1) return; // Prevent invalid quantity

    const cartItem = cart.find((item) => item.ProductId === productId);
    if (!cartItem) {
      console.error(`Cart item with ProductId ${productId} not found.`);
      return;
    }

    if (CustomerId) {
      try {
        const response = await fetch(
          `http://careskinbeauty.shop:4456/api/Cart/update`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${Token}`,
            },
            body: JSON.stringify({
              CustomerId: parseInt(CustomerId),
              ProductId: cartItem.ProductId,
              ProductVariationId:
                productVariationId ?? cartItem.ProductVariationId,
              Quantity: newQuantity,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to update quantity (ProductId: ${cartItem.ProductId})`
          );
        }

        // ✅ Update the cart state in React
        setCart((prevCart) =>
          prevCart.map((item) =>
            item.ProductId === productId
              ? {
                  ...item,
                  Quantity: newQuantity,
                  ProductVariationId:
                    productVariationId ?? item.ProductVariationId,
                  Price:
                    cartItem.Variations.find(
                      (v) => v.ProductVariationId === productVariationId
                    )?.Price || item.Price,
                }
              : item
          )
        );
      } catch (error) {
        console.error('Error updating cart quantity:', error);
      }
    } else {
      // ✅ Guest users: update localStorage
      setCart((prevCart) => {
        const updatedCart = prevCart.map((item) =>
          item.ProductId === productId
            ? {
                ...item,
                Quantity: newQuantity,
                ProductVariationId:
                  productVariationId ?? item.ProductVariationId,
                Price:
                  cartItem.Variations.find(
                    (v) => v.ProductVariationId === productVariationId
                  )?.Price || item.Price,
              }
            : item
        );
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        return updatedCart;
      });

      window.dispatchEvent(new Event('storage'));
    }
  };

  const removeFromCart = async (cartId) => {
    if (CustomerId) {
      try {
        await fetch(
          `http://careskinbeauty.shop:4456/api/Cart/remove/${cartId}`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${Token}` },
          }
        );
        setCart((prevCart) =>
          prevCart.filter((item) => item.CartId !== cartId)
        );
        setGlobalCart((prevCart) =>
          prevCart.filter((item) => item.CartId !== cartId)
        );
      } catch (error) {
        console.error('Error removing item:', error);
      }
    } else {
      const updatedCart = cart.filter((item) => item.CartId !== cartId);
      setCart(updatedCart);
      setGlobalCart(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      window.dispatchEvent(new Event('storage'));
    }
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
      clearTimeout(closeTimeout); // Cancel closing if user re-enters
    }
    setIsCartOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeout = setTimeout(() => {
      setIsCartOpen(false);
    }, 200); // Delay closing to allow user to move to dropdown
  };

  const handleDragStart = (e) => {
    setIsDragging(true);
  };

  const handleDrag = (e) => {
    if (isDragging) {
      requestAnimationFrame(() => {
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        // Ensure button stays within screen boundaries
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

  return (
    <>
      <nav
        className={`bg-white shadow-md fixed top-0 w-full z-50 transition-transform duration-300 hidden md:block lg:block ${
          scrollingUp ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <Header />
        <div className=" mx-auto px-4 lg:px-8 flex items-center justify-between h-16">
          {/* Logo */}
          <div className="lg:flex hidden">
            <img
              src="/src/assets/logo.png"
              alt="CareSkin Logo"
              className="w-[13.125rem] h-[4.375rem]"
            />
          </div>

          {/* Navigation Links */}
          <ul className="flex-1 flex justify-center lg:space-x-12 lg:mr-2 mx-auto space-x-4 text-gray-700 lg:font-medium">
            {navLinks.map((link, index) => (
              <li key={index}>
                <Link
                  to={link.path}
                  className={`transition ${
                    location.pathname === link.path
                      ? 'text-emerald-600 font-bold' // Active link styling
                      : 'text-gray-700 hover:text-emerald-600'
                  }`}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right Side Icons with Links */}
          <div className="lg:flex md:flex space-x-5 items-center">
            <div className="lg:flex md:flex hidden space-x-4 items-center">
              {/* Profile Icon */}
              <button onClick={handleProfileClick}>
                <FontAwesomeIcon
                  icon={faUser}
                  className="text-gray-700 hover:text-emerald-600 text-xl transition"
                />
              </button>

              {/* Wishlist Icon */}
              <Link to="/wishlist">
                <FontAwesomeIcon
                  icon={faHeart}
                  className="text-gray-700 hover:text-emerald-600 text-xl transition"
                />
              </Link>

              {/* Cart Icon with Dropdown */}
              <div
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  to="/cart"
                  className="relative text-gray-700 hover:text-emerald-600 transition"
                >
                  <FontAwesomeIcon icon={faShoppingCart} className="text-xl" />
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold px-2 py-[2px] rounded-full">
                      {cart.length}
                    </span>
                  )}
                </Link>

                {/* Cart Dropdown (Only Shows on Hover) */}
                {isCartOpen && cart.length > 0 && (
                  <div
                    ref={dropdownRef}
                    className="absolute -right-20 top-11 w-96 bg-white shadow-lg border rounded-lg p-4 z-50"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Cart Items
                    </h3>
                    <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
                      {cart.map((item) => (
                        <div
                          key={item.ProductId}
                          className="flex items-center gap-3 border-b pb-2 mb-2 last:border-none"
                        >
                          <img
                            src={item.PictureUrl}
                            alt={item.ProductName}
                            className="w-14 h-14 object-cover rounded-md"
                          />
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-gray-800">
                              {item.ProductName}
                            </p>
                            <p className="text-xs font-semibold text-gray-800">
                              <select
                                value={item.ProductVariationId}
                                onChange={(e) => {
                                  const newVariationId = parseInt(
                                    e.target.value
                                  );
                                  const newVariation = item.Variations.find(
                                    (v) =>
                                      v.ProductVariationId === newVariationId
                                  );

                                  handleQuantityChange(
                                    item.ProductId,
                                    item.Quantity,
                                    newVariationId,
                                    newVariation?.Price
                                  );
                                }}
                                className="border rounded px-2 py-1 text-gray-700"
                              >
                                {item.Variations.map((variation) => (
                                  <option
                                    key={variation.ProductVariationId}
                                    value={variation.ProductVariationId}
                                  >
                                    {variation.Ml}ml
                                  </option>
                                ))}
                              </select>
                            </p>
                            <p className="text-xs mt-1 text-gray-600">
                              x{item.Quantity ?? 1}
                            </p>
                          </div>
                          <p className="text-sm font-bold text-gray-700">
                            $
                            {(
                              (item?.Price || 0) * (item.Quantity || 1)
                            ).toFixed(2)}
                          </p>
                          {/* Remove Button */}
                          <button
                            onClick={() => removeFromCart(item.ProductId)}
                          >
                            <FontAwesomeIcon
                              icon={faTrash}
                              className="text-red-500 hover:text-red-700 text-base transition"
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="text-center mt-3">
                      <Link
                        to="/cart"
                        className="block bg-emerald-600 text-white font-semibold py-2 rounded-md hover:bg-emerald-700 transition"
                      >
                        View Cart
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:flex hidden space-x-4 items-center ml">
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="text-gray-700 font-medium hover:text-emerald-600 transition"
                >
                  Log Out
                </button>
              ) : (
                <Link
                  to="/joinus"
                  className="text-gray-700 font-medium hover:text-emerald-600 transition"
                >
                  Join Us
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Smart Navbar Button (Visible only in md and sm) */}
      <div
        className="fixed w-14 h-14 bg-gray-800 opacity-80 rounded-full flex items-center justify-center cursor-pointer z-[10000] md:flex lg:hidden sm:flex"
        style={{
          left: position.x,
          top: position.y,
          transition: isDragging ? 'none' : 'transform 0.1s ease-in-out',
          pointerEvents: 'auto',
        }}
        onMouseDown={handleDragStart}
        onMouseMove={handleDrag}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDrag}
        onTouchEnd={handleDragEnd}
        onClick={() => setIsSidebarOpen(true)}
      >
        <FontAwesomeIcon icon={faBars} className="text-white text-2xl" />
      </div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-48 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-[9999] ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-2 flex justify-center items-center border-b">
          <img
            src="/src/assets/logoalone.png"
            alt="CareSkin Logo"
            className="h-[3.75rem]"
          />{' '}
        </div>
        <ul className="p-4 space-y-8 text-gray-700 font-medium text-center">
          {navLinks.map((link, index) => (
            <li key={index} className="hover:text-emerald-600 transition">
              <Link to={link.path} onClick={() => setIsSidebarOpen(false)}>
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
        <div className="p-4 flex space-x-4 justify-center border-b">
          {/* User Profile */}
          <button onClick={handleProfileClick}>
            <FontAwesomeIcon
              icon={faUser}
              className="text-gray-700 hover:text-emerald-600 text-xl transition"
            />
          </button>

          {/* Wishlist Icon */}
          <Link to="/wishlist">
            <FontAwesomeIcon
              icon={faHeart}
              className="text-gray-700 hover:text-emerald-600 text-xl transition"
            />
          </Link>

          {/* Cart Icon with Badge */}
          <Link to="/cart" className="relative">
            <FontAwesomeIcon
              icon={faShoppingCart}
              className="text-gray-700 hover:text-emerald-600 text-xl transition"
            />
            {totalItems > 0 && (
              <span className="absolute -top-3 -right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
        <div className="p-4 flex justify-center">
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-gray-700 text-2xl"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      </div>
    </>
  );
}

export default Navbar;
