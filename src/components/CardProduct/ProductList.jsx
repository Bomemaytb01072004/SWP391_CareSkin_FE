import React, { useEffect, useState } from 'react';
import CardProduct from './CardProduct';
import { fetchProducts } from '../../utils/api';
import LoadingPage from '../../Pages/LoadingPage/LoadingPage';
import { useNavigate } from 'react-router-dom';
import ComparePopup from '../ComparePopup/ComparePopup';

const ProductList = () => {
  const [products, setProducts] = useState([]);
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
  }, []); // <= Mảng phụ thuộc

  useEffect(() => {
    localStorage.setItem('compareList', JSON.stringify(compareList));
  }, [compareList]);

  const addToCart = (product) => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Check if product already exists in cart
    const existingProduct = cart.find((item) => item.id === product.id);

    if (existingProduct) {
      existingProduct.quantity += 1; // Increase quantity
    } else {
      cart.push({ ...product, quantity: 1 }); // Add new product with quantity
    }

    localStorage.setItem('cart', JSON.stringify(cart));

    // Dispatch an event to notify Navbar to update
    window.dispatchEvent(new Event('storage'));
  };

  // Hàm thêm sản phẩm vào danh sách so sánh
  const addToCompare = (product) => {
    // Chỉ thêm nếu sản phẩm chưa có trong compareList
    if (!compareList.find((p) => p.id === product.id)) {
      setCompareList([...compareList, product]);
    }
  };

  // Hàm xoá sản phẩm khỏi danh sách so sánh
  const removeFromCompare = (productId) => {
    setCompareList(compareList.filter((p) => p.id !== productId));
  };

  const handleCompareNow = () => {
    let subpath = '';
    for (let product of compareList) {
      subpath += `${product.id}-${product.name.replaceAll(' ', '-')}/`;
    }
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
            key={product.id}
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
