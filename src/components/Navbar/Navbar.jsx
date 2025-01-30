import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faHeart,
  faShoppingCart,
  faBars,
} from '@fortawesome/free-solid-svg-icons';

function Navbar() {
  const [scrollingUp, setScrollingUp] = useState(true);
  const [showSmartNav, setShowSmartNav] = useState(false);
  const [isSmartNavVisible, setIsSmartNavVisible] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      setScrollingUp(window.scrollY < lastScrollY);
      lastScrollY = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
  return (
    <>
      <nav
        className={`bg-white shadow-md sticky top-0 z-50 transform transition-transform duration-300 ${
          scrollingUp ? 'translate-y-0' : '-translate-y-full'
        } md:translate-y-0`}
      >
        <div className=" mx-auto px-4 lg:px-8 flex items-center justify-between h-16">
          {/* Logo */}
          <div className="lg:flex hidden">
            <img
              src="src/assets/logo.png"
              alt="CareSkin Logo"
              className="w-[13.125rem] h-[4.375rem]"
            />
          </div>

          {/* Navigation Links */}
          <ul className="flex-1 flex justify-center item lg:space-x-12 lg:mr-2 mx-auto space-x-8    text-gray-700 lg:font-medium">
            <li className="hover:text-emerald-600 transition">
              <a href="/">Home</a>
            </li>
            <li className="hover:text-emerald-600 transition">
              <a href="#">Products</a>
            </li>
            <li className="hover:text-emerald-600 transition">
              <a href="#">Sales</a>
            </li>
            <li className="hover:text-emerald-600 transition">
              <a href="#">SkinQuiz</a>
            </li>
            <li className="hover:text-emerald-600 transition">
              <a href="#">Blogs</a>
            </li>
            <li className="hover:text-emerald-600 transition">
              <a href="#">About</a>
            </li>
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

            <div className="lg:flex hidden space-x-4 items-center ml ">
              <a
                className="text-gray-700 font-medium hover:text-emerald-600 transition"
                href="/joinus"
              >
                Join Us
              </a>
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
