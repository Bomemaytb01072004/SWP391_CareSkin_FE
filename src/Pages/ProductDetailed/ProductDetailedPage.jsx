import React, { useEffect, useState } from 'react';
import { fetchProductById } from '../../utils/api';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './ProductDetailedPage.module.css';
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
} from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap-grid.min.css';
import './LightGalleryOverrides.css'; // Must come after the above

function ProductDetailedPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [quantity, setQuantity] = useState(0); // Default quantity set to 1
  const [openStates, setOpenStates] = useState([true, false, false, false]);

  const [compareList, setCompareList] = useState(() => {
    const stored = localStorage.getItem('compareList');
    return stored ? JSON.parse(stored) : [];
  });

  const breadcrumbItems = [
    { label: 'Products', link: '/products', active: false },
    { label: `Product ${id}`, link: `/products/${id}`, active: true },
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

      <div className={`container ${styles.detailedProduct}`}>
        <div className="row">
          <Breadcrumb items={breadcrumbItems} />
          <div className="col-lg-6 col-md-9 col-sm-12 text-center">
            <div className={styles.productImages}>
              {/* LightGallery wrapper: 
                 "plugins={[lgZoom]}" enables zoom within the lightbox. 
                 "a href" points to the large image source. */}
              <LightGallery plugins={[lgZoom]} elementClassNames="lightgallery-container" speed={500} download={false}>
                <a href={product.PictureUrl}>
                  <img
                    className={styles.img}
                    src={product.PictureUrl}
                    alt={product.ProductName}
                    style={{ cursor: 'pointer' }}
                  />
                </a>

                {product.ProductPictures?.map((picture, index) => (
                  <a key={index} href={picture.PictureUrl} style={{
                    display: 'inline-block',
                    margin: '0 8px 8px 0', // chút margin phải & dưới
                    verticalAlign: 'top',  // giúp các ảnh căn cùng dòng
                  }}>
                    <img
                      className={`${styles.thumbnail} mx-2`}
                      src={picture.PictureUrl}
                      alt={picture.ProductName}
                      style={{
                        width: '80px',
                        height: '80px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        cursor: 'pointer',
                      }}
                    />
                  </a>
                ))}
              </LightGallery>
            </div>
          </div>
          <div className="col-lg-6 col-md-12">
            <div className={styles.productInfo}>
              <h1 className={styles.productTitle}>{product.ProductName}</h1>
              <div className={styles.reviews}>
                ({product.reviews || 0} reviews)
              </div>
              <div className={styles.price}>
                $
                {selectedVariation
                  ? formatPrice(selectedVariation.Price)
                  : 'N/A'}
              </div>
              <p className={styles.description}>
                <ul>
                  {product.MainIngredients.map((ingredient, i) => (
                    <li key={i}>
                      {ingredient.IngredientName !== 'null'
                        ? ingredient.IngredientName
                        : 'No specific main ingredient listed'}
                    </li>
                  ))}
                </ul>
              </p>
              <div className="d-flex align-items-center my-3">
                <span className="fw-bold me-2">Size:</span>
                {product.Variations.map((variation) => (
                  <button
                    key={variation.ProductVariationId}
                    className={`btn btn-outline-primary mx-2 ${styles.sizeButton}`}
                    onClick={() => handleVariationChange(variation)}
                  >
                    {variation.Ml}ml
                  </button>
                ))}
              </div>

              <div
                className={`d-flex align-items-center my-2 ${styles.quantitySelection}`}
              >
                <div className={styles.quantityGroupFirst}>
                  <button
                    className={styles.quantityCount}
                    onClick={() => handleQuantityChange(-1)}
                  >
                    -
                  </button>
                  <span>{quantity + 1}</span>
                  <button
                    className={styles.quantityCount}
                    onClick={() => handleQuantityChange(1)}
                  >
                    +
                  </button>
                </div>
                <button
                  className={styles.addToCart}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addToCart(product);
                  }}
                >
                  Add to Cart
                </button>
                <button
                  className={styles.quantityCompare}
                  onClick={() => addToCompare(product)}
                >
                  <FontAwesomeIcon icon={faCodeCompare} />
                </button>
              </div>

              <hr />

              <div
                className={`d-flex justify-normal my-2 ${styles.purchaseInfo}`}
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
