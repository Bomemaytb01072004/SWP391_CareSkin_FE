import React from 'react';
import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';
import SloganCarousel from '../../components/HomePage/Carousel/SloganCarousel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import BestSellers from '../../components/HomePage/BestSellers';
import ServiceFeedback from '../../components/HomePage/ServiceFeedback';
import {
  faDroplet,
  faSun,
  faJar,
  faFlask,
} from '@fortawesome/free-solid-svg-icons';

function HomePage() {
  return (
    <>
      <Navbar />
      {/* Skin Quiz Section */}
      <div className="flex flex-col md:flex-row items-center text-center mt-16 md:text-left py-16 px-6 md:px-10 bg-white w-full max-w-7xl mx-auto">
        {/* Left Side: Text */}
        <div className="md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
          <h1
            className="font-bold leading-tight mb-4 text-3xl md:text-5xl lg:text-6xl"
            style={{
              textShadow: '0.13rem 0.13rem 0.3rem rgba(0, 0, 0, 0.25)',
              color: 'rgba(0, 0, 0, 1)',
            }}
          >
            Discover Your Perfect Skincare Routine
          </h1>
          <p className="text-base md:text-lg text-gray-600 mb-6">
            Take our personalized skin quiz and get a customized skincare
            routine that works for your unique needs.
          </p>
          <a
            href="/skinquiz"
            className="px-6 py-3 bg-emerald-600 text-white rounded-full shadow-md hover:bg-emerald-700 transition"
          >
            Take Skin Quiz
          </a>
        </div>

        {/* Right Side: Image */}
        <div className="w-full md:w-1/2 flex justify-center mt-10 md:mt-0">
          <SloganCarousel />
        </div>
      </div>

      {/* Shop by Category Section */}
      <div className="py-16 bg-gray-50 rounded-xl mx-auto max-w-screen-2xl px-5 mt-10">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-16">
          Shop by Category
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-7xl mx-auto justify-items-center">
          {[
            {
              icon: faDroplet,
              title: 'Cleansers',
              description: 'Start with a clean slate',
            },
            {
              icon: faFlask,
              title: 'Serums',
              description: 'Target specific concerns',
            },
            {
              icon: faJar,
              title: 'Moisturizers',
              description: 'Lock in hydration',
            },
            {
              icon: faSun,
              title: 'Sunscreen',
              description: 'Daily protection',
            },
          ].map((category, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center bg-white p-6 rounded-lg shadow-sm hover:shadow-lg transition w-full"
            >
              <span className="p-5 bg-emerald-100 rounded-full flex items-center justify-center w-20 h-20">
                <FontAwesomeIcon
                  icon={category.icon}
                  className="text-emerald-600 text-3xl"
                />
              </span>
              <h3 className="text-xl font-semibold text-center mt-3">
                {category.title}
              </h3>
              <p className="text-gray-600 font-light text-sm text-center mt-2">
                {category.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Not Sure Where to Start Section */}
      <div className="bg-emerald-50 py-12 px-6 text-center rounded-xl shadow-md mx-auto max-w-6xl mt-16 mb-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Not Sure Where to Start?
        </h2>
        <p className="text-gray-600 text-base md:text-lg mb-6">
          Take our 2-minute skin quiz to get personalized product
          recommendations based on your skin type, concerns, and goals.
        </p>
        <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
          <button className="px-6 py-3 bg-emerald-600 text-white rounded-full shadow-md hover:bg-emerald-700 transition">
            Start Quiz Now
          </button>
          <button className="px-6 py-3 bg-white border border-emerald-600 text-emerald-600 rounded-full shadow-md hover:bg-emerald-50 transition">
            Learn More
          </button>
        </div>
      </div>

      {/* BestSellers */}
      <BestSellers />
      {/* ServiceFeedback */}
      <ServiceFeedback />

      {/* Footer */}
      <Footer />
    </>
  );
}

export default HomePage;
