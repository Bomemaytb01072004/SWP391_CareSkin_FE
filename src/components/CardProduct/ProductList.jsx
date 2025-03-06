import React, { useEffect, useState } from 'react';
import CardProduct from './CardProduct';
import { fetchProducts } from '../../utils/api';
import LoadingPage from '../../Pages/LoadingPage/LoadingPage';
import { useNavigate } from 'react-router-dom';
import ComparePopup from '../ComparePopup/ComparePopup';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [compareList, setCompareList] = useState(() => {
    const stored = localStorage.getItem('compareList');
    return stored ? JSON.parse(stored) : [];
  });
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (error) {
        console.error('Error in ProductsPage:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    localStorage.setItem('compareList', JSON.stringify(compareList));
  }, [compareList]);

  const addToCart = async (product) => {
    const CustomerId = localStorage.getItem('CustomerId');
    const Token = localStorage.getItem('Token');

    if (!CustomerId || !Token) {
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
          Price: firstVariation?.Price || 0,
          ProductVariationId: firstVariation?.ProductVariationId || null,
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

      const response = await fetch(
        `http://careskinbeauty.shop:4456/api/Cart/add`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${Token}`,
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
        {
          headers: { Authorization: `Bearer ${Token}` },
        }
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

  const addToCompare = (product) => {
    if (!compareList.find((p) => p.ProductId === product.ProductId)) {
      setCompareList([...compareList, product]);
    }
  };

  const removeFromCompare = (productId) => {
    setCompareList(compareList.filter((p) => p.ProductId !== productId));
  };

  const handleCompareNow = () => {
    const subpath = compareList
      .map(
        (product) => `${product.ProductId}-${product.name.replaceAll(' ', '-')}`
      )
      .join('/');
    navigate(`/compare/${subpath}`);
  };

  if (loading) {
    return <LoadingPage />;
  }

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
};

export default ProductList;
