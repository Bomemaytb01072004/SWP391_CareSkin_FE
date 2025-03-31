import { useState, useEffect } from 'react';
import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';
import SloganCarousel from '../../components/HomePage/Carousel/SloganCarousel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import BestSellers from '../../components/HomePage/BestSellers';
import NewArrivals from '../../components/HomePage/NewArrivals';
import IconSlider from '../../components/HomePage/Carousel/IconSlider';
import FacebookPosts from '../../components/HomePage/FacebookPosts';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fetchSkinTypeProduct,
  fetchProducts,
  fetchCategoriesFromActiveProducts,
} from '../../utils/api.js'; // Import the API functions
import {
  // ...existing imports
  faDroplet,
  faSun,
  faJar,
  faFlask,
  faLeaf,
  faShieldAlt,
  faUserMd,
  faGem,
  faUserFriends,
  faShippingFast,
  faRecycle,
  faHeadset,
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom'; // Import Link for navigation
import { generateBlogSlug } from '../../utils/urlUtils';

function HomePage() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Add state for skin types
  const [skinTypes, setSkinTypes] = useState([]);
  const [loadingSkinTypes, setLoadingSkinTypes] = useState(true);

  // Add state for blog posts
  const [blogs, setBlogs] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [errorBlogs, setErrorBlogs] = useState('');

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Add state for tracking current slide
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const categoriesPerPage = 4;

  // Icon and description mapping for categories
  const categoryMetadata = {
    Cleanser: { icon: faDroplet, description: 'Start with a clean slate' },
    Cleansers: { icon: faDroplet, description: 'Start with a clean slate' },
    Toner: { icon: faFlask, description: 'Balance and prep your skin' },
    Toners: { icon: faFlask, description: 'Balance and prep your skin' },
    Serum: { icon: faFlask, description: 'Target specific concerns' },
    Serums: { icon: faFlask, description: 'Target specific concerns' },
    Moisturizer: { icon: faJar, description: 'Lock in hydration' },
    Moisturizers: { icon: faJar, description: 'Lock in hydration' },
    Sunscreen: { icon: faSun, description: 'Daily protection' },
    Sunscreens: { icon: faSun, description: 'Daily protection' },
    Mask: { icon: faLeaf, description: 'Weekly treatments' },
    Masks: { icon: faLeaf, description: 'Weekly treatments' },
    'Eye Cream': { icon: faDroplet, description: 'Targeted care' },
    'Eye Creams': { icon: faDroplet, description: 'Targeted care' },
    Exfoliator: { icon: faRecycle, description: 'Renew your skin' },
    Exfoliators: { icon: faRecycle, description: 'Renew your skin' },
    // Default mapping for unknown categories
    default: { icon: faJar, description: 'Specialized skincare' },
  };

  // Values/ethos data
  const companyValues = [
    {
      icon: faLeaf,
      title: 'Clean Ingredients',
      description:
        'Formulated without harmful ingredients and backed by scientific research',
    },
    {
      icon: faShieldAlt,
      title: 'Dermatologist Tested',
      description:
        'All products undergo rigorous testing for safety and efficacy',
    },
    {
      icon: faRecycle,
      title: 'Sustainable Packaging',
      description:
        'Eco-friendly solutions to minimize our environmental footprint',
    },
    {
      icon: faUserMd,
      title: 'Expert Formulations',
      description: 'Created by skincare scientists with decades of experience',
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingSkinTypes(true);

        // Fetch skin types and all products
        const [skinTypeData, productsData] = await Promise.all([
          fetchSkinTypeProduct(),
          fetchProducts(),
        ]);

        // Filter to only active products first
        const activeProducts = productsData.filter(
          (product) => product.IsActive === true
        );

        // Object to store first matching product image for each skin type
        const skinTypeProductImageMap = {};

        // Track which product images have already been used to avoid duplication
        const usedProductImages = new Set();

        // Filter products that have EXACTLY one skin type
        const productsWithOneSkinType = activeProducts.filter(
          (product) =>
            product.ProductForSkinTypes &&
            Array.isArray(product.ProductForSkinTypes) &&
            product.ProductForSkinTypes.length === 1 // EXACTLY one skin type
        );

        console.log(
          'Products with exactly one skin type:',
          productsWithOneSkinType.length
        );

        // First pass - assign products that have EXACTLY one skin type
        productsWithOneSkinType.forEach((product) => {
          const skinTypeId = product.ProductForSkinTypes[0].SkinTypeId;

          // If we don't have an image for this skin type yet, use this product's image
          if (
            !skinTypeProductImageMap[skinTypeId] &&
            product.PictureUrl &&
            product.PictureUrl.trim() !== ''
          ) {
            skinTypeProductImageMap[skinTypeId] = product.PictureUrl;
            usedProductImages.add(product.PictureUrl);
            console.log(
              `Found dedicated image for skin type ${skinTypeId}: ${product.PictureUrl.substring(0, 30)}...`
            );
          }
        });

        // Second pass - for any skin types that still don't have images,
        // use products with multiple skin types but avoid reusing images
        const productsWithMultipleSkinTypes = activeProducts.filter(
          (product) =>
            product.ProductForSkinTypes &&
            Array.isArray(product.ProductForSkinTypes) &&
            product.ProductForSkinTypes.length > 1 && // Multiple skin types
            product.PictureUrl &&
            !usedProductImages.has(product.PictureUrl) // Not already used
        );

        productsWithMultipleSkinTypes.forEach((product) => {
          product.ProductForSkinTypes.forEach((skinTypeRelation) => {
            const skinTypeId = skinTypeRelation.SkinTypeId;

            // Only assign if this skin type doesn't have an image AND
            // the product image hasn't been used elsewhere
            if (
              !skinTypeProductImageMap[skinTypeId] &&
              !usedProductImages.has(product.PictureUrl)
            ) {
              skinTypeProductImageMap[skinTypeId] = product.PictureUrl;
              usedProductImages.add(product.PictureUrl);
              console.log(
                `Found shared image for skin type ${skinTypeId}: ${product.PictureUrl.substring(0, 30)}...`
              );
            }
          });
        });

        // Default images for skin types
        const skinTypeDefaults = {
          // Add specific IDs for your skin types
          // e.g., "5": "/images/skintypes/combination.jpg"
        };

        // Process skin types, adding product count and selected images
        // First, filter only active skin types
        const activeSkinTypes = skinTypeData.filter(
          (skinType) => skinType.IsActive === true
        );

        // Debugging active skin types
        console.log(
          'Active skin types:',
          activeSkinTypes.map((st) => `${st.TypeName} (${st.SkinTypeId})`)
        );

        // Then process only these active skin types
        const enhancedSkinTypes = activeSkinTypes
          .map((skinType) => {
            // Count products for this skin type
            const productCount = activeProducts.filter(
              (product) =>
                product.ProductForSkinTypes &&
                product.ProductForSkinTypes.some(
                  (p) => p.SkinTypeId === skinType.SkinTypeId
                )
            ).length;

            // Skip skin types with no products
            if (productCount === 0) return null;

            // Skip test skin types (case insensitive)
            if (skinType.TypeName.toLowerCase().includes('test')) return null;

            return {
              id: skinType.SkinTypeId,
              title: skinType.TypeName,
              image:
                skinTypeProductImageMap[skinType.SkinTypeId] ||
                skinTypeDefaults[skinType.SkinTypeId] ||
                '/images/skintypes/default.jpg',
              description: `Products specially formulated for ${skinType.TypeName.toLowerCase()}`,
              products: productCount,
            };
          })
          .filter(Boolean); // Remove null entries

        console.log(
          `Found ${enhancedSkinTypes.length} active skin types with products`
        );
        setSkinTypes(enhancedSkinTypes);
      } catch (error) {
        console.error('Error fetching skin type products:', error);
      } finally {
        setLoadingSkinTypes(false);
      }
    };

    fetchData();
  }, []);

  // New useEffect to fetch blog posts
  useEffect(() => {
    const fetchBlogs = async () => {
      setLoadingBlogs(true);
      try {
        const response = await fetch(`${backendUrl}/api/BlogNews`);
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();

        // Process and fix image URLs
        const processedBlogs = data.map((blog) => ({
          ...blog,
          // Fix image URLs if needed
          Picture: blog.Picture
            ? blog.Picture.startsWith('http')
              ? blog.Picture
              : `${backendUrl}${blog.Picture.startsWith('/') ? '' : '/'}${blog.Picture}`
            : null,
        }));

        // Sort blogs in descending order by BlogId
        const sortedBlogs = processedBlogs.sort((a, b) => b.BlogId - a.BlogId);
        setBlogs(sortedBlogs);
      } catch (error) {
        console.error('Fetch error:', error);
        setErrorBlogs('Failed to load blog data. Please try again later.');
      } finally {
        setLoadingBlogs(false);
      }
    };

    fetchBlogs();
  }, []);

  // Fetch categories and products
  useEffect(() => {
    const fetchCategoriesData = async () => {
      setLoadingCategories(true);
      try {
        // Use the same function as ProductsPage
        const categoriesData = await fetchCategoriesFromActiveProducts();
        const productsData = await fetchProducts();

        // Transform raw categories into a consistent format (like in ProductsPage)
        const splittedCategories = categoriesData.flatMap((item) =>
          item.split(',').map((str) => str.trim())
        );
        const uniqueCategories = Array.from(new Set(splittedCategories));

        // Process each category with product counts and metadata
        const enhancedCategories = uniqueCategories.map((categoryName) => {
          // Count products in this category
          const productCount = productsData.filter(
            (product) =>
              product.Category &&
              product.Category.split(',')
                .map((c) => c.trim())
                .includes(categoryName) &&
              product.IsActive
          ).length;

          // Format the category name
          const normalizedName = categoryName.trim();
          let metadata = categoryMetadata[normalizedName];

          // If not found, try case-insensitive matching
          if (!metadata) {
            const lowerCaseName = normalizedName.toLowerCase();
            const metadataKey = Object.keys(categoryMetadata).find(
              (key) => key.toLowerCase() === lowerCaseName
            );

            if (metadataKey) {
              metadata = categoryMetadata[metadataKey];
            } else {
              console.log(`No metadata match for: ${normalizedName}`);
              metadata = categoryMetadata['default'];
            }
          }

          return {
            id: categoryName,
            title:
              categoryName.charAt(0).toUpperCase() +
              categoryName.slice(1).toLowerCase(),
            icon: metadata.icon,
            description: metadata.description,
            products: productCount,
            // This value should match exactly what the filter component expects
            filterValue: categoryName.toLowerCase().replace(/\s+/g, '_'),
          };
        });

        // Sort by product count (most products first)
        const sortedCategories = enhancedCategories.sort(
          (a, b) => b.products - a.products
        );

        setCategories(sortedCategories);
        console.log(
          'Total categories after processing:',
          sortedCategories.length
        );
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategoriesData();
  }, []);

  // Add this debugging code in your fetchCategoriesAndProducts function:
  useEffect(() => {
    console.log('Total categories:', categories.length);
    console.log(
      'Categories:',
      categories.map((c) => c.title)
    );
    console.log(
      'Should show right arrow:',
      categories.length > categoriesPerPage
    );
    console.log('Current index:', currentCategoryIndex);
  }, [categories, currentCategoryIndex]);

  // Function to truncate text to a specific length
  const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Update the formatDate function to handle the new date format
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      // Handle both date formats - the new "MM/DD/YYYY hh:mm:ss AM/PM" and old ISO format
      const date = dateString.includes('/')
        ? new Date(dateString.split(' ')[0]) // Extract just the date part
        : new Date(dateString);

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      console.log('Date parsing error:', error);
      return dateString; // Return the original string if parsing fails
    }
  };

  // Get reading time estimate (roughly 200 words per minute)
  const getReadingTime = (content) => {
    if (!content) return '1 min read';
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / 200);
    return `${minutes} min read`;
  };

  // First, add this state to track current skin type page
  const [currentSkinTypeIndex, setCurrentSkinTypeIndex] = useState(0);
  const skinTypesPerPage = 5; // Show 5 skin types at a time

  return (
    <>
      <Navbar />
      {/* Hero Section */}
      <motion.div
        className="relative w-full bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Background Expanding Container */}
        <div className="absolute inset-0 w-full h-full bg-white"></div>

        {/* Content Section */}
        <motion.div
          className="relative flex flex-col md:flex-row items-center text-center mt-16 md:text-left py-12 md:py-20 px-6 md:px-10 max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Left Side: Text */}
          <motion.div
            className="md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1
              className="font-bold leading-tight mb-6 text-4xl md:text-5xl lg:text-6xl"
              style={{
                textShadow: '0.13rem 0.13rem 0.3rem rgba(0, 0, 0, 0.25)',
                color: 'rgba(0, 0, 0, 1)',
              }}
            >
              Discover Your Perfect Skincare Routine
            </h1>
            <p className="text-md md:text-lg lg:text-xl text-gray-600 mb-8 max-w-lg">
              Take our personalized skin quiz and get a customized skincare
              routine that works for your unique needs. Say goodbye to guesswork
              and hello to results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/skinquiz"
                  className="px-6 py-4 bg-emerald-700 text-white rounded-full shadow-md hover:bg-emerald-900 transition text-base font-medium inline-block"
                >
                  Take Skin Quiz
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/products"
                  className="px-6 py-4 border-2 border-emerald-700 text-emerald-700 rounded-full shadow-sm hover:bg-emerald-50 transition text-base font-medium inline-block"
                >
                  Shop Products
                </Link>
              </motion.div>
            </div>
            <div className="mt-8 flex items-center">
              <div className="flex -space-x-2">
                <img
                  key="customer1"
                  src="https://media-cdn-v2.laodong.vn/storage/newsportal/2024/3/19/1317075/Kim-Ji-Won-6.jpg"
                  alt="Customer 1"
                  className="w-14 h-14 rounded-full border-2 border-white object-cover"
                />
                <img
                  key="customer2"
                  src="https://cdn.tuoitre.vn/thumb_w/640/471584752817336320/2023/2/16/20210903165700624111jpeg-16765450383411414552189.jpg"
                  alt="Customer 2"
                  className="w-14 h-14 rounded-full border-2 border-white object-cover"
                />
                <img
                  key="customer3"
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Tr%E1%BA%A5n_Th%C3%A0nh_191226.png/800px-Tr%E1%BA%A5n_Th%C3%A0nh_191226.png"
                  alt="Customer 3"
                  className="w-14 h-14 rounded-full border-2 border-white object-cover"
                />
              </div>
              <p className="ml-4 text-sm text-gray-600">
                Join over <span className="font-bold">50,000</span> customers
                who love our products
              </p>
            </div>
          </motion.div>
          {/* Right Side: Image */}
          <motion.div
            className="w-full md:w-1/2 flex justify-center mt-10 md:mt-0"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <SloganCarousel />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Icon Slider */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <IconSlider />
      </motion.div>

      {/* Our Mission Statement */}
      <motion.div
        className="py-20 px-6 max-w-4xl mx-auto text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
          Our Mission
        </h2>
        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
          We believe that effective skincare should be accessible to everyone.
          Our mission is to demystify skincare by providing science-backed
          formulations, personalized recommendations, and honest education — all
          at prices that make sense.
        </p>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            to="/about"
            className="inline-block px-6 py-3 text-emerald-600 font-medium border-b-2 border-emerald-600 hover:text-emerald-700 hover:border-emerald-700 transition"
          >
            Learn More About Our Story →
          </Link>
        </motion.div>
      </motion.div>
      {/* Shop by Skin Type Section */}
      <motion.div
        className="py-16 bg-white mx-auto max-w-7xl px-5 mt-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
          Shop by Skin Type
        </h2>
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
          Find products specifically formulated for your unique skin type.
        </p>

        {loadingSkinTypes ? (
          <div className="flex justify-center">
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="relative">
            {/* Visible skin types with inline navigation arrows */}
            <div className="flex items-center justify-center gap-4">
              {/* Left arrow */}
              {currentSkinTypeIndex > 0 && (
                <motion.button
                  className="bg-white text-emerald-600 rounded-full p-4 shadow-lg hover:bg-emerald-50 border border-emerald-100 flex items-center justify-center h-12 w-12 flex-shrink-0 self-center"
                  onClick={() =>
                    setCurrentSkinTypeIndex((prev) =>
                      Math.max(0, prev - skinTypesPerPage)
                    )
                  }
                  aria-label="Previous skin types"
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: 1 }}
                  whileHover={{
                    scale: 1.1,
                    backgroundColor: 'rgb(236 253 245)',
                    boxShadow:
                      '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FontAwesomeIcon icon={faChevronLeft} className="text-lg" />
                </motion.button>
              )}

              {/* Skin types grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-5 max-w-7xl mx-auto flex-grow">
                <AnimatePresence mode="wait">
                  {skinTypes
                    .slice(
                      currentSkinTypeIndex,
                      currentSkinTypeIndex + skinTypesPerPage
                    )
                    .map((skinType) => (
                      <motion.div
                        key={skinType.id}
                        className="group block relative rounded-lg overflow-hidden shadow-sm hover:shadow-md transition"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.4 }}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      >
                        <Link
                          to="/products"
                          state={{ filterBySkinType: [skinType.id.toString()] }}
                        >
                          <div className="aspect-w-1 aspect-h-1 w-full">
                            <img
                              src={skinType.image}
                              alt={skinType.title}
                              className="w-full h-64 object-cover group-hover:scale-105 transition duration-300"
                              onError={(e) => {
                                e.target.src = '/images/skintypes/default.jpg';
                              }}
                            />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                            <div>
                              <h3 className="text-white font-medium text-lg">
                                {skinType.title}
                              </h3>
                              <p className="text-white/80 text-sm">
                                {skinType.products} products
                              </p>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                </AnimatePresence>
              </div>

              {/* Right arrow */}
              {currentSkinTypeIndex < skinTypes.length - skinTypesPerPage && (
                <motion.button
                  className="bg-white text-emerald-600 rounded-full p-4 shadow-lg hover:bg-emerald-50 border border-emerald-100 flex items-center justify-center h-12 w-12 flex-shrink-0 self-center"
                  onClick={() =>
                    setCurrentSkinTypeIndex((prev) =>
                      Math.min(
                        skinTypes.length - skinTypesPerPage,
                        prev + skinTypesPerPage
                      )
                    )
                  }
                  aria-label="Next skin types"
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: 1 }}
                  whileHover={{
                    scale: 1.1,
                    backgroundColor: 'rgb(236 253 245)',
                    boxShadow:
                      '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FontAwesomeIcon icon={faChevronRight} className="text-lg" />
                </motion.button>
              )}
            </div>

            {/* Pagination indicator */}
            {skinTypes.length > skinTypesPerPage && (
              <div className="flex justify-center mt-6 space-x-2">
                {Array.from({
                  length: Math.ceil(skinTypes.length / skinTypesPerPage),
                }).map((_, index) => (
                  <button
                    key={index}
                    className={`h-2 rounded-full transition-all ${
                      index ===
                      Math.floor(currentSkinTypeIndex / skinTypesPerPage)
                        ? 'w-6 bg-emerald-700' // Darker color for better contrast
                        : 'w-2 bg-emerald-300' // Darker color for better contrast
                    }`}
                    onClick={() =>
                      setCurrentSkinTypeIndex(index * skinTypesPerPage)
                    }
                    aria-label={`Go to skin type page ${index + 1}`}
                    aria-current={
                      index ===
                      Math.floor(currentSkinTypeIndex / skinTypesPerPage)
                    }
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="text-center mt-12"
        >
          <Link
            to="/products"
            className="inline-block px-8 py-3 border-2 border-emerald-600 text-emerald-600 rounded-full hover:bg-emerald-50 transition font-medium"
          >
            View All Products
          </Link>
        </motion.div>
      </motion.div>
      {/* Shop by Category Section */}
      <motion.div
        className="py-16 bg-gray-50 rounded-xl mx-auto max-w-screen-2xl px-5 mt-10 mb-20 relative"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
          Shop by Category
        </h2>
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
          Find the perfect products for every step in your skincare routine.
        </p>

        {loadingCategories ? (
          <div className="flex justify-center">
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="relative">
            {/* Visible categories with inline navigation arrows */}
            <div className="flex items-center justify-center gap-4">
              {/* Left arrow - positioned within the flow */}
              {currentCategoryIndex > 0 && (
                <motion.button
                  className="bg-white text-emerald-600 rounded-full p-4 shadow-lg hover:bg-emerald-50 border border-emerald-100 flex items-center justify-center h-12 w-12 flex-shrink-0 self-center"
                  onClick={() =>
                    setCurrentCategoryIndex((prev) =>
                      Math.max(0, prev - categoriesPerPage)
                    )
                  }
                  aria-label="Previous categories"
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: 1 }}
                  whileHover={{
                    scale: 1.1,
                    backgroundColor: 'rgb(236 253 245)',
                    boxShadow:
                      '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FontAwesomeIcon icon={faChevronLeft} className="text-lg" />
                </motion.button>
              )}

              {/* Categories grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-7xl mx-auto justify-items-center overflow-hidden flex-grow">
                <AnimatePresence mode="wait">
                  {categories
                    .slice(
                      currentCategoryIndex,
                      currentCategoryIndex + categoriesPerPage
                    )
                    .map((category) => (
                      <motion.div
                        key={category.id}
                        className="flex flex-col items-center justify-center bg-white p-6 rounded-lg shadow-sm hover:shadow-lg transition w-full cursor-pointer"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.4 }}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      >
                        <Link
                          to="/products"
                          state={{ filterByCategory: [category.filterValue] }} // Use filterValue instead of title
                          className="flex flex-col items-center justify-center w-full"
                        >
                          <span className="p-5 bg-emerald-100 rounded-full flex items-center justify-center w-20 h-20">
                            <FontAwesomeIcon
                              icon={category.icon}
                              className="text-emerald-600 text-3xl"
                            />
                          </span>
                          <h3 className="text-xl font-semibold text-center mt-4">
                            {category.title}
                          </h3>
                          <p className="text-gray-600 font-light text-sm text-center mt-2 mb-4">
                            {category.description}
                          </p>
                          <span className="text-xs text-gray-500">
                            {category.products} products
                          </span>
                        </Link>
                      </motion.div>
                    ))}
                </AnimatePresence>
              </div>

              {/* Right arrow - positioned within the flow */}
              {currentCategoryIndex < categories.length - categoriesPerPage && (
                <motion.button
                  className="bg-white text-emerald-600 rounded-full p-4 shadow-lg hover:bg-emerald-50 border border-emerald-100 flex items-center justify-center h-12 w-12 flex-shrink-0 self-center"
                  onClick={() =>
                    setCurrentCategoryIndex((prev) =>
                      Math.min(
                        categories.length - categoriesPerPage,
                        prev + categoriesPerPage
                      )
                    )
                  }
                  aria-label="Next categories"
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: 1 }}
                  whileHover={{
                    scale: 1.1,
                    backgroundColor: 'rgb(236 253 245)',
                    boxShadow:
                      '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FontAwesomeIcon icon={faChevronRight} className="text-lg" />
                </motion.button>
              )}
            </div>

            {/* Pagination indicator */}
            {categories.length > categoriesPerPage && (
              <div className="flex justify-center mt-6 space-x-2">
                {Array.from({
                  length: Math.ceil(categories.length / categoriesPerPage),
                }).map((_, index) => (
                  <button
                    key={index}
                    className={`h-2 rounded-full transition-all ${
                      index ===
                      Math.floor(currentCategoryIndex / categoriesPerPage)
                        ? 'w-6 bg-emerald-700' // Darker color for better contrast
                        : 'w-2 bg-emerald-300' // Darker color for better contrast
                    }`}
                    onClick={() =>
                      setCurrentCategoryIndex(index * categoriesPerPage)
                    }
                    aria-label={`Go to category page ${index + 1}`}
                    aria-current={
                      index ===
                      Math.floor(currentCategoryIndex / categoriesPerPage)
                    }
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="text-center mt-12"
        >
          <Link
            to="/products"
            className="inline-block px-8 py-3 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition font-medium"
          >
            View All Categories
          </Link>
        </motion.div>
      </motion.div>
      {/* Best Sellers Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="mb-20"
      >
        <BestSellers />
      </motion.div>

      {/* Company Values */}
      <motion.div
        className="py-16 bg-white mx-auto max-w-7xl px-5"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
          Our Commitment to You
        </h2>
        <p className="text-center text-gray-600 max-w-3xl mx-auto mb-12">
          We're more than just skincare. We're dedicated to building products
          with principles that matter.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {companyValues.map((value, index) => (
            <motion.div
              key={index}
              className="bg-gray-50 p-6 rounded-xl"
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="bg-emerald-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <FontAwesomeIcon
                  icon={value.icon}
                  className="text-emerald-600 text-2xl"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
              <p className="text-gray-600">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
      {/* New Arrivals */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <NewArrivals />
      </motion.div>
      {/* Why Choose Us */}
      <motion.div
        className="py-16 bg-emerald-50 mt-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        <div className="max-w-7xl mx-auto px-5">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Us
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: faGem,
                title: 'Premium Quality',
                description:
                  'Formulated with the highest quality ingredients for optimal results',
              },
              {
                icon: faUserFriends,
                title: 'Expert Advice',
                description:
                  'Access to skincare experts who can answer your questions',
              },
              {
                icon: faShippingFast,
                title: 'Fast Shipping',
                description:
                  'Free shipping on orders over $50 with delivery in 2-5 business days',
              },
              {
                icon: faHeadset,
                title: '24/7 Support',
                description:
                  'Our customer support team is available around the clock',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="flex flex-col items-center text-center p-6"
                whileHover={{ y: -5 }}
              >
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <FontAwesomeIcon
                    icon={feature.icon}
                    className="text-emerald-600 text-2xl"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Featured Blog Posts - Enhanced UI matching BlogPage */}
      <motion.div
        className="py-16 bg-white max-w-7xl mx-auto px-5 mt-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              Skincare Journal
            </h2>
            <p className="text-gray-600 mt-2">
              Expert advice, tips, and education for your skin health journey
            </p>
          </div>
          <motion.div whileHover={{ x: 5 }}>
            <Link
              to="/blogs"
              className="mt-4 sm:mt-0 text-emerald-600 font-medium hover:text-emerald-700 transition flex items-center"
            >
              View all articles
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>
          </motion.div>
        </div>

        {loadingBlogs ? (
          <div className="flex justify-center py-20">
            <div className="w-16 h-16 relative">
              <div className="absolute inset-0 rounded-full border-t-4 border-emerald-400 animate-spin"></div>
              <div className="absolute inset-1 rounded-full border-2 border-emerald-100"></div>
            </div>
          </div>
        ) : errorBlogs ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-lg">
            <p>{errorBlogs}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogs
              .filter((blog) => blog.IsActive)
              .slice(0, 3)
              .map((blog) => (
                <motion.div
                  key={blog.BlogId}
                  className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 h-full flex flex-col hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  {/* Blog Image with enhanced hover effect */}
                  <div className="relative h-56 overflow-hidden group">
                    <Link to={`/blog/${generateBlogSlug(blog)}`}>
                      <img
                        src={
                          blog.PictureUrl && blog.PictureUrl.startsWith('http')
                            ? blog.PictureUrl
                            : blog.PictureUrl
                              ? `${backendUrl}${blog.PictureUrl}`
                              : '/images/blog-placeholder.jpg'
                        }
                        alt={blog.Title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/blog-placeholder.jpg';
                        }}
                      />
                      {/* Enhanced overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </Link>

                    {/* Category badge */}
                    <div className="absolute top-4 left-4 z-10">
                      <span className="bg-white/90 backdrop-blur-sm text-emerald-700 text-xs font-medium px-3 py-1.5 rounded-full shadow-sm">
                        Skincare
                      </span>
                    </div>

                    {/* Reading time badge */}
                    <div className="absolute bottom-4 right-4 z-10">
                      <span className="bg-black/70 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-sm flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3.5 w-3.5 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {getReadingTime(blog.Content)}
                      </span>
                    </div>
                  </div>

                  {/* Blog Content */}
                  <div className="p-6 flex-grow flex flex-col">
                    {/* Date with icon */}
                    <div className="flex items-center text-xs text-gray-500 mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1.5 text-emerald-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <time dateTime={blog.UploadDate || blog.CreateDate}>
                        {formatDate(blog.UploadDate || blog.CreateDate)}
                      </time>
                    </div>

                    {/* Title */}
                    <Link to={`/blog/${generateBlogSlug(blog)}`}>
                      <h3 className="text-xl font-semibold mb-3 line-clamp-2 text-gray-800 hover:text-emerald-600 transition-colors">
                        {blog.Title}
                      </h3>
                    </Link>

                    {/* Excerpt */}
                    <p className="text-gray-600 text-sm mb-5 flex-grow line-clamp-3">
                      {truncateText(blog.Content, 120)}
                    </p>

                    {/* Bottom section with Read More link and time */}
                    <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-100">
                      <Link
                        to={`/blog/${generateBlogSlug(blog)}`}
                        className="group inline-flex items-center justify-center text-emerald-600 font-medium hover:text-emerald-700 transition-colors"
                        aria-label={`Read more about ${blog.Title}`}
                      >
                        Read More: {truncateText(blog.Title, 8)}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 ml-1 group-hover:translate-x-1.5 transition-transform"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                      </Link>

                      {/* Add time display at bottom right */}
                      {blog.UploadDate && (
                        <span className="text-xs text-gray-500 flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3.5 w-3.5 mr-1 text-emerald-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {/* Extract just the time */}
                          {blog.UploadDate.split(' ').slice(1, 3).join(' ')}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        )}
      </motion.div>

      {/* Not Sure Where to Start Section */}
      <motion.div
        className="bg-emerald-100 py-10 px-6 text-center rounded-xl shadow-md mx-auto max-w-6xl mt-16 mb-16"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Not Sure Where to Start?
        </h2>
        <p className="text-gray-600 text-lg mb-8 max-w-3xl mx-auto">
          Take our 2-minute skin quiz to get personalized product
          recommendations based on your skin type, concerns, and goals. Our
          algorithm analyzes your unique needs and matches you with products
          that will work for you.
        </p>
        <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-6">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/skinquiz"
              className="px-4 py-4 bg-emerald-600 text-white rounded-full shadow-md hover:bg-emerald-700 transition text-lg font-medium inline-block"
            >
              Start Quiz Now
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/consultation"
              className="px-4 py-4 bg-white border-2 border-emerald-600 text-emerald-600 rounded-full shadow-md hover:bg-emerald-50 transition text-lg font-medium inline-block"
            >
              Book Free Consultation
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Instagram Feed */}

      <FacebookPosts></FacebookPosts>

      {/* Newsletter */}
      <motion.div
        className="bg-gray-100 py-16 mt-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Newsletter</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Subscribe for exclusive offers, skincare tips, and early access to
            new product launches. Get 15% off your first order!
          </p>
          <form className="flex w-full max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="px-4 py-3 w-full border border-gray-300 rounded-l-full focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent"
              required
            />
            <motion.button
              type="submit"
              className="px-6 py-3 bg-emerald-700 text-white rounded-r-full hover:bg-emerald-900 transition font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Subscribe
            </motion.button>
          </form>

          <p className="text-gray-500 text-xs mt-4">
            By subscribing, you agree to our Privacy Policy and consent to
            receive updates from our company.
          </p>
        </div>
      </motion.div>
      {/* Footer */}
      <Footer />
    </>
  );
}

export default HomePage;
