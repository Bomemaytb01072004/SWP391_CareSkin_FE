import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { ToastContainer, toast } from 'react-toastify';
import { motion } from 'framer-motion';
import GuestUnauthorizedPage from '../../Pages/Unauthorized/GuestUnauthorizedPage';

import {
  faUserEdit,
  faCartPlus,
  faRedo,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const SkinRoutinePage = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const navigate = useNavigate();
  const [routineData, setRoutineData] = useState(null);
  const [skinTypeInfo, setSkinTypeInfo] = useState(null);
  const [addedToCart, setAddedToCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]); // Add cart state
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Update the authentication useEffect
  useEffect(() => {
    // Authentication check - run this first
    const CustomerId = localStorage.getItem('CustomerId');
    const token =
      localStorage.getItem('Token') || localStorage.getItem('token');

    if (!CustomerId || !token) {
      setIsLoading(true);
      setIsAuthenticated(false); // Set authentication state to false

      // Save current URL to return after login
      localStorage.setItem('redirectAfterLogin', '/skinroutine');
    } else {
      setIsAuthenticated(true); // Explicitly set to true when authenticated
    }
  }, [navigate]);

  // Update the getSkinTypeTips function to use includes() instead of strict equality
  const getSkinTypeTips = (skinType) => {
    // Default tips if skin type is not recognized
    let dailyHabits = [
      'Stay hydrated by drinking plenty of water throughout the day',
      'Always remove makeup before bed',
      'Apply SPF daily, even when indoors',
    ];

    let thingsToAvoid = [
      'Harsh soaps that strip natural oils',
      'Over-exfoliating which can damage your skin barrier',
      'Products with artificial fragrances that may cause irritation',
    ];

    // Ensure skinType is a valid string
    if (typeof skinType === 'string' && skinType.trim().length > 0) {
      const skinTypeLower = skinType.trim().toLowerCase();

      // Use includes() instead of === for more flexible matching
      if (skinTypeLower.includes('dry')) {
        dailyHabits = [
          'Use a humidifier to add moisture to the air',
          'Apply moisturizer to damp skin right after bathing',
          'Choose cream-based cleansers and avoid products with alcohol',
          'Drink plenty of water to hydrate from within',
        ];
        thingsToAvoid = [
          'Hot water when washing your face or showering',
          'Harsh, soap-based cleansers that strip natural oils',
          'Alcohol-based toners and products',
          'Prolonged exposure to dry, cold weather without protection',
        ];
      } else if (skinTypeLower.includes('oily')) {
        dailyHabits = [
          'Wash your face twice daily with a gentle foaming cleanser',
          'Use oil-free, non-comedogenic products',
          'Apply a lightweight, oil-free moisturizer daily',
          'Use blotting papers to remove excess oil during the day',
        ];
        thingsToAvoid = [
          'Over-washing your face (can stimulate more oil production)',
          'Heavy, oil-based products that may clog pores',
          'Touching your face throughout the day',
          "Skipping moisturizer (it's still essential!)",
        ];
      } else if (skinTypeLower.includes('combination')) {
        dailyHabits = [
          'Use different products for different areas of your face',
          'Focus hydrating products on dry areas and oil-control on T-zone',
          'Consider multi-masking for targeted treatment',
          "Balance your skincare with ingredients that won't over-dry or over-moisturize",
        ];
        thingsToAvoid = [
          "One-size-fits-all products that don't address both concerns",
          'Very harsh products that might overly dry the already dry areas',
          'Very rich products that might make oily areas worse',
          'Inconsistent skincare routines',
        ];
      } else if (skinTypeLower.includes('sensitive')) {
        dailyHabits = [
          'Patch test new products before applying to your entire face',
          'Use fragrance-free, hypoallergenic skincare products',
          'Apply soothing ingredients like aloe vera or chamomile',
          'Wear broad-spectrum sunscreen to prevent irritation from UV rays',
        ];
        thingsToAvoid = [
          'Products containing fragrances, alcohol, and harsh chemicals',
          'Physical exfoliants that may be too abrasive',
          'Extremely hot water when washing your face',
          'Trying too many new products at once',
        ];
      } else if (skinTypeLower.includes('normal')) {
        dailyHabits = [
          'Maintain your balanced skin with consistent skincare',
          'Focus on protection and prevention with antioxidants',
          'Use sunscreen daily to prevent premature aging',
          'Stay hydrated and maintain a healthy diet',
        ];
        thingsToAvoid = [
          "Harsh products that might disrupt your skin's natural balance",
          'Neglecting your skincare routine just because your skin seems resilient',
          'Forgetting to adjust your skincare with seasonal changes',
          'Using potentially irritating ingredients unnecessarily',
        ];
      }

      // Add debugging to see what skinType is coming in
      console.log(
        `Skin type received: "${skinType}", processed as: "${skinTypeLower}"`
      );
    }

    return { dailyHabits, thingsToAvoid };
  };

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
          `${backendUrl}/api/Result/Customer/${CustomerId}`
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
          `${backendUrl}/api/routines/skinType/${skinTypeId}`
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

  // Fix the addToCart function to work correctly with API
  const addToCart = async (product) => {
    const CustomerId = localStorage.getItem('CustomerId');
    const token = localStorage.getItem('token'); // Changed to lowercase 'token'

    // Show feedback immediately for better UX
    setAddedToCart((prev) => [...prev, product.ProductName]);

    // Handle guest user (no CustomerId or token)
    if (!CustomerId || !token) {
      console.warn('No CustomerId found! Using localStorage for guest cart.');
      let cart = JSON.parse(localStorage.getItem('cart')) || [];
      const firstVariation =
        Array.isArray(product.Variations) && product.Variations.length > 0
          ? product.Variations[0]
          : null;

      const existingProductIndex = cart.findIndex(
        (item) =>
          item.ProductId === product.ProductId &&
          item.ProductVariationId === firstVariation?.ProductVariationId
      );

      if (existingProductIndex !== -1) {
        cart[existingProductIndex].Quantity += 1;
      } else {
        cart.push({
          ...product,
          Quantity: 1,
          Price:
            firstVariation?.SalePrice > 0
              ? firstVariation.SalePrice
              : firstVariation?.Price || product.Price,
          ProductVariationId: firstVariation?.ProductVariationId || null,
          ProductVariations: product.Variations,
        });
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('storage'));

      // Clear feedback after delay
      setTimeout(() => {
        setAddedToCart((prev) =>
          prev.filter((item) => item !== product.ProductName)
        );
      }, 2000);

      return;
    }

    // Handle logged in user
    try {
      // Prepare the payload - simplified to exactly what the API expects
      const payload = {
        CustomerId: parseInt(CustomerId),
        ProductId: product.ProductId,
        ProductVariationId: null, // Default to null if no variation specified
        Quantity: 1,
      };

      // If product has variations, use the first one
      if (Array.isArray(product.Variations) && product.Variations.length > 0) {
        payload.ProductVariationId = product.Variations[0].ProductVariationId;
      }

      console.log('Adding to cart with payload:', payload);

      // Make the API call
      const response = await fetch(`${backendUrl}/api/Cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      // Parse the response - use text first to see any error messages
      const responseText = await response.text();
      console.log('Cart API response:', responseText);

      if (!response.ok) {
        throw new Error(
          `Failed to add item to cart: ${response.status} ${responseText}`
        );
      }

      // Update local cart
      try {
        // Fetch updated cart from API
        const cartResponse = await fetch(
          `${backendUrl}/api/Cart/customer/${CustomerId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!cartResponse.ok) {
          console.warn(
            'Failed to fetch updated cart, using local update instead'
          );
          // Update cart locally if we can't get it from the server
          let cart = JSON.parse(localStorage.getItem('cart')) || [];
          const existingIndex = cart.findIndex(
            (item) => item.ProductId === product.ProductId
          );

          if (existingIndex !== -1) {
            cart[existingIndex].Quantity += 1;
          } else {
            cart.push({
              ...product,
              Quantity: 1,
            });
          }

          localStorage.setItem('cart', JSON.stringify(cart));
        } else {
          // If we got the cart from server, use that
          const updatedCart = await cartResponse.json();
          localStorage.setItem('cart', JSON.stringify(updatedCart));
        }

        window.dispatchEvent(new Event('storage'));
      } catch (err) {
        console.error('Error updating local cart:', err);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    }

    // Clear feedback after delay
    setTimeout(() => {
      setAddedToCart((prev) =>
        prev.filter((item) => item !== product.ProductName)
      );
    }, 2000);
  };

  // Fix the addAllToCart function to work correctly with API
  const addAllToCart = async () => {
    const CustomerId = localStorage.getItem('CustomerId');
    const token = localStorage.getItem('token'); // Changed to lowercase 'token'

    // Collect all valid products
    const allProducts = [];
    routineData.forEach((routine) => {
      routine.RoutineStepDTOs.forEach((step) => {
        if (step.RoutineProducts && step.RoutineProducts.length > 0) {
          step.RoutineProducts.forEach((rp) => {
            if (
              rp.Product &&
              rp.Product.ProductId &&
              !rp.Product.ProductId.toString().includes('placeholder')
            ) {
              allProducts.push(rp.Product);
            }
          });
        }
      });
    });

    if (allProducts.length === 0) {
      alert('No products available to add to cart.');
      return;
    }

    // Show loading state
    const productNames = allProducts.map((p) => p.ProductName);
    setAddedToCart(productNames);

    // Handle guest user
    if (!CustomerId || !token) {
      console.warn('No CustomerId found! Using localStorage for guest cart.');
      let cart = JSON.parse(localStorage.getItem('cart')) || [];

      allProducts.forEach((product) => {
        const firstVariation =
          Array.isArray(product.Variations) && product.Variations.length > 0
            ? product.Variations[0]
            : null;

        const existingProductIndex = cart.findIndex(
          (item) =>
            item.ProductId === product.ProductId &&
            item.ProductVariationId === firstVariation?.ProductVariationId
        );

        if (existingProductIndex !== -1) {
          cart[existingProductIndex].Quantity += 1;
        } else {
          cart.push({
            ...product,
            Quantity: 1,
            Price:
              firstVariation?.SalePrice > 0
                ? firstVariation.SalePrice
                : firstVariation?.Price || product.Price,
            ProductVariationId: firstVariation?.ProductVariationId || null,
            ProductVariations: product.Variations,
          });
        }
      });

      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('storage'));

      alert('All products added to your cart!');
      setTimeout(() => setAddedToCart([]), 2000);
      return;
    }

    // Handle logged in user - add items one by one
    try {
      let successCount = 0;

      for (const product of allProducts) {
        // Prepare the payload - simplified to exactly what the API expects
        const payload = {
          CustomerId: parseInt(CustomerId),
          ProductId: product.ProductId,
          ProductVariationId: null, // Default to null if no variation specified
          Quantity: 1,
        };

        // If product has variations, use the first one
        if (
          Array.isArray(product.Variations) &&
          product.Variations.length > 0
        ) {
          payload.ProductVariationId = product.Variations[0].ProductVariationId;
        }

        try {
          const response = await fetch(`${backendUrl}/api/Cart/add`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          });

          if (response.ok) {
            successCount++;
          } else {
            const errorText = await response.text();
            console.error(
              `Failed to add ${product.ProductName} to cart:`,
              errorText
            );
          }
        } catch (err) {
          console.error(`Error adding ${product.ProductName} to cart:`, err);
        }
      }

      // Update local cart with server data
      try {
        const cartResponse = await fetch(
          `${backendUrl}/api/Cart/customer/${CustomerId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (cartResponse.ok) {
          const updatedCart = await cartResponse.json();
          localStorage.setItem('cart', JSON.stringify(updatedCart));
          window.dispatchEvent(new Event('storage'));
        } else {
          console.warn('Failed to fetch updated cart after bulk add');
        }
      } catch (err) {
        console.error('Error updating local cart after bulk add:', err);
      }

      if (successCount > 0) {
      } else {
        alert('Failed to add products to your cart.');
      }
    } catch (error) {
      console.error('Error in bulk add to cart:', error);
      alert('An error occurred while adding products to your cart.');
    }

    setTimeout(() => setAddedToCart([]), 2000);
  };

  if (!isAuthenticated) {
    return (
      <GuestUnauthorizedPage
        pageName="the Skin Routine"
        redirectPath="/login"
        returnUrl="/skinroutine"
        message="Please log in to view your personalized skincare recommendations"
      />
    );
  }

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

  // Update getStepEmoji function to display actual product images
  const getRandomProduct = (step) => {
    // If there are real products available, pick one randomly
    if (
      step.RoutineProducts &&
      step.RoutineProducts.length > 0 &&
      step.RoutineProducts[0].Product
    ) {
      const validProducts = step.RoutineProducts.filter(
        (rp) => rp.Product && rp.Product.PictureUrl
      );

      if (validProducts.length > 0) {
        // Pick a random product from valid ones
        const randomIndex = Math.floor(Math.random() * validProducts.length);
        return validProducts[randomIndex].Product;
      }
    }

    // Return null if no valid products are available
    return null;
  };

  return (
    <>
      <Navbar />

      <div className="bg-gradient-to-b from-emerald-50 to-white min-h-screen pt-10 mt-20">
        {/* Breadcrumb Section */}
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 text-emerald-700 text-sm">
          <Breadcrumb items={[{ label: 'SkinQuiz', active: true }]} />
          {/* 
          <a
            href="/edit-profile"
            className="flex items-center text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            <FontAwesomeIcon icon={faUserEdit} className="mr-2" />
            Edit Profile
          </a> */}
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
              {!addedToCart.length ? 'Add All' : 'Added to Cart!'}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-white border-2 border-red-400 text-red-500 hover:bg-red-50 rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              onClick={resetRoutine}
            >
              <FontAwesomeIcon icon={faRedo} />
              Retake Quiz
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
              {/* Morning Routine Steps - Enhanced UI */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {morningRoutine.RoutineStepDTOs.map((step, stepIndex) => {
                  const randomProduct = getRandomProduct(step);

                  return (
                    <motion.div
                      key={`morning-step-${step.RoutineStepId || stepIndex}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.4 + stepIndex * 0.1,
                        duration: 0.5,
                      }}
                      className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all border border-gray-100 flex flex-col h-full group"
                    >
                      <div className="relative">
                        <div className="absolute top-4 left-4 w-9 h-9 rounded-full bg-yellow-500 text-white flex items-center justify-center font-bold shadow-md z-10">
                          {step.StepOrder || stepIndex + 1}
                        </div>

                        {/* Enhanced image container */}
                        {randomProduct && randomProduct.PictureUrl ? (
                          <div className="overflow-hidden">
                            <img
                              src={randomProduct.PictureUrl}
                              alt={randomProduct.ProductName}
                              className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>
                        ) : (
                          <div className="bg-yellow-50 h-60 flex items-center justify-center">
                            <div className="text-5xl">
                              {getStepEmoji(step.StepName)}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-5 flex-grow flex flex-col">
                        <h4 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2">
                          {randomProduct.ProductName}
                        </h4>
                        <p className="text-gray-600 mb-4 flex-grow line-clamp-3">
                          {step.Description ||
                            'Essential step in your skincare routine'}
                        </p>

                        {randomProduct ? (
                          <div className="mt-auto pt-4 border-t border-gray-100">
                            <div className="flex justify-between items-center mb-3">
                              <h5 className="font-medium text-sm text-gray-800 line-clamp-1 mr-2">
                                {step.StepName}
                              </h5>

                              {/* Display price based on available data structure */}
                              {randomProduct.Variations &&
                              randomProduct.Variations.length > 0 ? (
                                <span className="text-emerald-700 font-bold whitespace-nowrap">
                                  $
                                  {randomProduct.Variations[0].Price.toFixed(2)}
                                </span>
                              ) : randomProduct.Price ? (
                                <span className="text-emerald-700 font-bold whitespace-nowrap">
                                  ${randomProduct.Price.toFixed(2)}
                                </span>
                              ) : (
                                <span className="text-gray-500 text-sm whitespace-nowrap">
                                  Price unavailable
                                </span>
                              )}
                            </div>

                            {/* Add to Cart Button - Enhanced */}
                            <button
                              onClick={() => addToCart(randomProduct)}
                              className={`mt-1 w-full py-2.5 rounded-lg transition-all flex items-center justify-center ${
                                addedToCart.includes(randomProduct.ProductName)
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
                              } transform hover:translate-y-[-2px] duration-200`}
                            >
                              <FontAwesomeIcon
                                icon={
                                  addedToCart.includes(
                                    randomProduct.ProductName
                                  )
                                    ? faCheck
                                    : faCartPlus
                                }
                                className="mr-2"
                              />
                              {addedToCart.includes(randomProduct.ProductName)
                                ? 'Added!'
                                : 'Add to Cart'}
                            </button>
                          </div>
                        ) : (
                          <div className="mt-auto pt-4 border-t border-gray-100 text-center text-gray-500 text-sm">
                            No products available for this step
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
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

              {/* Evening Routine Steps - Enhanced UI */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {eveningRoutine.RoutineStepDTOs.map((step, stepIndex) => {
                  const randomProduct = getRandomProduct(step);

                  return (
                    <motion.div
                      key={`evening-step-${step.RoutineStepId || stepIndex}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.7 + stepIndex * 0.1,
                        duration: 0.5,
                      }}
                      className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all border border-gray-100 flex flex-col h-full group"
                    >
                      <div className="relative">
                        <div className="absolute top-4 left-4 w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md z-10">
                          {step.StepOrder || stepIndex + 1}
                        </div>

                        {/* Enhanced image container */}
                        {randomProduct && randomProduct.PictureUrl ? (
                          <div className="overflow-hidden">
                            <img
                              src={randomProduct.PictureUrl}
                              alt={randomProduct.ProductName}
                              className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>
                        ) : (
                          <div className="bg-indigo-50 h-60 flex items-center justify-center">
                            <div className="text-5xl">
                              {getStepEmoji(step.StepName)}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-5 flex-grow flex flex-col">
                        <h4 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2">
                          {randomProduct.ProductName}
                        </h4>
                        <p className="text-gray-600 mb-4 flex-grow line-clamp-3">
                          {step.Description ||
                            'Essential step in your evening skincare routine'}
                        </p>

                        {randomProduct ? (
                          <div className="mt-auto pt-4 border-t border-gray-100">
                            <div className="flex justify-between items-center mb-3">
                              <h5 className="font-medium text-sm text-gray-800 line-clamp-1 mr-2">
                                {step.StepName}
                              </h5>

                              {/* Display price based on available data structure */}
                              {randomProduct.Variations &&
                              randomProduct.Variations.length > 0 ? (
                                <span className="text-indigo-700 font-bold whitespace-nowrap">
                                  $
                                  {randomProduct.Variations[0].Price.toFixed(2)}
                                </span>
                              ) : randomProduct.Price ? (
                                <span className="text-indigo-700 font-bold whitespace-nowrap">
                                  ${randomProduct.Price.toFixed(2)}
                                </span>
                              ) : (
                                <span className="text-gray-500 text-sm whitespace-nowrap">
                                  Price unavailable
                                </span>
                              )}
                            </div>

                            {/* Add to Cart Button - Enhanced */}
                            <button
                              onClick={() => addToCart(randomProduct)}
                              className={`mt-1 w-full py-2.5 rounded-lg transition-all flex items-center justify-center ${
                                addedToCart.includes(randomProduct.ProductName)
                                  ? 'bg-indigo-100 text-indigo-700'
                                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
                              } transform hover:translate-y-[-2px] duration-200`}
                            >
                              <FontAwesomeIcon
                                icon={
                                  addedToCart.includes(
                                    randomProduct.ProductName
                                  )
                                    ? faCheck
                                    : faCartPlus
                                }
                                className="mr-2"
                              />
                              {addedToCart.includes(randomProduct.ProductName)
                                ? 'Added!'
                                : 'Add to Cart'}
                            </button>
                          </div>
                        ) : (
                          <div className="mt-auto pt-4 border-t border-gray-100 text-center text-gray-500 text-sm">
                            No products available for this step
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
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

        {/* Tips Section with better debugging */}
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
                  {skinTypeInfo?.SkinTypeName || 'Your Skin'}
                </h3>

                {/* Ensure SkinTypeName is formatted properly with debugging */}
                {(() => {
                  const skinType = skinTypeInfo?.SkinTypeName || '';
                  console.log('Tips section - skin type:', skinType);

                  const { dailyHabits, thingsToAvoid } =
                    getSkinTypeTips(skinType);

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-100">
                        <h4 className="font-semibold text-yellow-800 mb-2">
                          Daily Habits
                        </h4>
                        <ul className="space-y-2">
                          {dailyHabits.map((habit, index) => (
                            <li
                              key={`habit-${index}`}
                              className="flex items-start"
                            >
                              <span className="text-yellow-500 mr-2">•</span>
                              <span className="text-gray-700 text-sm">
                                {habit}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
                        <h4 className="font-semibold text-emerald-800 mb-2">
                          Things to Avoid
                        </h4>
                        <ul className="space-y-2">
                          {thingsToAvoid.map((item, index) => (
                            <li
                              key={`avoid-${index}`}
                              className="flex items-start"
                            >
                              <span className="text-emerald-500 mr-2">•</span>
                              <span className="text-gray-700 text-sm">
                                {item}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })()}
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
