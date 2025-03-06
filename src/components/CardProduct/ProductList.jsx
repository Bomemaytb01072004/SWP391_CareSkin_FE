import React, { useEffect, useState } from 'react';
import CardProduct from './CardProduct';
import ComparePopup from '../ComparePopup/ComparePopup';
import { useNavigate } from 'react-router-dom';
import LoadingPage from '../../Pages/LoadingPage/LoadingPage';

function ProductList({ products }) {
  const [compareList, setCompareList] = useState(() => {
    const stored = localStorage.getItem('compareList');
    return stored ? JSON.parse(stored) : [];
  });
  
  const navigate = useNavigate();

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
    let subpath = '';
    if (compareList.length === 3) {
      for (let i = 0; i < 2; i++) {
        const product = compareList[i];
        subpath += `${product.ProductId}-${product.name.replaceAll(' ', '-')}/`;
      }
      navigate(`/compare/${subpath}?product_id=${compareList[2].ProductId}`);
    } else {
      for (let product of compareList) {
        subpath += `${product.ProductId}-${product.name.replaceAll(' ', '-')}/`;
      }
      navigate(`/compare/${subpath}`);
    }
  };

  const addToCart = (product) => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingProduct = cart.find((item) => item.ProductId === product.ProductId);

    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
  };



  return (
    <div className="mx-auto p-2">
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {products.map((product) => (
          <CardProduct
            key={product.ProductId}
            product={product}
            addToCart={addToCart}
            addToCompare={addToCompare}
          />
        ))}
      </div>

      {compareList.length > 0 && (
        <ComparePopup
          compareList={compareList}
          removeFromCompare={removeFromCompare}
          clearCompare={() => setCompareList([])}
          onCompareNow={handleCompareNow}
        />
      )}
    </div>
  );
}

export default ProductList;
