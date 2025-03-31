import React, { useEffect, useState } from 'react';
import CardProduct from './CardProduct';
import ComparePopup from '../ComparePopup/ComparePopup';
import { useNavigate } from 'react-router-dom';
import LoadingPage from '../../Pages/LoadingPage/LoadingPage';

function ProductList({ products }) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [cart, setCart] = useState(() => {
    const storedCart = localStorage.getItem('cart');
    return storedCart ? JSON.parse(storedCart) : [];
  });

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
        subpath += `${product.ProductId}-${product.ProductName.replaceAll(' ', '-')}/`;
      }
      navigate(`/compare/${subpath}?product_id=${compareList[2].ProductId}`);
    } else {
      for (let product of compareList) {
        subpath += `${product.ProductId}-${product.ProductName.replaceAll(' ', '-')}/`;
      }
      navigate(`/compare/${subpath}`);
    }
  };

  const addToCart = async (product) => {
    const CustomerId = localStorage.getItem('CustomerId');
    const token = localStorage.getItem('token');
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
              : firstVariation?.Price || item.Price,
          ProductVariationId: firstVariation?.ProductVariationId || null,
          ProductVariations: product.Variations,
        });
      }
      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('storage'));
      setCart(cart);
      return;
    }
    try {
      const firstVariation =
        Array.isArray(product.Variations) && product.Variations.length > 0
          ? product.Variations[0]
          : null;
      const newCartItem = {
        CustomerId: parseInt(CustomerId),
        ProductId: product.ProductId,
        ProductVariationId: firstVariation?.ProductVariationId,
        Quantity: 1,
      };
      const response = await fetch(`${backendUrl}/api/Cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newCartItem),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Response Error:', errorData);
        throw new Error(`Failed to add item to cart: ${response.status}`);
      }
      console.log('Cart successfully updated in API!');
      const cartResponse = await fetch(
        `${backendUrl}/api/Cart/customer/${CustomerId}`,
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

  return (
    <div className="mx-auto p-2">
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {products
          .filter((product) => product.IsActive)
          .map((product) => (
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
