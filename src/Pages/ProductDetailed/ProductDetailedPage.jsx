import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { fetchProductById } from '../../utils/api';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import LoadingPage from '../LoadingPage/LoadingPage';
import ComparePopup from '../../components/ComparePopup/ComparePopup';
import Accordion from '../../components/DetailsProduct/Accordion';
import LightGallery from 'lightgallery/react'; // <-- LightGallery core
import lgZoom from 'lightgallery/plugins/zoom'; // <-- Zoom plugin
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import {
  faTruckFast,
  faArrowRotateLeft,
  faCreditCard,
  faCodeCompare,
  faShoppingBag,
  faStar as faStarSolid,
} from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
import 'bootstrap/dist/css/bootstrap-grid.min.css';
import './LightGalleryOverrides.css'; // Must come after the above
import { toast } from 'react-toastify';

function ProductDetailedPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [quantity, setQuantity] = useState(1); // Default quantity set to 1
  const [openStates, setOpenStates] = useState([true, false, false, false]);
  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  });
  const [compareList, setCompareList] = useState(() => {
    const stored = localStorage.getItem('compareList');
    return stored ? JSON.parse(stored) : [];
  });
  const [productReviews, setProductReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewsError, setReviewsError] = useState(null);
  const [ratingStats, setRatingStats] = useState({});

  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [userFeedback, setUserFeedback] = useState('');
  const [reviewImages, setReviewImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const fileInputRef = useRef(null);

  const [hoverRating, setHoverRating] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const breadcrumbItems = [
    { label: 'Products', link: '/products', active: false },
    { label: `Product ${id}`, link: `/products/${id}`, active: true },
  ];

  useEffect(() => {
    const getProduct = async () => {
      try {
        setLoading(true);
        const data = await fetchProductById(id);

        // Redirect if product is not active
        if (!data.IsActive) {
          navigate('/products');
          return;
        }

        setProduct(data);
        if (data && data.Variations && data.Variations.length > 0) {
          setSelectedVariation(data.Variations[0]); // Default to the first variation
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    getProduct();
  }, [id]);

  useEffect(() => {
    const fetchProductReviews = async () => {
      if (!id) return;

      try {
        setLoadingReviews(true);
        const response = await fetch(
          `http://careskinbeauty.shop:4456/api/RatingFeedback/RatingFeedback/product/${id}`
        );

        if (!response.ok) {
          throw new Error(`Error ${response.status}: Failed to fetch reviews`);
        }

        const reviewsData = await response.json();
        setProductReviews(reviewsData);
      } catch (error) {
        console.error('Error fetching product reviews:', error);
        setReviewsError(error.message);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchProductReviews();
  }, [id]);

  // Update your fetchRatingData function to handle both number and object responses
  useEffect(() => {
    const fetchRatingData = async () => {
      if (!id) return;

      try {
        const response = await fetch(
          `http://careskinbeauty.shop:4456/api/RatingFeedback/RatingFeedback/average/${id}`
        );

        if (!response.ok) {
          throw new Error(
            `Error ${response.status}: Failed to fetch rating stats`
          );
        }

        const data = await response.json();
        console.log('Raw Rating API Response:', data);

        // Handle the case when API returns just a number (like 4.5)
        let avgRating = 0;
        let totalReviews = 0;

        // Check if response is directly a number
        if (typeof data === 'number') {
          console.log('API returned direct rating number:', data);
          avgRating = data;
          // For total reviews count, use the length of actual reviews
          totalReviews = productReviews.length;
        } else if (data && typeof data === 'object') {
          // If response is an object, extract properties as before
          if (data.AverageRating !== undefined) avgRating = data.AverageRating;
          else if (data.averageRating !== undefined)
            avgRating = data.averageRating;
          else if (data.Average !== undefined) avgRating = data.Average;

          if (data.TotalReviews !== undefined) totalReviews = data.TotalReviews;
          else if (data.totalReviews !== undefined)
            totalReviews = data.totalReviews;
          else if (data.Count !== undefined) totalReviews = data.Count;
        }

        console.log(
          `Final extracted values - Average: ${avgRating}, Total: ${totalReviews}`
        );

        // Ensure we have valid numbers
        const parsedAverage = parseFloat(avgRating);
        const parsedTotal = parseInt(totalReviews) || productReviews.length;

        setRatingStats({
          averageRating: isNaN(parsedAverage) ? 0 : parsedAverage,
          totalReviews: isNaN(parsedTotal)
            ? productReviews.length
            : parsedTotal,
          distribution: data.distribution || data.Distribution || null,
        });

        console.log('Rating stats after update:', {
          averageRating: isNaN(parsedAverage) ? 0 : parsedAverage,
          totalReviews: isNaN(parsedTotal)
            ? productReviews.length
            : parsedTotal,
        });
      } catch (error) {
        console.error('Error fetching rating data:', error);
        calculateLocalRatingStats();
      }
    };

    fetchRatingData();
  }, [id, productReviews]);

  // Local calculation as fallback
  const calculateLocalRatingStats = () => {
    if (productReviews.length > 0) {
      const sum = productReviews.reduce(
        (total, review) => total + review.Rating,
        0
      );
      setRatingStats({
        averageRating: (sum / productReviews.length).toFixed(1),
        totalReviews: productReviews.length,
        distribution: null,
      });
    }
  };

  // Toggle a specific accordion index
  const toggleAccordion = (index) => {
    setOpenStates((prev) => {
      // Copy the array
      const newStates = [...prev];
      // Flip just the clicked index
      newStates[index] = !newStates[index];
      return newStates;
    });
  };

  const handleVariationChange = (variation) => {
    setSelectedVariation(variation);
  };

  const handleQuantityChange = (increment) => {
    setQuantity((prev) => Math.max(1, prev + increment));
  };

  const addToCart = async (product) => {
    if (!selectedVariation) {
      console.warn('No variation selected!');
      return;
    }

    const CustomerId = localStorage.getItem('CustomerId');
    const token = localStorage.getItem('token');
    if (!CustomerId || !token) {
      console.warn('No CustomerId found! Using localStorage for guest cart.');
      let cart = JSON.parse(localStorage.getItem('cart')) || [];
      const existingProductIndex = cart.findIndex(
        (item) =>
          item.ProductId === product.ProductId &&
          item.ProductVariationId === selectedVariation.ProductVariationId
      );
      if (existingProductIndex !== -1) {
        cart[existingProductIndex].Quantity += quantity;
      } else {
        cart.push({
          ...product,
          Quantity: quantity,
          Price:
            selectedVariation.SalePrice > 0
              ? selectedVariation.SalePrice
              : selectedVariation.Price,
          ProductVariationId: selectedVariation.ProductVariationId,
          ProductVariations: product.Variations,
        });
      }
      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('storage'));
      setCart(cart);
      return;
    }

    try {
      const newCartItem = {
        CustomerId: parseInt(CustomerId),
        ProductId: product.ProductId,
        ProductVariationId: selectedVariation.ProductVariationId,
        Quantity: quantity,
      };
      const response = await fetch(
        `http://careskinbeauty.shop:4456/api/Cart/add`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newCartItem),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Response Error:', errorData);
        throw new Error(`Failed to add item to cart: ${response.status}`);
      }
      console.log('Cart successfully updated in API!');
      const cartResponse = await fetch(
        `http://careskinbeauty.shop:4456/api/Cart/customer/${CustomerId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!cartResponse.ok) {
        throw new Error(`Failed to fetch updated cart: ${cartResponse.status}`);
      }
      const updatedCart = await cartResponse.json();
      if (!Array.isArray(updatedCart)) {
        console.error('Fetched cart is not an array:', updatedCart);
        return;
      }
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      setCart(updatedCart);
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  useEffect(() => {
    localStorage.setItem('compareList', JSON.stringify(compareList));
  }, [compareList]);

  const addToCompare = (product) => {
    if (!compareList.find((p) => p.ProductId === product.ProductId)) {
      setCompareList([...compareList, product]);
    }
  };

  const removeFromCompare = (productId) => {
    setCompareList(compareList.filter((p) => p.ProductId !== productId));
  };

  const handleCompareNow = () => {
    const compareIds = compareList.map((p) => p.ProductId).join(',');
    navigate(`/compare?ids=${compareIds}`);
  };

  const formatPrice = (price) => price.toFixed(2);

  // Updated getDisplayRating function to maintain decimal precision
  const getDisplayRating = () => {
    // Try to read directly from the first review if all else fails
    if (
      (ratingStats.averageRating === 0 || !ratingStats.averageRating) &&
      productReviews &&
      productReviews.length > 0
    ) {
      return parseFloat(productReviews[0].Rating).toFixed(1);
    }

    const rating = parseFloat(ratingStats.averageRating);
    console.log('Display rating value:', rating); // Debug log
    return isNaN(rating) ? '0.0' : rating.toFixed(1); // Keep one decimal place
  };

  const formatReviewDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Updated renderStars function to support decimal values (half stars)
  const renderStars = (rating) => {
    // Default to the first review's rating if no average available
    if (!rating && productReviews && productReviews.length > 0) {
      rating = productReviews[0].Rating;
    }

    // Ensure rating is a number and preserve decimal values
    const numRating = parseFloat(rating) || 0;
    console.log('Rendering stars for rating:', numRating); // Debug log

    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(numRating)) {
        // Full star
        stars.push(
          <FontAwesomeIcon
            key={i}
            icon={faStarSolid}
            className="text-yellow-400"
          />
        );
      } else if (i - numRating < 1 && i - numRating > 0) {
        // Half star - use a more precise approach
        const percentFilled = (numRating - Math.floor(numRating)) * 100;

        // Use a container with relative positioning
        stars.push(
          <span key={i} className="relative inline-block">
            {/* Empty star background */}
            <FontAwesomeIcon icon={faStarRegular} className="text-gray-300" />

            {/* Filled overlay with precise width */}
            <span
              className="absolute top-0 left-0 overflow-hidden text-yellow-400"
              style={{ width: `${percentFilled}%` }}
            >
              <FontAwesomeIcon icon={faStarSolid} />
            </span>
          </span>
        );
      } else {
        // Empty star
        stars.push(
          <FontAwesomeIcon
            key={i}
            icon={faStarRegular}
            className="text-gray-300"
          />
        );
      }
    }
    return stars;
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setReviewImages((prev) => [...prev, ...files]);

      // Create preview URLs
      const newPreviews = files.map((file) => ({
        url: URL.createObjectURL(file),
        name: file.name,
      }));
      setPreviewImages((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index) => {
    setReviewImages((prev) => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });

    setPreviewImages((prev) => {
      // Revoke the URL to avoid memory leaks
      URL.revokeObjectURL(prev[index].url);
      const newPreviews = [...prev];
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  const submitReview = async (e) => {
    e.preventDefault();

    const CustomerId = localStorage.getItem('CustomerId');
    const token = localStorage.getItem('token');

    if (!CustomerId || !token) {
      toast.error('Please log in to submit a review');
      return;
    }

    // Validate required fields
    if (!userFeedback.trim()) {
      toast.error('Please enter your feedback');
      return;
    }

    if (!userRating || userRating < 1 || userRating > 5) {
      toast.error('Please select a rating between 1 and 5 stars');
      return;
    }

    setIsSubmittingReview(true);

    try {
      // Create FormData for multipart/form-data submission
      const formData = new FormData();

      // Add the required text fields
      formData.append('ProductId', id);
      formData.append('Rating', userRating);
      formData.append('FeedBack', userFeedback.trim());

      // Add image files if any
      if (reviewImages.length > 0) {
        // Important: Use the same field name multiple times for multiple files
        reviewImages.forEach((file) => {
          formData.append('FeedbackImages', file);
        });
      }

      console.log('Submitting review with FormData:', {
        ProductId: id,
        Rating: userRating,
        FeedBack: userFeedback,
        ImageCount: reviewImages.length,
      });

      // Submit the review with FormData - DO NOT set Content-Type header
      const response = await fetch(
        `http://careskinbeauty.shop:4456/api/RatingFeedback/RatingFeedback/${CustomerId}`,
        {
          method: 'POST',
          headers: {
            // Let the browser set the content type with boundary
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);

        try {
          // Try to parse as JSON for better error messages
          const errorData = JSON.parse(errorText);
          const errorMessage = errorData.errors
            ? Object.values(errorData.errors).flat().join(', ')
            : errorData.title || 'Unknown error';
          throw new Error(`Review submission failed: ${errorMessage}`);
        } catch (e) {
          if (e.message.includes('Review submission failed')) {
            throw e;
          }
          throw new Error(
            `Failed to submit review (Status ${response.status})`
          );
        }
      }

      // Success!
      toast.success('Your review has been submitted successfully!');

      // Reset form
      setUserRating(5);
      setUserFeedback('');
      setReviewImages([]);
      setPreviewImages([]);

      // Refresh reviews and ratings
      const fetchProductReviews = async () => {
        try {
          const response = await fetch(
            `http://careskinbeauty.shop:4456/api/RatingFeedback/RatingFeedback/product/${id}`
          );
          if (response.ok) {
            const data = await response.json();
            setProductReviews(data);
          }
        } catch (error) {
          console.error('Error refreshing reviews:', error);
        }
      };

      // Refresh both the reviews and the rating stats
      await fetchProductReviews();
      await fetchRatingData();

      // Optional: reload the page if the state updates don't refresh the UI
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(
        error.message || 'Failed to submit your review. Please try again.'
      );
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Add this helper function to convert files to base64
  const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]); // Remove the data URL prefix
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleStarHover = (rating) => {
    setHoverRating(rating);
  };

  const handleStarClick = (rating) => {
    setUserRating(rating);
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  if (loading) {
    return (
      <>
        <LoadingPage />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <div style={{ textAlign: 'center', margin: '50px' }}>
          <h2>Not Found Product</h2>
        </div>
        <Footer />
      </>
    );
  }
  return (
    <>
      <Navbar />

      <div className="container mx-auto px-4 py-10 mt-20">
        <div className="row">
          <Breadcrumb items={breadcrumbItems} />
          <div className="col-12 col-md-6 d-flex flex-column align-items-center align-items-lg-start text-center text-lg-start">
            <div className="flex-1 flex flex-col items-center  min-w-[500px]">
              {/* LightGallery wrapper: 
                 "plugins={[lgZoom]}" enables zoom within the lightbox. 
                 "a href" points to the large image source. */}
              <LightGallery
                plugins={[lgZoom]}
                elementClassNames="lightgallery-container"
                speed={500}
                download={false}
              >
                <a href={product.PictureUrl}>
                  <img
                    className="w-full max-w-[500px] rounded-lg cursor-pointer"
                    src={product.PictureUrl}
                    alt={product.ProductName}
                  />
                </a>

                {product.ProductPictures?.map((picture, index) => (
                  <a
                    key={index}
                    href={picture.PictureUrl}
                    className="inline-block mr-2 mb-2 align-top"
                  >
                    <img
                      className={`flex gap-2 mt-2 w-20 h-20 rounded-lg cursor-pointer transition-transform duration-200 shadow-md hover:scale-125 mx-auto object-cover`}
                      src={picture.PictureUrl}
                      alt={picture.ProductName}
                    />
                  </a>
                ))}
              </LightGallery>
            </div>
          </div>
          <div className="col-lg-6 col-md-12 flex flex-col items-center text-center">
            {/* Brand Name */}
            <h3 className="text-sm text-gray-500 uppercase tracking-wide">
              {product.BrandName}
            </h3>
            {/* Product Name */}
            <h1 className="text-3xl font-bold text-gray-900 mt-2  w-5/6">
              {product.ProductName}
            </h1>
            {/* Category */}
            <h5 className="text-md text-gray-500 mt-1">{product.Category}</h5>
            <div className="flex items-center space-x-1 text-black mt-2">
              {/* Replace hardcoded stars with dynamic rendering */}
              <div className="flex">
                {renderStars(parseFloat(ratingStats.averageRating))}{' '}
                {/* Don't use Math.round here */}
              </div>
              <span className="text-gray-700 text-sm ml-1">
                ({ratingStats.totalReviews || 0} reviews)
              </span>
            </div>
            <div className="text-2xl font-semibold text-gray-700 mt-3">
              $
              {selectedVariation
                ? formatPrice(
                    selectedVariation.SalePrice > 0
                      ? selectedVariation.SalePrice
                      : selectedVariation.Price
                  )
                : 'N/A'}
            </div>
            <div className="mt-4">
              <p className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">
                Main Ingredients:
              </p>
              <ul className="list-disc text-left pl-5 text-gray-700">
                {product.MainIngredients.map((ingredient, i) => (
                  <li key={i}>
                    {ingredient.IngredientName !== 'null'
                      ? ingredient.IngredientName
                      : 'No specific main ingredient listed'}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6 space-y-4 ">
              {/* Variations (Options) */}
              <div>
                <p className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">
                  Option:
                </p>
                <div className="flex justify-center space-x-2">
                  {product.Variations.map((variation) => (
                    <button
                      key={variation.ProductVariationId}
                      className={`border px-4 py-2 text-sm font-medium rounded-md transition ${
                        selectedVariation &&
                        selectedVariation.ProductVariationId ===
                          variation.ProductVariationId
                          ? 'bg-gray-200'
                          : ''
                      }`}
                      onClick={() => handleVariationChange(variation)}
                    >
                      {variation.Ml}ml
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector */}
              <div>
                <p className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">
                  Quantity:
                </p>
                <div className="flex justify-center items-center border border-gray-300 rounded-md w-fit mx-auto">
                  <button
                    className="p-3 text-sm font-bold text-gray-700 hover:bg-gray-100 transition"
                    onClick={() => handleQuantityChange(-1)}
                  >
                    -
                  </button>
                  <span className="px-6  text-lg font-medium">{quantity}</span>
                  <button
                    className="p-3 text-sm font-bold text-gray-700 hover:bg-gray-100 transition"
                    onClick={() => handleQuantityChange(1)}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart & Compare Button */}
              <div className="flex justify-center items-center space-x-4 mt-6 ">
                {/* Add to Basket Button */}
                <motion.button
                  className="flex items-center justify-center w-2/3 py-3 text-white bg-black rounded-md text-sm font-semibold uppercase tracking-wide hover:bg-emerald-950 transition"
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.preventDefault();
                    addToCart(product);
                  }}
                >
                  <FontAwesomeIcon icon={faShoppingBag} className="mr-2" />
                  Add to Cart
                </motion.button>

                {/* Compare Button */}
                <motion.button
                  className="border border-gray-300 p-3 rounded-lg  hover:bg-gray-100 transition-all shadow-md"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => addToCompare(product)}
                >
                  <FontAwesomeIcon
                    icon={faCodeCompare}
                    className="text-gray-700 text-base"
                  />
                </motion.button>
              </div>

              <hr />

              <div
                className={`flex justify-center items-center gap-12 m-auto text-sm mt-4 `}
              >
                <span>
                  <FontAwesomeIcon icon={faTruckFast} className="me-2" />
                  Free Shipping
                </span>
                <span>
                  <FontAwesomeIcon icon={faArrowRotateLeft} className="me-2" />
                  30-Day Returns
                </span>
                <span>
                  <FontAwesomeIcon icon={faCreditCard} className="me-2" />
                  Secure Payment
                </span>
              </div>
            </div>
          </div>
          <Accordion
            title="Description"
            isOpen={openStates[0]}
            onToggle={() => toggleAccordion(0)}
          >
            <p>{product.Description}</p>
          </Accordion>
          <Accordion
            title="Full Ingredients"
            isOpen={openStates[1]}
            onToggle={() => toggleAccordion(1)}
          >
            <p>
              {product.DetailIngredients.map((ing) => ing.IngredientName).join(
                ', '
              )}
            </p>
          </Accordion>
          <Accordion
            title="How To Use"
            isOpen={openStates[2]}
            onToggle={() => toggleAccordion(2)}
          >
            <p>{product.Usages.map((usage) => usage.Instruction).join('. ')}</p>
          </Accordion>
          <div className="col-12 mt-10">
            <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

            {/* Reviews Summary */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm mb-8">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="flex flex-col items-center md:items-start mb-4 md:mb-0">
                  <div className="flex items-end">
                    <span className="text-5xl font-bold mr-2">
                      {getDisplayRating()}
                    </span>
                    <span className="text-gray-500">out of 5</span>
                  </div>
                  <div className="flex mt-2 text-xl">
                    {renderStars(parseFloat(ratingStats.averageRating))}{' '}
                    {/* Don't use Math.round here */}
                  </div>
                  <p className="text-gray-500 mt-1">
                    Based on{' '}
                    {ratingStats.totalReviews || productReviews.length || 0}{' '}
                    review
                    {(ratingStats.totalReviews ||
                      productReviews.length ||
                      0) !== 1
                      ? 's'
                      : ''}
                  </p>
                </div>

                <div className="w-full md:w-1/2">
                  {/* Rating distribution bars */}
                  {[5, 4, 3, 2, 1].map((star) => {
                    // If API provides distribution, use it, otherwise fall back to client calculation
                    let count, percentage;

                    if (
                      ratingStats.distribution &&
                      ratingStats.distribution[star] !== undefined
                    ) {
                      // Use API-provided distribution
                      count = ratingStats.distribution[star];
                      percentage =
                        ratingStats.totalReviews > 0
                          ? Math.round((count / ratingStats.totalReviews) * 100)
                          : 0;
                    } else {
                      // Fall back to client calculation
                      count = productReviews.filter(
                        (review) => review.Rating === star
                      ).length;
                      percentage =
                        productReviews.length > 0
                          ? Math.round((count / productReviews.length) * 100)
                          : 0;
                    }

                    return (
                      <div key={star} className="flex items-center mb-1">
                        <div className="flex items-center w-20">
                          <span className="mr-2">{star}</span>
                          <FontAwesomeIcon
                            icon={faStarSolid}
                            className="text-yellow-400"
                          />
                        </div>
                        <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-400 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-gray-500 w-10">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Review Form - Only show by default if there are reviews or user clicked button */}
            {(productReviews.length > 0 || showReviewForm) && (
              <div className="bg-white p-6 rounded-lg shadow-sm mb-8 border border-gray-100">
                <h3 className="text-xl font-bold mb-4">Write a Review</h3>

                {localStorage.getItem('CustomerId') ? (
                  <form onSubmit={submitReview}>
                    {/* Rating Stars */}
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">Your Rating:</p>
                      <div
                        className="flex space-x-1 text-xl"
                        onMouseLeave={handleMouseLeave}
                      >
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FontAwesomeIcon
                            key={star}
                            icon={faStarSolid}
                            className={`cursor-pointer ${
                              star <= (hoverRating || userRating)
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }`}
                            onMouseEnter={() => handleStarHover(star)}
                            onClick={() => handleStarClick(star)}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Rest of the form remains the same */}
                    {/* Feedback Text */}
                    <div className="mb-4">
                      <label
                        htmlFor="feedback"
                        className="block text-sm font-medium mb-2"
                      >
                        Your Review:
                      </label>
                      <textarea
                        id="feedback"
                        rows={4}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Share your thoughts about this product..."
                        value={userFeedback}
                        onChange={(e) => setUserFeedback(e.target.value)}
                        required
                      />
                    </div>

                    {/* Image Upload */}
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">Add Photos:</p>
                      <div className="flex flex-wrap gap-2 items-center">
                        {previewImages.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image.url}
                              alt={`Review upload ${index + 1}`}
                              className="w-20 h-20 object-cover rounded-md border border-gray-200"
                            />
                            <button
                              type="button"
                              className="absolute top-1 right-1 bg-white rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition"
                              onClick={() => removeImage(index)}
                            >
                              <svg
                                className="w-4 h-4 text-gray-700"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        ))}

                        {previewImages.length < 5 && (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current.click()}
                            className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center hover:border-gray-400 transition"
                          >
                            <svg
                              className="w-6 h-6 text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                          </button>
                        )}
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept="image/*"
                          multiple
                          onChange={handleImageSelect}
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="px-6 py-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition disabled:opacity-50"
                      disabled={isSubmittingReview}
                    >
                      {isSubmittingReview ? (
                        <>
                          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                          Submitting...
                        </>
                      ) : (
                        'Submit Review'
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">
                      You need to be logged in to submit a review.
                    </p>
                    <button
                      onClick={() => navigate('/login')}
                      className="px-6 py-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition"
                    >
                      Log in to write a review
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Individual Reviews */}
            {loadingReviews ? (
              <div className="flex justify-center py-10">
                <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
              </div>
            ) : reviewsError ? (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-700">
                <p>Failed to load reviews: {reviewsError}</p>
              </div>
            ) : productReviews.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">
                  No reviews yet for this product.
                </p>
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition"
                >
                  Be the first to review
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Existing reviews mapping remains the same */}
                {productReviews.map((review) => (
                  <div key={review.RatingFeedbackId} className="border-b pb-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-medium mr-4">
                        {review.CustomerName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {review.CustomerName || 'Anonymous User'}
                        </h3>
                        <div className="flex items-center">
                          <div className="flex mr-2">
                            {renderStars(review.Rating)}
                          </div>
                          <span className="text-sm text-gray-500">
                            {formatReviewDate(review.CreatedDate)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="mt-3 text-gray-700">{review.FeedBack}</p>

                    {/* Review Images */}
                    {review.FeedbackImages &&
                      review.FeedbackImages.length > 0 && (
                        <div className="mt-4">
                          <LightGallery
                            plugins={[lgZoom]}
                            elementClassNames="flex flex-wrap gap-2"
                            speed={500}
                            download={false}
                          >
                            {review.FeedbackImages.map((image, index) => (
                              <a
                                key={image.RatingFeedbackImageId}
                                href={image.FeedbackImageUrl}
                                className="cursor-zoom-in"
                              >
                                <img
                                  src={image.FeedbackImageUrl}
                                  alt={`Review image ${index + 1}`}
                                  className="w-20 h-20 object-cover rounded-md"
                                />
                              </a>
                            ))}
                          </LightGallery>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {compareList.length > 0 && (
        <ComparePopup
          compareList={compareList}
          removeFromCompare={removeFromCompare}
          clearCompare={() => setCompareList([])}
          onCompareNow={handleCompareNow}
        />
      )}

      <Footer />
    </>
  );
}

export default ProductDetailedPage;
