import React, { useState, useMemo, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SearchProduct.module.css';
import LoadingPage from '../../Pages/LoadingPage/LoadingPage';
import { LoadingContext } from '../../Pages/Products/ProductsPage';

const SearchProduct = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const MAX_SUGGESTIONS = 5;
  const navigate = useNavigate();
  
  // Get products and loading state from context
  const { products, isLoading } = useContext(LoadingContext);

  // Use useMemo to optimize filtering - moved before conditional rendering
  const filteredProducts = useMemo(() => {
    return searchTerm && !isLoading
      ? products
          .filter((product) =>
            product.ProductName.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .slice(0, MAX_SUGGESTIONS)
      : [];
  }, [products, searchTerm, MAX_SUGGESTIONS, isLoading]);

  // If loading, don't render the search bar or show a simplified version
  if (isLoading) {
    return null;
  }

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

      {searchTerm && filteredProducts.length > 0 && (
        <ul className={styles.suggestList}>
          {filteredProducts.map((product) => (
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
