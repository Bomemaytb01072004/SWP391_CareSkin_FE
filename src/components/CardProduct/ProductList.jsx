import React, { useEffect, useState } from 'react';
import CardProduct from './CardProduct';
import { fetchProducts } from '../../utils/api';
import LoadingPage from '../../Pages/LoadingPage/LoadingPage';
import { useNavigate } from 'react-router-dom';
import ComparePopup from '../ComparePopup/ComparePopup';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);

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
  }, []); // <= Mảng phụ thuộc

  useEffect(() => {
    localStorage.setItem('compareList', JSON.stringify(compareList));
  }, [compareList]);

  useEffect(() => {
    localStorage.setItem('compareList', JSON.stringify(compareList));
  }, [compareList]);

  // ✅ Add Item to Cart
  const addToCart = async (product) => {
    const CustomerId = localStorage.getItem('CustomerId');
    const Token = localStorage.getItem('token');

    if (!CustomerId) {
      console.warn('CustomerId is missing! Using localStorage for guest cart.');

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
      setCart(cart);
      return;
    }

    try {
      const newCartItem = {
        CustomerId: parseInt(CustomerId),
        ProductId: product.ProductId,
        ProductVariationId: product.Variations[0].ProductVariationId, // First variation
        Quantity: 1,
      };

      console.log('Sending API Request:', JSON.stringify(newCartItem, null, 2));

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

      // Fetch updated cart after adding an item
      await fetchCart(); // 🔥 Ensure the UI updates with fresh cart data

      console.log('Cart successfully updated!');
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
