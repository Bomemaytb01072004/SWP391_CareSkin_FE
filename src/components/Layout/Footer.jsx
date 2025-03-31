import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faInstagram,
  faFacebook,
  faTwitter,
  faTiktok,
  faYoutube,
} from '@fortawesome/free-brands-svg-icons';
import {
  faEnvelope,
  faArrowRight,
  faMapMarkerAlt,
  faPhone,
  faLeaf,
  faClock,
} from '@fortawesome/free-solid-svg-icons';

function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  // Quick links with proper routes
  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Blog', path: '/blogs' },
    { name: 'Skin Quiz', path: '/skinquiz' },
  ];

  // Shop links with routes and query parameters
  const shopLinks = [
    { name: 'All Products', path: '/products' },
    {
      name: 'Bestsellers',
      path: '/products',
      state: { fromBestsellers: true },
    },
    {
      name: 'New Arrivals',
      path: '/products',
      state: { fromNewArrivals: true },
    },
  ];

  // Help & Support links - some may need to be created later
  const helpLinks = [
    { name: 'Track Your Order', path: '/profile?tab=Order History' },
    { name: 'Contact Us', path: '/contact' },
    { name: 'FAQs', path: '/faq' },
  ];

  return (
    <footer className="relative bg-gradient-to-b from-emerald-50 to-emerald-100/50 pt-16 pb-8 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-300 via-emerald-500 to-emerald-300"></div>
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-200 rounded-full opacity-20"></div>
      <div className="absolute top-32 -left-16 w-32 h-32 bg-emerald-200 rounded-full opacity-20"></div>

      <div className="max-w-7xl mx-auto">
        {/* Newsletter Section - Enhanced */}
        <div className="relative mb-20 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-pattern opacity-10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400 opacity-20 rounded-full -translate-y-1/3 translate-x-1/4"></div>
          <div className="absolute bottom-0 left-10 w-32 h-32 bg-emerald-300 opacity-20 rounded-full translate-y-1/3"></div>

          <div className="relative z-10 px-6 py-10 md:py-12 flex flex-col md:flex-row justify-between items-center">
            <div className="mb-8 md:mb-0 text-center md:text-left">
              <h3 className="text-white text-2xl md:text-3xl font-bold mb-3">
                Join our skincare journey
              </h3>
              <p className="text-emerald-100 text-sm md:text-base max-w-md">
                Subscribe to get exclusive updates, offers, and personalized
                skincare tips delivered to your inbox.
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="w-full md:w-auto">
              <div className="relative flex items-center">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full md:w-80 py-3 px-5 pr-12 rounded-full bg-white/90 backdrop-blur border-2 border-transparent focus:border-emerald-200 text-gray-700 focus:outline-none shadow-md transition-all duration-300"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="absolute right-1 h-10 w-10 rounded-full bg-emerald-700 hover:bg-emerald-800 transition-colors flex items-center justify-center text-white shadow-md hover:shadow-lg transform hover:scale-105 transition-transform duration-300"
                  aria-label="Subscribe"
                >
                  {subscribed ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  ) : (
                    <FontAwesomeIcon icon={faArrowRight} size="sm" />
                  )}
                </button>
              </div>
              {subscribed && (
                <div className="text-xs text-white mt-2 text-center md:text-right bg-emerald-800/30 p-2 rounded-md animate-fadeIn">
                  Thanks for subscribing! Check your inbox soon.
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-12 mb-12">
          {/* Company Info Section - Enhanced */}
          <div className="flex flex-col items-center md:items-start">
            <div className="mb-5">
              <Link
                to="/"
                className="block transform hover:scale-105 transition-transform duration-300"
              >
                <img
                  src="/src/assets/logo.png"
                  alt="CareSkin Logo"
                  className="w-[13.125rem] h-[4.375rem]"
                />
              </Link>
            </div>
            <p className="text-gray-600 text-sm mt-3 text-center md:text-left">
              Your journey to healthy, glowing skin starts here. Discover
              personalized skincare routines for your unique needs.
            </p>

            {/* Contact Details */}
            <div className="mt-6 space-y-3 text-sm text-gray-600">
              <div className="flex items-center">
                <FontAwesomeIcon
                  icon={faMapMarkerAlt}
                  className="text-emerald-600 mr-3"
                />
                <span>Luu Huu Phuoc Tan Lap, Dong Hoa, Di An, Binh Duong</span>
              </div>
              <div className="flex items-center">
                <FontAwesomeIcon
                  icon={faPhone}
                  className="text-emerald-600 mr-3"
                />
                <span>(+84) 888151546</span>
              </div>
              <div className="flex items-center">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="text-emerald-600 mr-3"
                />
                <span>careskinbeautyshop@gmail.com</span>
              </div>
            </div>

            {/* Social Media - Enhanced */}
            <div className="flex space-x-4 mt-6">
              {[
                {
                  icon: faInstagram,
                  url: 'https://instagram.com',
                  color: 'hover:bg-pink-600',
                },
                {
                  icon: faFacebook,
                  url: 'https://facebook.com',
                  color: 'hover:bg-blue-600',
                },
                {
                  icon: faTwitter,
                  url: 'https://twitter.com',
                  color: 'hover:bg-sky-500',
                },
                {
                  icon: faTiktok,
                  url: 'https://tiktok.com',
                  color: 'hover:bg-black',
                },
                {
                  icon: faYoutube,
                  url: 'https://youtube.com',
                  color: 'hover:bg-red-600',
                },
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center ${social.color} hover:text-white transition-all duration-300 transform hover:scale-110`}
                  aria-label={`Follow us on ${social.icon.iconName}`}
                >
                  <FontAwesomeIcon icon={social.icon} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links - Enhanced */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-semibold text-gray-800 mb-5 relative group">
              <div className="flex items-center">
                <span className="bg-emerald-100 p-1.5 rounded-md mr-2 group-hover:bg-emerald-200 transition-colors">
                  <FontAwesomeIcon icon={faLeaf} className="text-emerald-600" />
                </span>
                Quick Links
              </div>
              <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-emerald-300 transform md:w-16 w-full origin-left scale-0 group-hover:scale-100 transition-transform duration-300"></span>
            </h3>
            <ul className="space-y-2.5 sm:text-center md:text-left text-gray-600 w-full">
              {quickLinks.map((link, i) => (
                <li key={i}>
                  <Link
                    to={link.path}
                    className="hover:text-emerald-600 transition-colors group flex items-center py-0.5"
                  >
                    <span className="mr-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      ›
                    </span>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shop - Enhanced */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-semibold text-gray-800 mb-5 relative group">
              <div className="flex items-center">
                <span className="bg-emerald-100 p-1.5 rounded-md mr-2 group-hover:bg-emerald-200 transition-colors">
                  <svg
                    className="w-4 h-4 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </span>
                Shop
              </div>
              <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-emerald-300 transform md:w-16 w-full origin-left scale-0 group-hover:scale-100 transition-transform duration-300"></span>
            </h3>
            <ul className="space-y-2.5 sm:text-center md:text-left text-gray-600 w-full">
              {shopLinks.map((link, i) => (
                <li key={i}>
                  <Link
                    to={link.path}
                    state={link.state}
                    className="hover:text-emerald-600 transition-colors group flex items-center py-0.5"
                  >
                    <span className="mr-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      ›
                    </span>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help & Support - Enhanced */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-semibold text-gray-800 mb-5 relative group">
              <div className="flex items-center">
                <span className="bg-emerald-100 p-1.5 rounded-md mr-2 group-hover:bg-emerald-200 transition-colors">
                  <svg
                    className="w-4 h-4 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </span>
                Help & Support
              </div>
              <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-emerald-300 transform md:w-16 w-full origin-left scale-0 group-hover:scale-100 transition-transform duration-300"></span>
            </h3>
            <ul className="space-y-2.5 sm:text-center md:text-left text-gray-600 w-full">
              {helpLinks.map((link, i) => (
                <li key={i}>
                  <Link
                    to={link.path}
                    className="hover:text-emerald-600 transition-colors group flex items-center py-0.5"
                  >
                    <span className="mr-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      ›
                    </span>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section with Payment Icons - Enhanced */}
        <div className="border-t border-emerald-200/50 pt-6 mt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-col sm:flex-row items-center mb-4 md:mb-0">
              <p className="text-gray-600 text-sm">
                © 2025 CareSkin. All rights reserved.
              </p>
              {/* <div className="flex space-x-4 sm:ml-6 mt-2 sm:mt-0">
                <Link
                  to="/privacy"
                  className="text-xs text-gray-500 hover:text-emerald-600 transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  to="/terms"
                  className="text-xs text-gray-500 hover:text-emerald-600 transition-colors"
                >
                  Terms of Service
                </Link>
              </div> */}
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {['VNPay', 'Momo', 'ZaloPay'].map((payment) => (
                <span
                  key={payment}
                  className="bg-white text-xs text-gray-500 px-3 py-1 rounded shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
                >
                  {payment}
                </span>
              ))}
            </div>
          </div>

          {/* Extra Bottom Note */}
          <p className="text-center text-xs text-gray-400 mt-6">
            CareSkin is committed to sustainable skincare practices and
            environmentally friendly packaging.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
