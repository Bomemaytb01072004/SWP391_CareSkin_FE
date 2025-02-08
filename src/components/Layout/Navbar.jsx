import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Header from '../../components/Layout/Header';
import {
  faUser,
  faHeart,
  faShoppingCart,
  faBars,
} from '@fortawesome/free-solid-svg-icons';

function Navbar() {
  const [scrollingUp, setScrollingUp] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(window.scrollY);

  const [showSmartNav, setShowSmartNav] = useState(false);
  const [isSmartNavVisible, setIsSmartNavVisible] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);

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
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setShowSmartNav(true);
      } else {
        setShowSmartNav(false);
        setIsSmartNavVisible(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDrag = (e) => {
    if (isDragging) {
      setPosition({ x: e.clientX - 20, y: e.clientY - 20 });
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Sales', path: '/sales' },
    { name: 'SkinQuiz', path: '/skinquiz' },
    { name: 'Blogs', path: '/blogs' },
    { name: 'About', path: '/about' },
  ];
  return (
    <>
      <nav
        className={`bg-white shadow-md fixed top-0 w-full z-50 transition-transform duration-300 ${
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
          <ul className="flex-1 flex justify-center item lg:space-x-12 lg:mr-2 mx-auto space-x-8    text-gray-700 lg:font-medium">
            {navLinks.map((link, index) => (
              <li key={index} className="hover:text-emerald-600 transition">
                <Link to={link.path}>{link.name}</Link>
              </li>
            ))}
          </ul>

          {/* Right Side */}
          <div className="lg:flex md:flex space-x-5 items-center">
            <div className="lg:flex md:flex hidden space-x-4 items-center">
              <FontAwesomeIcon
                icon={faUser}
                className="text-gray-700 hover:text-emerald-600 text-xl transition"
              />
              <FontAwesomeIcon
                icon={faHeart}
                className="text-gray-700 hover:text-emerald-600 text-xl transition"
              />
              <FontAwesomeIcon
                icon={faShoppingCart}
                className="text-gray-700 hover:text-emerald-600 text-xl transition"
              />
            </div>
            <div className="lg:flex hidden space-x-4 items-center ml">
              <Link
                to="/joinus"
                className="text-gray-700 font-medium hover:text-emerald-600 transition"
              >
                Join Us
              </Link>
            </div>
          </div>
        </div>
      </nav>
      {/* Smart Navbar Button - Only Show on Mobile */}
      {showSmartNav && (
        <div
          className="fixed w-14 h-14 bg-gray-800 opacity-50 rounded-full flex items-center justify-center cursor-pointer z-50"
          style={{
            left: position.x,
            top: position.y,
            transition: isDragging ? 'none' : 'transform 0.3s ease',
          }}
          onMouseDown={handleDragStart}
          onMouseMove={handleDrag}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onClick={() => setIsSmartNavVisible(!isSmartNavVisible)}
        >
          <FontAwesomeIcon icon={faBars} className="text-white text-2xl" />
        </div>
      )}

      {/* Smart Navbar - Appears When Button is Clicked */}
      {isSmartNavVisible && (
        <div
          className="fixed bg-transparent shadow-lg rounded-lg p-4 flex flex-col space-y-4 z-50 backdrop-blur-md"
          style={{ left: position.x, top: position.y + 60 }}
        >
          {[faUser, faHeart, faShoppingCart].map((icon, index) => (
            <FontAwesomeIcon
              key={index}
              icon={icon}
              className="text-gray-700 hover:text-emerald-600 text-2xl transition"
            />
          ))}
        </div>
      )}
    </>
  );
}

export default Navbar;
