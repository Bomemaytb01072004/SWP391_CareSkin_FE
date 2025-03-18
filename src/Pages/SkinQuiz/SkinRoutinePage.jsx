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
        const CustomerId = localStorage.getItem('CustomerId');
        // Assuming CustomerId is stored in localStorage
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
        const skinTypeResults = await skinTypeResponse.json();
        console.log('SkinType API Response:', skinTypeResults); // Debugging log

        if (!skinTypeResults || !skinTypeResults.length) {
          throw new Error(
            'No skin type results found. Please take the quiz first.'
          );
        }

        // Sort results by ResultId in descending order to get the latest result
        const sortedResults = [...skinTypeResults].sort(
          (a, b) => b.ResultId - a.ResultId
        );
        const latestResult = sortedResults[0];
        console.log('Latest result:', latestResult);

        const skinTypeId = latestResult.SkinTypeId;
        if (!skinTypeId) {
          throw new Error('SkinTypeId is missing in the response.');
        }

        // Set skin type info from the latest result
        setSkinTypeInfo({
          SkinTypeId: skinTypeId,
          SkinTypeName: latestResult.SkinType.TypeName,
          Description: latestResult.SkinType.Description,
          Concerns: [], // Add concerns if available in the API response
        });

        // Fetch routines using SkinTypeId
        const routineResponse = await fetch(
          `http://careskinbeauty.shop:4456/api/routines/skinType/${skinTypeId}`
        );
        if (!routineResponse.ok) {
          throw new Error('Failed to fetch skincare routines.');
        }
        const routineData = await routineResponse.json();
        console.log('Routine API Response:', routineData); // Debugging log

        // Clean up the routine data to handle missing products
        const processedRoutineData = routineData.map((routine) => {
          // Create a mapping from routine period to type name for better display
          const periodToTypeName = {
            morning: 'Morning',
            evening: 'Evening',
            weekly: 'Weekly',
          };

          return {
            ...routine,
            // Use the correct RoutineTypeName based on the period
            RoutineTypeName:
              periodToTypeName[routine.RoutinePeriod] || routine.RoutinePeriod,
            RoutineStepDTOs: routine.RoutineStepDTOs.map((step) => ({
              ...step,
              StepNumber: step.StepOrder, // Map StepOrder to StepNumber for consistency
              // Add placeholder products if none are provided
              RoutineProducts:
                step.RoutineProducts.length > 0
                  ? step.RoutineProducts
                  : [
                      {
                        Product: {
                          ProductId: `placeholder-${step.RoutineStepId}`,
                          ProductName: step.StepName,
                          Description: step.Description,
                          Price: null,
                          ImageUrl: null,
                        },
                      },
                    ],
            })),
          };
        });

        setRoutineData(processedRoutineData);
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

  // Group routines by RoutineTypeName (morning, evening, etc.)
  const routinesByType = routineData.reduce((acc, routine) => {
    acc[routine.RoutineTypeName] = routine;
    return acc;
  }, {});

  // Extract morning and evening routines
  const morningRoutine = routinesByType['Morning'] || null;
  const eveningRoutine = routinesByType['Evening'] || null;

  // Extract weekly treatments (if any specific routine type for treatments exists)
  // Assuming weekly treatments might be in a separate routine type
  const weeklyTreatments = routinesByType['Weekly'] || [];

  // Extract skincare concerns if available in skinTypeInfo
  const concerns = skinTypeInfo?.Concerns || [];

  const getStepEmoji = (stepName) => {
    const stepLower = stepName.toLowerCase();
    if (stepLower.includes('cleanser') || stepLower.includes('cleanse'))
      return '🧴';
    if (stepLower.includes('tone') || stepLower.includes('toner')) return '💧';
    if (stepLower.includes('serum')) return '💉';
    if (stepLower.includes('moisturizer') || stepLower.includes('moisturize'))
      return '💦';
    if (stepLower.includes('sunscreen') || stepLower.includes('spf'))
      return '☀️';
    if (stepLower.includes('mask') || stepLower.includes('treatment'))
      return '🧖‍♀️';
    if (stepLower.includes('makeup') || stepLower.includes('remover'))
      return '💄';
    if (stepLower.includes('eye')) return '👁️';
    if (stepLower.includes('exfoliate') || stepLower.includes('scrub'))
      return '✨';
    if (stepLower.includes('oil')) return '💧';
    return '✨'; // Default emoji
  };

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
                  {skinTypeInfo?.SkinTypeName || 'Your Skin Type'}
                </motion.span>

                {concerns.map((concern, idx) => (
                  <motion.span
                    key={concern.ConcernId || idx}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                    className="px-4 py-2 bg-white text-emerald-700 font-medium rounded-full text-sm shadow-md border border-emerald-200"
                  >
                    {concern.ConcernName || concern}
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
        {morningRoutine && (
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
                      {morningRoutine.RoutineTypeName} Routine
                    </h3>
                    <p className="text-gray-600">
                      {morningRoutine.Description ||
                        'Start your day with these revitalizing products'}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Morning Routine Steps */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {morningRoutine.RoutineStepDTOs.map((step, stepIndex) => (
                  <motion.div
                    key={`morning-step-${step.RoutineStepId || stepIndex}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + stepIndex * 0.1, duration: 0.5 }}
                    className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all border border-gray-100"
                  >
                    <div className="relative bg-yellow-50 h-32 flex items-center justify-center">
                      <div className="absolute top-4 left-4 w-9 h-9 rounded-full bg-yellow-500 text-white flex items-center justify-center font-bold shadow-md">
                        {step.StepOrder || stepIndex + 1}
                      </div>
                      <div className="text-4xl">
                        {getStepEmoji(step.StepName)}
                      </div>
                    </div>

                    <div className="p-5">
                      <h4 className="text-xl font-semibold text-gray-800 mb-2">
                        {step.StepName}
                      </h4>
                      <p className="text-gray-600 mb-4">
                        {step.Description ||
                          'Essential step in your skincare routine'}
                      </p>

                      {step.RoutineProducts.length > 0 &&
                        step.RoutineProducts[0].Product && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-sm text-gray-500 mb-2">
                              Recommended products:
                            </p>
                            {step.RoutineProducts.map(
                              (routineProduct, productIndex) => {
                                const product = routineProduct.Product;
                                return (
                                  <div
                                    key={`product-${product.ProductId || productIndex}`}
                                    className="flex justify-between items-center mt-2"
                                  >
                                    <span className="font-medium">
                                      {product.ProductName}
                                    </span>
                                    {product.Price && (
                                      <span className="text-emerald-700 font-bold">
                                        ${product.Price.toFixed(2)}
                                      </span>
                                    )}
                                  </div>
                                );
                              }
                            )}
                          </div>
                        )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Evening Routine - Enhanced UI */}
        {eveningRoutine && (
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
                      {eveningRoutine.RoutineTypeName} Routine
                    </h3>
                    <p className="text-gray-600">
                      {eveningRoutine.Description ||
                        'Repair and rejuvenate your skin while you sleep'}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Evening Routine Steps - Updated to match morning routine structure */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {eveningRoutine.RoutineStepDTOs.map((step, stepIndex) => (
                  <motion.div
                    key={`evening-step-${step.RoutineStepId || stepIndex}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + stepIndex * 0.1, duration: 0.5 }}
                    className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all border border-gray-100"
                  >
                    <div className="relative bg-indigo-50 h-32 flex items-center justify-center">
                      <div className="absolute top-4 left-4 w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md">
                        {step.StepOrder || stepIndex + 1}
                      </div>
                      <div className="text-4xl">
                        {getStepEmoji(step.StepName)}
                      </div>
                    </div>

                    <div className="p-5">
                      <h4 className="text-xl font-semibold text-gray-800 mb-2">
                        {step.StepName}
                      </h4>
                      <p className="text-gray-600 mb-4">
                        {step.Description ||
                          'Essential step in your evening skincare routine'}
                      </p>

                      {step.RoutineProducts.length > 0 &&
                        step.RoutineProducts[0].Product && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-sm text-gray-500 mb-2">
                              Recommended products:
                            </p>
                            {step.RoutineProducts.map(
                              (routineProduct, productIndex) => {
                                const product = routineProduct.Product;
                                return (
                                  <div
                                    key={`evening-product-${product.ProductId || productIndex}`}
                                    className="flex justify-between items-center mt-2"
                                  >
                                    <span className="font-medium">
                                      {product.ProductName}
                                    </span>
                                    {product.Variations &&
                                    product.Variations.length > 0 ? (
                                      <span className="text-indigo-700 font-bold">
                                        $
                                        {product.Variations[0].Price.toFixed(2)}
                                      </span>
                                    ) : (
                                      <span className="text-indigo-700 font-bold">
                                        N/A
                                      </span>
                                    )}
                                  </div>
                                );
                              }
                            )}
                          </div>
                        )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Weekly Treatments Section - Conditionally rendered if weekly routines exist */}
        {weeklyTreatments &&
          weeklyTreatments.RoutineStepDTOs &&
          weeklyTreatments.RoutineStepDTOs.length > 0 && (
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {weeklyTreatments.RoutineStepDTOs.map((step, stepIndex) =>
                    step.RoutineProducts.map((routineProduct, productIndex) => {
                      const product = routineProduct.Product;
                      return (
                        <motion.div
                          key={`treatment-${stepIndex}-${productIndex}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            delay: 1.1 + (stepIndex + productIndex) * 0.1,
                            duration: 0.5,
                          }}
                          className="bg-gradient-to-br from-emerald-50 to-emerald-100/70 rounded-xl p-6 shadow-md border border-emerald-100"
                        >
                          <h4 className="text-xl font-semibold text-emerald-800 mb-3">
                            {product.ProductName}
                          </h4>
                          <p className="text-gray-700">
                            {product.Description ||
                              'Weekly treatment for your skincare routine.'}
                          </p>

                          <div className="mt-4 pt-4 border-t border-emerald-200/50">
                            <div className="flex justify-between items-center">
                              <span className="bg-emerald-200 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium">
                                Once Weekly
                              </span>
                              <span className="text-lg font-bold text-emerald-700">
                                ${product.Price?.toFixed(2) || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

        {/* Tips Section */}
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
                  <span className="mr-3">💡</span> Tips for{' '}
                  {skinTypeInfo?.SkinTypeName || 'Your'} Skin
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
