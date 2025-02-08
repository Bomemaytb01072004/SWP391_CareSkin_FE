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
      <div className="mx-auto flex flex-col md:flex-row justify-between items-start space-y-8 md:space-y-0">
        {/* Logo and Description */}
        <div className="lg:flex hidden flex-col ml-6 items-start text-left w-full md:w-1/4">
          {/* Logo */}
          <div className="flex items-center -ml-2 -mt-2">
            <img
              src="/src/assets/logo.png"
              alt="CareSkin Logo"
              className="w-[13.125rem] h-[4.375rem] mr-2"
            />
          </div>
          <p className="text-gray-600 text-sm font-extralight">
            Your journey to healthy, glowing skin <br /> starts here.
          </p>
        </div>

        {/* Links Sections */}
        <div className="grid grid-cols-2 gap-6 w-full md:flex md:flex-row md:w-1/2">
          {[
            {
              title: 'Shop',
              links: [
                'All Products',
                'Bestsellers',
                'New Arrivals',
                'Gift Sets',
              ],
            },
            {
              title: 'Help',
              links: ['Contact Us', 'Shipping', 'Returns', 'FAQ'],
            },
          ].map((section, index) => (
            <div key={index} className="w-full text-left">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2 text-gray-600 text-sm font-extralight">
                {section.links.map((link, i) => (
                  <li key={i}>
                    <a href="#" className="hover:text-emerald-600">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Follow Us */}
        <div className="w-full md:w-1/4 text-left">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Follow Us
          </h3>
          <div className="flex space-x-4 text-gray-600">
            {[faInstagram, faFacebook, faTwitter, faPinterest].map(
              (icon, index) => (
                <a key={index} href="#" className="hover:text-emerald-600">
                  <FontAwesomeIcon icon={icon} />
                </a>
              )
            )}
          </div>
        </div>
      </div>

      {/* Horizontal Line */}
      <hr className="my-8 border-gray-800" />

      {/* Bottom Section */}
      <div className="flex flex-col md:flex-row justify-between text-center md:text-left text-gray-600 text-sm">
        <p>© 2025 CareSkin. All rights reserved.</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
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
