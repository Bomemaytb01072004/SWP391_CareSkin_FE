import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb'; // Import Breadcrumb

import { faCircleInfo, faUserEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Example skincare routines based on skin type
const routinesBySkinType = {
  Normal: {
    morning: [
      {
        step: 1,
        name: 'Hydrating Cleanser',
        description: 'Gently cleanses and refreshes your skin.',
        price: '$28',
        image:
          'https://raw.githubusercontent.com/vitoo16/IMAGESFAKEDATA/refs/heads/main/sloganimage3.png',
        detailsLink: '#',
        tutorialLink: '#',
      },
      {
        step: 2,
        name: 'Vitamin C Serum',
        description: 'Brightens and evens out skin tone.',
        price: '$32',
        image:
          'https://raw.githubusercontent.com/vitoo16/IMAGESFAKEDATA/refs/heads/main/sloganimage3.png',
        detailsLink: '#',
        tutorialLink: '#',
      },
      {
        step: 3,
        name: 'Lightweight Moisturizer',
        description: 'Hydrates and nourishes your skin all day.',
        price: '$30',
        image:
          'https://raw.githubusercontent.com/vitoo16/IMAGESFAKEDATA/refs/heads/main/sloganimage3.png',
        detailsLink: '#',
        tutorialLink: '#',
      },
    ],
    evening: [
      {
        step: 1,
        name: 'Cleansing Balm',
        description: 'Melts away makeup and impurities.',
        price: '$25',
        image:
          'https://raw.githubusercontent.com/vitoo16/IMAGESFAKEDATA/refs/heads/main/sloganimage3.png',
        detailsLink: '#',
        tutorialLink: '#',
      },
      {
        step: 2,
        name: 'Retinol Serum',
        description: 'Supports skin renewal overnight.',
        price: '$35',
        image:
          'https://raw.githubusercontent.com/vitoo16/IMAGESFAKEDATA/refs/heads/main/sloganimage3.png',
        detailsLink: '#',
        tutorialLink: '#',
      },
      {
        step: 3,
        name: 'Night Repair Cream',
        description: 'Deeply hydrates and restores skin.',
        price: '$40',
        image:
          'https://raw.githubusercontent.com/vitoo16/IMAGESFAKEDATA/refs/heads/main/sloganimage3.png',
        detailsLink: '#',
        tutorialLink: '#',
      },
    ],
    treatments: [
      {
        name: 'Clay Mask (Sunday)',
        description: 'Absorbs excess oil and unclogs pores.',
      },
      {
        name: 'Chemical Exfoliant (Wednesday)',
        description: 'Gently removes dead skin cells for a smoother texture.',
      },
    ],
  },
};

const SkinRoutinePage = () => {
  const navigate = useNavigate();
  const [routine, setRoutine] = useState(null);

  useEffect(() => {
    const storedRoutine = JSON.parse(localStorage.getItem('skincareResult'));

    if (storedRoutine && storedRoutine.skinType) {
      const selectedRoutine =
        routinesBySkinType[storedRoutine.skinType] || routinesBySkinType.Normal;
      setRoutine({ ...storedRoutine, ...selectedRoutine });
    } else {
      setRoutine(routinesBySkinType.Normal);
    }
  }, []);

  const resetRoutine = () => {
    localStorage.removeItem('skincareResult');
    navigate('/skinquiz');
  };

  if (!routine) {
    return (
      <div className="text-center mt-10 text-gray-600">
        Loading your skincare routine...
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-emerald-50 min-h-screen pt-10 mt-20">
        {/* Breadcrumb Section */}
        <div className="max-w-5xl mx-auto flex justify-between items-center px-6 text-emerald-700 text-sm">
          <Breadcrumb items={[{ label: 'SkinQuiz', active: true }]} />

          <a
            href="/edit-profile"
            className="flex items-center text-emerald-700 hover:underline"
          >
            <FontAwesomeIcon icon={faUserEdit} className="mr-1" />
            Edit Profile
          </a>
        </div>
        {/* Header Section */}
        <div className=" mx-auto bg-emerald-50 p-10 shadow-lg text-center">
          <p className="text-emerald-700 font-semibold">
            Your Personalized Routine
          </p>

          <h2 className="text-3xl font-bold text-gray-800">
            Your Personalized Routine
          </h2>
          <div className="flex flex-wrap justify-center gap-3 mt-3">
            <span className="px-4 py-1 bg-white text-gray-700 rounded-full text-sm shadow-sm">
              {routine.skinType}
            </span>
            {routine.concerns.map((concern) => (
              <span
                key={concern}
                className="px-3 py-1 bg-white text-gray-700 rounded-full text-sm shadow-sm"
              >
                {concern}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <button className="px-4 py-2 sm:px-6 sm:py-3 bg-emerald-600 text-white rounded-full shadow-md hover:bg-emerald-700 transition">
              Add All
            </button>
            <button
              className="px-4 py-2 sm:px-6 sm:py-3 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition"
              onClick={resetRoutine}
            >
              Reset & Retake Quiz
            </button>
          </div>
        </div>

        {/* Morning Routine */}
        <div className="w-full bg-white py-10 sm:py-12">
          <div className="max-w-5xl mx-auto px-2 sm:px-4">
            <h3 className="text-lg sm:text-xl font-bold text-yellow-600 mb-4 sm:mb-6">
              ☀ Morning Routine
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {routine.morning.map((item, index) => (
                <div
                  key={index}
                  className="p-4 bg-white rounded-lg shadow-md flex gap-4"
                >
                  <div className="flex items-center justify-center text-base sm:text-lg font-bold text-gray-800 w-10">
                    {item.step}
                  </div>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 sm:w-20 h-16 sm:h-20 rounded-lg object-cover border border-gray-300"
                  />
                  <div>
                    <h4 className="text-sm sm:text-lg font-semibold text-gray-800">
                      {item.name}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {item.description}
                    </p>
                    <div className="flex flex-col md:flex-row items-center gap-3 text-sm text-emerald-600 mt-4">
                      <a
                        href={item.detailsLink}
                        className="flex items-center gap-1 hover:underline"
                      >
                        <FontAwesomeIcon icon={faCircleInfo} /> Product Details
                      </a>
                      <a href={item.tutorialLink} className="hover:underline">
                        ▶ Watch Tutorial
                      </a>
                      <span className="font-bold">{item.price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/*Evening Routine*/}
        <div className="w-full bg-[#F9FAFB] py-10 sm:py-12">
          <div className="max-w-5xl mx-auto px-2 sm:px-4">
            <h3 className="text-lg sm:text-xl font-bold text-yellow-600 mb-4 sm:mb-6">
              🌙 Evening Routine
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {routine.morning.map((item, index) => (
                <div
                  key={index}
                  className="p-4 bg-white rounded-lg shadow-md flex gap-4"
                >
                  <div className="flex items-center justify-center text-base sm:text-lg font-bold text-gray-800 w-10">
                    {item.step}
                  </div>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 sm:w-20 h-16 sm:h-20 rounded-lg object-cover border border-gray-300"
                  />
                  <div>
                    <h4 className="text-sm sm:text-lg font-semibold text-gray-800">
                      {item.name}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {item.description}
                    </p>
                    <div className="flex flex-col md:flex-row items-center gap-3 text-sm text-[#5243AA] mt-4">
                      <a
                        href={item.detailsLink}
                        className="flex items-center gap-1 hover:underline"
                      >
                        <FontAwesomeIcon icon={faCircleInfo} /> Product Details
                      </a>
                      <a href={item.tutorialLink} className="hover:underline">
                        ▶ Watch Tutorial
                      </a>
                      <span className="font-bold">{item.price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Weekly Treatments */}
        <div className="w-full bg-white py-10 sm:py-14">
          <div className="max-w-5xl mx-auto px-4 sm:px-8">
            <h3 className="text-lg sm:text-xl font-bold text-emerald-600 mb-4 sm:mb-6">
              📆 Weekly Treatments
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {routine.treatments.map((treatment, index) => (
                <div
                  key={index}
                  className="p-4 sm:p-6 bg-gray-100 rounded-lg shadow-md"
                >
                  <h4 className="font-semibold text-emerald-600 text-sm sm:text-lg">
                    {treatment.name}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 mt-2">
                    {treatment.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SkinRoutinePage;
