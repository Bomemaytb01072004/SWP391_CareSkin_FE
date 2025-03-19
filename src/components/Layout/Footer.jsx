import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faInstagram,
  faFacebook,
  faTwitter,
  faTiktok,
  faYoutube,
} from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faArrowRight } from '@fortawesome/free-solid-svg-icons';

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

  return (
    <footer className="bg-gradient-to-b from-emerald-50 to-emerald-100/50 pt-12 pb-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Newsletter Section - New Addition */}
        <div className="relative mb-16 bg-emerald-600 rounded-2xl overflow-hidden shadow-lg">
          <div className="absolute inset-0 opacity-10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400 opacity-20 rounded-full -translate-y-1/3 translate-x-1/4"></div>
          <div className="absolute bottom-0 left-10 w-32 h-32 bg-emerald-300 opacity-20 rounded-full translate-y-1/3"></div>

          <div className="relative z-10 px-6 py-10 md:py-12 flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0 text-center md:text-left">
              <h3 className="text-white text-2xl md:text-3xl font-bold mb-2">
                Join our skincare journey
              </h3>
              <p className="text-emerald-100 text-sm md:text-base max-w-md">
                Subscribe to get exclusive updates, offers, and personalized
                skincare tips.
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="w-full md:w-auto">
              <div className="relative flex items-center">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full md:w-80 py-3 px-5 pr-12 rounded-full bg-white/90 backdrop-blur border-2 border-transparent focus:border-emerald-200 text-gray-700 focus:outline-none shadow-md"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="absolute right-1 h-10 w-10 rounded-full bg-emerald-700 hover:bg-emerald-800 transition-colors flex items-center justify-center text-white"
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
                <p className="text-xs text-white mt-2 text-center md:text-right">
                  Thanks for subscribing! Check your inbox soon.
                </p>
              )}
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Logo and Description */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center -ml-2 -mt-2">
              <img
                src="/src/assets/logo.png"
                alt="CareSkin Logo"
                className="w-[13.125rem] h-[4.375rem] mr-2"
              />
            </div>
            <p className="text-gray-600 text-sm mt-3 text-center md:text-left">
              Your journey to healthy, glowing skin starts here. Discover
              personalized skincare routines for your unique needs.
            </p>
            <div className="flex space-x-4 mt-6 text-emerald-700">
              {[
                { icon: faInstagram, url: '#' },
                { icon: faFacebook, url: '#' },
                { icon: faTwitter, url: '#' },
                { icon: faTiktok, url: '#' },
                { icon: faYoutube, url: '#' },
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  className="hover:text-emerald-500 transition-colors"
                  aria-label={`Follow us on ${social.icon.iconName}`}
                >
                  <FontAwesomeIcon icon={social.icon} size="lg" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 relative">
              Quick Links
              <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-emerald-300 transform md:w-12 w-full"></span>
            </h3>
            <ul className="space-y-2 sm:text-center text-gray-600">
              {['Home', 'About Us', 'Blog', 'Skin Quiz', 'Contact Us'].map(
                (link, i) => (
                  <li key={i}>
                    <a
                      href="#"
                      className="hover:text-emerald-600 transition-colors flex items-center"
                    >
                      <span className="mr-2 text-xs opacity-0 group-hover:opacity-100">
                        ›
                      </span>{' '}
                      {link}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Shop */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 relative">
              Shop
              <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-emerald-300 transform md:w-12 w-full"></span>
            </h3>
            <ul className="space-y-2 text-gray-600">
              {[
                'All Products',
                'Bestsellers',
                'New Arrivals',
                'Gift Sets',
                'Skincare Tools',
                'Special Offers',
              ].map((link, i) => (
                <li key={i}>
                  <a
                    href="#"
                    className="hover:text-emerald-600 transition-colors group flex items-center"
                  >
                    <span className="mr-2 text-xs opacity-0 group-hover:opacity-100">
                      ›
                    </span>{' '}
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Help & Support */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 relative">
              Help & Support
              <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-emerald-300 transform md:w-12 w-full"></span>
            </h3>
            <ul className="space-y-2 text-gray-600">
              {[
                'FAQs',
                'Shipping Information',
                'Returns & Exchanges',
                'Track Your Order',
                'Privacy Policy',
                'Terms of Service',
              ].map((link, i) => (
                <li key={i}>
                  <a
                    href="#"
                    className="hover:text-emerald-600 transition-colors group flex items-center"
                  >
                    <span className="mr-2 text-xs opacity-0 group-hover:opacity-100">
                      ›
                    </span>{' '}
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section with Payment Icons */}
        <div className="border-t border-emerald-200/50 pt-6 mt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm">
              © 2025 CareSkin. All rights reserved.
            </p>

            <div className="flex flex-wrap justify-center mt-4 md:mt-0 gap-3">
              {['Visa', 'MasterCard', 'PayPal', 'ApplePay'].map((payment) => (
                <span
                  key={payment}
                  className="bg-white text-xs text-gray-500 px-3 py-1 rounded shadow-sm border border-gray-100"
                >
                  {payment}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
