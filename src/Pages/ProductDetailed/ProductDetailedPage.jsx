import React, { useEffect, useState } from 'react';
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
} from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap-grid.min.css';
import './LightGalleryOverrides.css'; // Must come after the above

function ProductDetailedPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [quantity, setQuantity] = useState(1); // Default quantity set to 1
  const [openStates, setOpenStates] = useState([true, false, false, false]);

  const [compareList, setCompareList] = useState(() => {
    const stored = localStorage.getItem('compareList');
    return stored ? JSON.parse(stored) : [];
  });

  const breadcrumbItems = [
    { label: 'Products', link: '/products', active: false },
    { label: `Product ${id}`, link: `/products/${name}`, active: true },
  ];

  useEffect(() => {
    const getProduct = async () => {
      try {
        setLoading(true);
        const data = await fetchProductById(id);
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

  const addToCart = (product) => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    const existingProduct = cart.find(
      (item) => item.ProductId === product.ProductId
    );

    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    const itemToAdd = {
      ...product,
      ProductId: selectedVariation.ProductVariationId,
      Price: selectedVariation.Price,
      quantity,
    };

    const index = cart.findIndex(
      (item) => item.ProductId === itemToAdd.ProductId
    );
    if (index !== -1) {
      cart[index].quantity += quantity;
    } else {
      cart.push(itemToAdd);
    }

    localStorage.setItem('cart', JSON.stringify(cart));

    window.dispatchEvent(new Event('storage'));
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
              ⭐⭐⭐⭐⭐{' '}
              <span className="text-gray-700 text-sm">
                ({product.reviews || 0} reviews)
              </span>
            </div>
            <div className="text-2xl font-semibold text-gray-700 mt-3">
              $
              {selectedVariation ? formatPrice(selectedVariation.Price) : 'N/A'}
            </div>
            <div className="mt-4">
              <p className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">
                Main Ingredients:
              </p>
              <ul className="list-disc pl-5 text-gray-700">
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
                      className={`border px-4 py-2 text-sm font-medium rounded-md transition `}
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
