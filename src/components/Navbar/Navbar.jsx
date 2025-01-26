import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faHeart,
  faShoppingCart,
} from '@fortawesome/free-solid-svg-icons';

function Navbar() {
  const [scrollingUp, setScrollingUp] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        // Scrolling down
        setScrollingUp(false);
      } else {
        // Scrolling up
        setScrollingUp(true);
      }
      lastScrollY = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav
      className={`bg-white shadow-md sticky top-0 z-50 transform transition-transform duration-300 ${
        scrollingUp ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="container mx-auto px-4 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <div className="flex items-center transform -translate-x-40">
          <img
            src="src/assets/logo.png"
            alt="CareSkin Logo"
            className="w-[13.125rem] h-[4.375rem] mr-2"
          />
        </div>

        {/* Navigation Links */}
        <ul className="flex-1 flex justify-center space-x-14 text-gray-700 font-medium">
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

        {/* Right Icons */}
        <div className="flex space-x-5 items-center transform translate-x-40">
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
          {/* Join Us button */}

          <div className="flex space-x-4 items-center transform translate-x-5">
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
  );
}

export default Navbar;
