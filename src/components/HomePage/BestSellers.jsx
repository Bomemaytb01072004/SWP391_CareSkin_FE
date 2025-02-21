import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';

const BestSellers = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await fetch('https://679897e2be2191d708b02aab.mockapi.io/api/products/Products');
      const data = await res.json();
      const topRatedProducts = data.sort((a, b) => b.rating - a.rating).slice(0, 4);
      setProducts(topRatedProducts);
    };
    fetchProducts();
  }, []);

  return (
    <div className="mx-auto px-4 py-8 max-w-screen-2xl">
      <h2 className="text-3xl font-bold mt-16 mb-10 text-black">Bestsellers</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="relative rounded-lg p-4 bg-white shadow-md hover:shadow-xl transition-shadow">
            <div className="absolute top-2 left-2 bg-black text-white text-xs font-semibold px-2 py-1 rounded-full">
              {product.discount} OFF
            </div>
            <img src={product.image} alt={product.name} className="w-full h-64 object-cover rounded-md mb-4" />
            <h3 className="text-md font-bold truncate mb-1">{product.name}</h3>
            <div className="flex items-center space-x-2 mb-2">
              <p className="text-lg font-bold text-black">${product.price.toFixed(2)}</p>
              <p className="text-sm text-gray-400 line-through">${product.originalPrice.toFixed(2)}</p>
            </div>
            <div className="flex items-center space-x-1">
              <p className="text-yellow-500 font-semibold">{product.rating.toFixed(1)}</p>
              <Star size={16} className="text-yellow-400 fill-yellow-400" />
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-8">
        <button
          onClick={() => navigate('/products')}
          className="bg-black text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors"
        >
          View All
        </button>
      </div>
    </div>
  );
};

export default BestSellers;
