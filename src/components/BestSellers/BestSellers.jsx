import React, { useEffect, useState } from 'react';

const BestSellers = () => {
  const [products, setProducts] = useState([]);

  // Fetch mock data
  useEffect(() => {
    fetch('https://678b21431a6b89b27a299db3.mockapi.io/api/v1/BestSeller')
      .then((res) => res.json())
      .then((data) => {
        // Sort by highest order ratings and limit to 4
        const topRatedProducts = data
          .sort((a, b) => b.rating - a.rating) // Sort in descending order by rating
          .slice(0, 4); // Get the top 4
        setProducts(topRatedProducts);
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Bestsellers</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className=" rounded-lg p-4 ">
            <img
              src={product.image}
              alt={product.title}
              className="w-50 h-50 rounded-md mb-4"
            />
            <h3 className="font-medium text-lg">{product.title}</h3>
            <p className="text-sm text-gray-500 mb-2">
              {product.description.slice(0, 50)}...
            </p>
            <p className="font-bold">${product.price.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BestSellers;
