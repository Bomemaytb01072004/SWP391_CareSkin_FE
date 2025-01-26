import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faInstagram,
  faFacebook,
  faTwitter,
  faPinterest,
} from '@fortawesome/free-brands-svg-icons';

function Footer() {
  return (
    <footer className="bg-emerald-50 py-10 px-6">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-start space-y-8 md:space-y-0">
        {/* Logo and Description */}
        <div className="flex flex-col items-start text-left w-full md:w-1/4">
          {/* Logo */}
          <div className="flex items-center -ml-2 -mt-2">
            <img
              src="src/assets/logo.png"
              alt="CareSkin Logo"
              className="w-[13.125rem] h-[4.375rem] mr-2"
            />
          </div>
          <p className="text-gray-600 text-sm font-extralight">
            Your journey to healthy, glowing skin <br /> starts here.
          </p>
        </div>

        {/* Links: Shop */}
        <div className="w-full md:w-1/4 text-left transform translate-x-40">
          <h3
            className="text-lg font-semibold text-gray-800 mb-4"
            style={{
              textShadow: '0.13rem 0.13rem 0.3rem rgba(0, 0, 0, 0.25)',
            }}
          >
            Shop
          </h3>
          <ul className="space-y-2 text-gray-600 text-sm font-extralight">
            <li>
              <a href="#" className="hover:text-emerald-600">
                All Products
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-emerald-600">
                Bestsellers
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-emerald-600">
                New Arrivals
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-emerald-600">
                Gift Sets
              </a>
            </li>
          </ul>
        </div>

        {/* Links: Help */}
        <div className="w-full md:w-1/4 text-left transform translate-x-40">
          <h3
            className="text-lg font-semibold text-gray-800 mb-4"
            style={{
              textShadow: '0.13rem 0.13rem 0.3rem rgba(0, 0, 0, 0.25)',
            }}
          >
            Help
          </h3>
          <ul className="space-y-2 text-gray-600 text-sm font-extralight">
            <li>
              <a href="#" className="hover:text-emerald-600">
                Contact Us
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-emerald-600">
                Shipping
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-emerald-600">
                Returns
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-emerald-600">
                FAQ
              </a>
            </li>
          </ul>
        </div>

        {/* Follow Us */}
        <div className="w-full md:w-1/4 text-left transform translate-x-40">
          <h3
            className="text-lg font-semibold text-gray-800 mb-4"
            style={{
              textShadow: '0.13rem 0.13rem 0.3rem rgba(0, 0, 0, 0.25)',
            }}
          >
            Follow Us
          </h3>
          <div className="flex space-x-4 text-gray-600">
            <a href="#" className="hover:text-emerald-600">
              <FontAwesomeIcon icon={faInstagram} />
            </a>
            <a href="#" className="hover:text-emerald-600">
              <FontAwesomeIcon icon={faFacebook} />
            </a>
            <a href="#" className="hover:text-emerald-600">
              <FontAwesomeIcon icon={faTwitter} />
            </a>
            <a href="#" className="hover:text-emerald-600">
              <FontAwesomeIcon icon={faPinterest} />
            </a>
          </div>
        </div>
      </div>

      {/* Horizontal Line */}
      <hr className="my-8 border-gray-800" />

      {/* Bottom Section */}
      <div className="flex flex-col md:flex-row justify-between text-center md:text-left text-gray-600 text-sm  ">
        <p className="transform translate-x-40">
          © 2025 CareSkin. All rights reserved.
        </p>
        <div className="flex space-x-6 mt-4 md:mt-0 transform -translate-x-40">
          <a href="#" className="hover:text-emerald-600">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-emerald-600">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
