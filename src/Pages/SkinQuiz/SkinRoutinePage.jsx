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

const SkinRoutinePage = () => {
  const navigate = useNavigate();
  const [routineData, setRoutineData] = useState(null);
  const [skinTypeInfo, setSkinTypeInfo] = useState(null);
  const [addedToCart, setAddedToCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSkinTypeAndRoutine = async () => {
      try {
        const CustomerId = localStorage.getItem('CustomerId'); // Assuming CustomerId is stored in localStorage
        if (!CustomerId) {
          throw new Error('Customer ID not found. Please log in.');
        }

        // Fetch SkinTypeId using CustomerId
        const skinTypeResponse = await fetch(
          `http://careskinbeauty.shop:4456/api/Result/Customer/${CustomerId}`
        );
        if (!skinTypeResponse.ok) {
          throw new Error('Failed to fetch skin type information.');
        }
        const skinTypeData = await skinTypeResponse.json();
        console.log('SkinType API Response:', skinTypeData); // Debugging log
        const skinTypeId = skinTypeData?.SkinTypeId;

        if (!skinTypeId) {
          throw new Error('SkinTypeId is missing in the response.');
        }

        setSkinTypeInfo(skinTypeData);

        // Fetch routines using SkinTypeId
        const routineResponse = await fetch(
          `http://careskinbeauty.shop:4456/api/routines/skinType/${skinTypeId}`
        );
        if (!routineResponse.ok) {
          throw new Error('Failed to fetch skincare routines.');
        }
        const routineData = await routineResponse.json();
        console.log('Routine API Response:', routineData); // Debugging log
        setRoutineData(routineData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSkinTypeAndRoutine();
  }, []);

  const resetRoutine = () => {
    localStorage.removeItem('skincareResult');
    navigate('/skinquiz');
  };

  const addToCart = (product) => {
    setAddedToCart((prev) => [...prev, product.ProductName]);
    setTimeout(() => {
      setAddedToCart((prev) =>
        prev.filter((item) => item !== product.ProductName)
      );
    }, 2000);
  };

  const addAllToCart = () => {
    const allProducts = routineData.flatMap((routine) =>
      routine.RoutineStepDTOs.flatMap((step) =>
        step.RoutineProducts.map((product) => product.Product.ProductName)
      )
    );
    setAddedToCart(allProducts);
    setTimeout(() => {
      setAddedToCart([]);
    }, 2000);
  };

  if (isLoading) {
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

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-emerald-50">
        <div className="text-center">
          <p className="text-red-700 font-medium">{error}</p>
          <button
            onClick={resetRoutine}
            className="mt-4 px-6 py-3 bg-red-500 text-white rounded-lg"
          >
            Retake Quiz
          </button>
        </div>
      </div>
    );
  }

  if (!routineData || routineData.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-emerald-50">
        <div className="text-center">
          <p className="text-emerald-700 font-medium">
            No skincare routines found for your skin type. Please try again.
          </p>
          <button
            onClick={resetRoutine}
            className="mt-4 px-6 py-3 bg-red-500 text-white rounded-lg"
          >
            Retake Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-gradient-to-b from-emerald-50 to-white min-h-screen pt-10 mt-20">
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto mt-6 bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 py-12 px-8 relative overflow-hidden">
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
                  {skinTypeInfo?.SkinTypeName || 'Unknown Skin Type'}
                </motion.span>
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

        {['morning', 'evening'].map((period) => {
          const periodRoutines = routineData.filter(
            (routine) => routine.RoutinePeriod === period
          );

          if (periodRoutines.length === 0) return null;

          return (
            <div key={period} className="w-full py-12">
              <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="mb-8"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 text-2xl shadow-sm">
                      {period === 'morning' ? '☀️' : '🌙'}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">
                        {period === 'morning'
                          ? 'Morning Routine'
                          : 'Evening Routine'}
                      </h3>
                      <p className="text-gray-600">
                        {period === 'morning'
                          ? 'Start your day with these revitalizing products'
                          : 'Repair and rejuvenate your skin while you sleep'}
                      </p>
                    </div>
                  </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {periodRoutines.map((routine) =>
                    routine.RoutineStepDTOs.map((step) => (
                      <motion.div
                        key={step.RoutineStepId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all border border-gray-100"
                      >
                        <div className="p-5">
                          <h4 className="text-xl font-semibold text-gray-800 mb-2">
                            {step.StepName}
                          </h4>
                          <p className="text-gray-600 mb-4">
                            {step.Description}
                          </p>
                          {step.RoutineProducts.map((product) => (
                            <div
                              key={product.RoutineProductId}
                              className="mb-4"
                            >
                              <h5 className="font-medium text-gray-800">
                                {product.Product.ProductName}
                              </h5>
                              <p className="text-sm text-gray-600">
                                {product.Product.Description}
                              </p>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`px-4 py-2 rounded-full ${
                                  addedToCart.includes(
                                    product.Product.ProductName
                                  )
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                } shadow-sm transition-colors flex items-center gap-1`}
                                onClick={() => addToCart(product.Product)}
                              >
                                <FontAwesomeIcon
                                  icon={
                                    addedToCart.includes(
                                      product.Product.ProductName
                                    )
                                      ? faCheck
                                      : faCartPlus
                                  }
                                />
                                {addedToCart.includes(
                                  product.Product.ProductName
                                )
                                  ? 'Added'
                                  : 'Add to Cart'}
                              </motion.button>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <Footer />
    </>
  );
};

export default SkinRoutinePage;
