import React from 'react';
import Header from '../../components/Header/Header';
import Navbar from '../../components/Navbar/Navbar';
import SloganCarousel from '../../components/Carousel/SloganCarousel';
import Footer from '../../components/Footer/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import BestSellers from '../../components/BestSellers/BestSellers';
import {
  faDroplet,
  faSun,
  faJar,
  faFlask,
} from '@fortawesome/free-solid-svg-icons';

function HomePage() {
  return (
    <>
      <Header />
      <Navbar />
      {/* Skin Quiz Section */}
      <div className="flex flex-col gap-4  items-center text-center md:justify-between md:flex-row md:text-left py-16 px-6 md:px-8 bg-white">
        {/* Left Side: Text */}
        <div className="mb-10 md:mb-0 md:w-1/2 translate-x-40">
          <h1
            className="font-bold leading-tight mb-4 "
            style={{
              textShadow: '0.13rem 0.13rem 0.3rem rgba(0, 0, 0, 0.25)',
              color: 'rgba(0, 0, 0, 1)',
              fontSize: '4.375rem',
            }}
          >
            Discover Your Perfect Skincare Routine
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Take our personalized skin quiz and get a customized
            <br />
            skincare routine that works for your unique needs.
          </p>

          <button className="px-6 py-3 bg-emerald-600 text-white rounded-full shadow-md hover:bg-emerald-700 transition">
            Take Skin Quiz
          </button>
        </div>

        {/* Right Side: Image */}
        <div className="w-full md:w-1/2 flex justify-center">
          <SloganCarousel />
        </div>
      </div>

      {/* Shop by Category Section */}
      <div className=" py-16 bg-gray-50 rounded-xl  mx-auto max-w-screen-2xl px-5 mt-10">
        <div className="px-5 md:px-8 py-10">
          <h2
            className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-20"
            style={{
              fontSize: '2.625rem',
              textShadow: '0.13rem 0.13rem 0.3rem rgba(0, 0, 0, 0.25)',
            }}
          >
            Shop by Category
          </h2>
          <div className="CategoryGrid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {/* Single Card Template */}
            <div className="flex flex-col items-center justify-center bg-white p-6 rounded-lg shadow-sm hover:shadow-lg transition w-70 h-56">
              <div className="IconContainer mb-4">
                <span
                  className=" p-5 bg-emerald-100 rounded-full flex items-center justify-center"
                  style={{ width: '4.688rem', height: '4.688rem' }}
                >
                  <FontAwesomeIcon
                    icon={faDroplet}
                    style={{ fontSize: '1.875rem' }}
                    className="text-emerald-600"
                  />
                </span>
              </div>
              <h3 className="text-xl font-semibold text-center">Cleansers</h3>
              <p className="text-gray-600 font-light text-sm text-center mt-2">
                Start with a clean slate
              </p>
            </div>

            {/* Repeat the above card for each category with unique content */}
            <div className="flex flex-col items-center justify-center bg-white p-6 rounded-lg shadow-sm hover:shadow-lg transition w-70 h-56">
              <div className="IconContainer mb-4">
                <span
                  className=" p-5 bg-emerald-100 rounded-full flex items-center justify-center"
                  style={{ width: '4.688rem', height: '4.688rem' }}
                >
                  <FontAwesomeIcon
                    icon={faFlask}
                    style={{ fontSize: '1.875rem' }}
                    className="text-emerald-600"
                  />
                </span>
              </div>
              <h3 className="text-xl font-semibold text-center">Serums</h3>
              <p className=" text-gray-600 font-light text-sm text-center mt-2">
                Target specific concerns
              </p>
            </div>

            {/* Moisturizers Card */}
            <div className="flex flex-col items-center justify-center bg-white p-6 rounded-lg shadow-sm hover:shadow-lg transition w-70 h-56">
              <div className="IconContainer mb-4">
                <span
                  className=" p-5 bg-emerald-100 rounded-full flex items-center justify-center"
                  style={{ width: '4.688rem', height: '4.688rem' }}
                >
                  <FontAwesomeIcon
                    icon={faJar}
                    style={{ fontSize: '1.875rem' }}
                    className="text-emerald-600"
                  />
                </span>
              </div>
              <h3 className="CategoryTitle text-xl font-semibold text-center">
                Moisturizers
              </h3>
              <p className="CategoryDescription text-gray-600 font-light text-sm text-center mt-2">
                Lock in hydration
              </p>
            </div>

            {/* Sunscreen Card */}
            <div className="flex flex-col items-center justify-center bg-white p-6 rounded-lg shadow-sm hover:shadow-lg transition w-70 h-56">
              <div className="IconContainer mb-4">
                <span
                  className=" p-5 bg-emerald-100 rounded-full flex items-center justify-center"
                  style={{ width: '4.688rem', height: '4.688rem' }}
                >
                  <FontAwesomeIcon
                    icon={faSun}
                    style={{ fontSize: '1.875rem' }}
                    className="text-emerald-600"
                  />
                </span>
              </div>
              <h3 className="CategoryTitle text-xl font-semibold text-center">
                Sunscreen
              </h3>
              <p className="CategoryDescription text-gray-600 font-light text-sm text-center mt-2">
                Daily protection
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Not Sure Where to Start Section */}

      <div className="QuizPrompt justify-center items-center align-middle bg-emerald-50 py-12 px-6 text-center rounded-xl  shadow-md mx-auto w-[89.063rem]  mt-10 mb-12">
        <h2
          className="text-2xl md:text-3xl font-bold mb-4 text-gray-800"
          style={{
            fontSize: '2.625rem',
            textShadow: '0.13rem 0.13rem 0.3rem rgba(0, 0, 0, 0.25)',
          }}
        >
          Not Sure Where to Start?
        </h2>
        <p className="text-gray-600 text-base md:text-lg mb-6">
          Take our 2-minute skin quiz to get personalized product
          recommendations based <br /> on your skin type, concerns, and goals.
        </p>
        <div className="flex justify-center space-x-4">
          <button className="px-6 py-3 bg-emerald-600 text-white rounded-full shadow-md hover:bg-emerald-700 transition">
            Start Quiz Now
          </button>
          <button className="px-6 py-3 bg-white border border-emerald-600 text-emerald-600 rounded-full shadow-md hover:bg-emerald-50 transition">
            Learn More
          </button>
        </div>
      </div>
      {/* BestSellers */}
      <BestSellers></BestSellers>

      {/* Footer */}
      <Footer></Footer>
    </>
  );
}

export default HomePage;
