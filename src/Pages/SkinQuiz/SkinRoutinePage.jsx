import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { motion } from 'framer-motion';
import {
  faCircleInfo,
  faUserEdit,
  faCartPlus,
  faPlayCircle,
  faRedo,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
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
  const [addedToCart, setAddedToCart] = useState([]);

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

  const addToCart = (product) => {
    // In a real app, this would add to cart state/context
    // For now, we'll just mark it as added for UI feedback
    setAddedToCart((prev) => [...prev, product.name]);
    setTimeout(() => {
      setAddedToCart((prev) => prev.filter((item) => item !== product.name));
    }, 2000);
  };

  const addAllToCart = () => {
    const allProducts = [...routine.morning, ...routine.evening];
    setAddedToCart(allProducts.map((p) => p.name));
    setTimeout(() => {
      setAddedToCart([]);
    }, 2000);
  };

  if (!routine) {
    return (
      <div className="flex items-center justify-center h-screen bg-emerald-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-emerald-700 font-medium">
            Loading your personalized skincare routine...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <div className="bg-gradient-to-b from-emerald-50 to-white min-h-screen pt-10 mt-20">
        {/* Breadcrumb Section */}
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 text-emerald-700 text-sm">
          <Breadcrumb items={[{ label: 'SkinQuiz', active: true }]} />

          <a
            href="/edit-profile"
            className="flex items-center text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            <FontAwesomeIcon icon={faUserEdit} className="mr-2" />
            Edit Profile
          </a>
        </div>

        {/* Header Section with enhanced UI */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto mt-6 bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 py-12 px-8 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-10 w-32 h-32 bg-emerald-300 opacity-20 rounded-full translate-y-1/2"></div>

            <div className="relative z-10 text-center">
              <span className="inline-block bg-emerald-100/20 text-white text-xs uppercase tracking-wider font-semibold px-4 py-1 rounded-full mb-3 backdrop-blur-sm">
                Your Beauty Roadmap
              </span>

              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Your Personalized Skincare Routine
              </h2>

              <p className="text-emerald-100 mb-6 max-w-lg mx-auto">
                Based on your unique skin characteristics, we've curated the
                perfect products to help you achieve your best skin ever.
              </p>

              <div className="flex flex-wrap justify-center gap-3 mt-3">
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="px-4 py-2 bg-white text-emerald-700 font-medium rounded-full text-sm shadow-md border border-emerald-200"
                >
                  {routine.skinType} Skin
                </motion.span>

                {routine.concerns.map((concern, idx) => (
                  <motion.span
                    key={concern}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                    className="px-4 py-2 bg-white text-emerald-700 font-medium rounded-full text-sm shadow-md border border-emerald-200"
                  >
                    {concern}
                  </motion.span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 p-6 bg-gray-50 border-t border-b border-gray-100">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              onClick={addAllToCart}
            >
              <FontAwesomeIcon
                icon={!addedToCart.length ? faCartPlus : faCheck}
              />
              {!addedToCart.length
                ? 'Add All Products to Cart'
                : 'Added to Cart!'}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-white border-2 border-red-400 text-red-500 hover:bg-red-50 rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              onClick={resetRoutine}
            >
              <FontAwesomeIcon icon={faRedo} />
              Reset & Retake Quiz
            </motion.button>
          </div>
        </motion.div>

        {/* Morning Routine - Enhanced UI */}
        <div className="w-full py-12 mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mb-8"
            >
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 text-2xl shadow-sm">
                  ☀️
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    Morning Routine
                  </h3>
                  <p className="text-gray-600">
                    Start your day with these revitalizing products
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Morning Products Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {routine.morning.map((product, index) => (
                <motion.div
                  key={`morning-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all border border-gray-100"
                >
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 left-4 w-9 h-9 rounded-full bg-yellow-500 text-white flex items-center justify-center font-bold shadow-md">
                      {product.step}
                    </div>
                  </div>

                  <div className="p-5">
                    <h4 className="text-xl font-semibold text-gray-800 mb-2">
                      {product.name}
                    </h4>
                    <p className="text-gray-600 mb-4">{product.description}</p>

                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-emerald-700">
                        {product.price}
                      </span>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-4 py-2 rounded-full ${
                          addedToCart.includes(product.name)
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        } 
                          shadow-sm transition-colors flex items-center gap-1`}
                        onClick={() => addToCart(product)}
                      >
                        <FontAwesomeIcon
                          icon={
                            addedToCart.includes(product.name)
                              ? faCheck
                              : faCartPlus
                          }
                        />
                        {addedToCart.includes(product.name)
                          ? 'Added'
                          : 'Add to Cart'}
                      </motion.button>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2">
                      <a
                        href={product.detailsLink}
                        className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                      >
                        <FontAwesomeIcon icon={faCircleInfo} /> Product Details
                      </a>
                      <a
                        href={product.tutorialLink}
                        className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                      >
                        <FontAwesomeIcon icon={faPlayCircle} /> Watch Tutorial
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Evening Routine - Enhanced UI */}
        <div className="w-full py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mb-8"
            >
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-2xl shadow-sm">
                  🌙
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    Evening Routine
                  </h3>
                  <p className="text-gray-600">
                    Repair and rejuvenate your skin while you sleep
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Evening Products Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {routine.evening.map((product, index) => (
                <motion.div
                  key={`evening-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all border border-gray-100"
                >
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 left-4 w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md">
                      {product.step}
                    </div>
                  </div>

                  <div className="p-5">
                    <h4 className="text-xl font-semibold text-gray-800 mb-2">
                      {product.name}
                    </h4>
                    <p className="text-gray-600 mb-4">{product.description}</p>

                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-indigo-700">
                        {product.price}
                      </span>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-4 py-2 rounded-full ${
                          addedToCart.includes(product.name)
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        } 
                          shadow-sm transition-colors flex items-center gap-1`}
                        onClick={() => addToCart(product)}
                      >
                        <FontAwesomeIcon
                          icon={
                            addedToCart.includes(product.name)
                              ? faCheck
                              : faCartPlus
                          }
                        />
                        {addedToCart.includes(product.name)
                          ? 'Added'
                          : 'Add to Cart'}
                      </motion.button>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2">
                      <a
                        href={product.detailsLink}
                        className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                      >
                        <FontAwesomeIcon icon={faCircleInfo} /> Product Details
                      </a>
                      <a
                        href={product.tutorialLink}
                        className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                      >
                        <FontAwesomeIcon icon={faPlayCircle} /> Watch Tutorial
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Weekly Treatments - Enhanced UI */}
        <div className="w-full py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
              className="mb-8"
            >
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-2xl shadow-sm">
                  📆
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    Weekly Treatments
                  </h3>
                  <p className="text-gray-600">
                    Special care to address specific skin concerns
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Weekly Treatments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {routine.treatments.map((treatment, index) => (
                <motion.div
                  key={`treatment-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 + index * 0.1, duration: 0.5 }}
                  className="bg-gradient-to-br from-emerald-50 to-emerald-100/70 rounded-xl p-6 shadow-md border border-emerald-100"
                >
                  <h4 className="text-xl font-semibold text-emerald-800 mb-3">
                    {treatment.name}
                  </h4>
                  <p className="text-gray-700">{treatment.description}</p>

                  <div className="mt-4 pt-4 border-t border-emerald-200/50">
                    <div className="flex items-center text-sm text-emerald-700">
                      <span className="bg-emerald-200 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium">
                        Once Weekly
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Tips Section - New Addition */}
        <div className="w-full py-12 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.6 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
            >
              <div className="p-8 sm:p-10">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <span className="mr-3">💡</span> Tips for {routine.skinType}{' '}
                  Skin
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-100">
                    <h4 className="font-semibold text-yellow-800 mb-2">
                      Daily Habits
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="text-yellow-500 mr-2">•</span>
                        <span className="text-gray-700 text-sm">
                          Stay hydrated by drinking plenty of water throughout
                          the day
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-yellow-500 mr-2">•</span>
                        <span className="text-gray-700 text-sm">
                          Always remove makeup before bed
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-yellow-500 mr-2">•</span>
                        <span className="text-gray-700 text-sm">
                          Apply SPF daily, even when indoors
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
                    <h4 className="font-semibold text-emerald-800 mb-2">
                      Things to Avoid
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="text-emerald-500 mr-2">•</span>
                        <span className="text-gray-700 text-sm">
                          Harsh soaps that strip natural oils
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-emerald-500 mr-2">•</span>
                        <span className="text-gray-700 text-sm">
                          Over-exfoliating which can damage your skin barrier
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-emerald-500 mr-2">•</span>
                        <span className="text-gray-700 text-sm">
                          Products with artificial fragrances that may cause
                          irritation
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SkinRoutinePage;
