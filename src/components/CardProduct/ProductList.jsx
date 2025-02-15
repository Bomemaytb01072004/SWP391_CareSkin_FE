import React, { useEffect, useState } from 'react';
import CardProduct from './CardProduct';
import { fetchProducts } from '../../utils/api';
import LoadingPage from '../../Pages/LoadingPage/LoadingPage';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchProducts().then(setProducts);
  }, []);

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
          />
        ))}
      </div>
    </div>
  );
};

export default ProductList;
