import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SearchProduct.module.css';
import { fetchProducts } from '../../utils/api';
import LoadingPage from '../../Pages/LoadingPage/LoadingPage';

const SearchProduct = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const MAX_SUGGESTIONS = 5;
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (error) {
        console.error('Error in SearchProduct:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <LoadingPage />;
  }

  const filteredProducts = searchTerm
    ? products.filter((product) =>
        product.ProductName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const displayedProducts = filteredProducts.slice(0, MAX_SUGGESTIONS);

  const handleProductClick = (product) => {
    navigate(`/product/${product.ProductId}`);
  };

  return (
    <div className={styles.searchContainer}>
      <input
        type="text"
        className={styles.searchInput}
        placeholder="Search products..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {searchTerm && displayedProducts.length > 0 && (
        <ul className={styles.suggestList}>
          {displayedProducts.map((product) => (
            <li
              key={product.ProductId}
              className={styles.suggestItem}
              onClick={() => handleProductClick(product)}
            >
              {product.ProductName}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchProduct;
