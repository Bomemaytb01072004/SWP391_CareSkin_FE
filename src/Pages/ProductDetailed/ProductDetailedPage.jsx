import React, { useEffect, useState } from 'react';
import { fetchProductById } from '../../utils/api';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './ProductDetailedPage.module.css';
import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import LoadingPage from '../LoadingPage/LoadingPage';
import ComparePopup from '../../components/ComparePopup/ComparePopup';
import Accordion from '../../components/DetailsProduct/Accordion';
import {
  faTruckFast,
  faArrowRotateLeft,
  faCreditCard,
  faCodeCompare,
} from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap-grid.min.css';

function ProductDetailedPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariation, setSelectedVariation] = useState(null);

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

  const handleVariationChange = (variation) => {
    setSelectedVariation(variation);
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
              <img
                className={styles.img}
                src={product.PictureUrl}
                alt={product.ProductName}
              />
              <div className="d-flex justify-content-center flex-wrap mt-3">
                <img
                  className={`${styles.thumbnail} mx-2`}
                  src={product.PictureUrl}
                  alt="Thumbnail"
                />
              </div>
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
              <p className={styles.description}>{product.Description}</p>
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
                  <button className={styles.quantityCount}>-</button>
                  <span>1</span>
                  <button className={styles.quantityCount}>+</button>
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
          <Accordion title="Description">
            <p>{product.Description}</p>
          </Accordion>
          <Accordion title="Main Ingredients">
            <ul>
              {product.MainIngredients.map((ingredient, index) => (
                <li key={index}>
                  {ingredient.IngredientName !== 'null'
                    ? ingredient.IngredientName
                    : 'No specific main ingredient listed'}
                </li>
              ))}
            </ul>
          </Accordion>
          <Accordion title="Full Ingredients">
            <p>
              {product.DetailIngredients.map(
                (ingredient) => ingredient.IngredientName
              ).join(', ')}
            </p>
          </Accordion>
          <Accordion title="How To Use">
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
