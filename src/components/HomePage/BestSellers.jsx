import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const BestSellers = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const itemsPerPage = 4;

  useEffect(() => {
    const controller = new AbortController();
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/Product`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error('Failed to fetch products');

        const data = await res.json();
        const formattedProducts = data
          .filter((product) => product.IsActive)
          .map((product) => {
            const variation = product.Variations?.[0] || {};
            const promotion = product.PromotionProducts?.[0] || null;
            return {
              id: product.ProductId,
              name: product.ProductName || 'Unnamed Product',
              image: product.PictureUrl || '/placeholder.jpg',
              category: product.Category || 'Unknown',
              price:
                variation?.SalePrice > 0
                  ? variation.SalePrice
                  : variation?.Price || 0,
              originalPrice: variation?.SalePrice > 0 ? variation.Price : null,
              discount: promotion ? `${promotion.DiscountPercent}% OFF` : null,
              rating: product.AverageRating || 0,
            };
          });

        setProducts(formattedProducts);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    return () => controller.abort(); // Cleanup fetch on unmount
  }, []);

  const bestSellers = useMemo(
    () =>
      [...products].sort((a, b) => b.rating - a.rating).slice(0, itemsPerPage),
    [products]
  );

  if (loading)
    return (
      <p className="text-center text-gray-500 py-8">Loading bestsellers...</p>
    );
  if (error)
    return <p className="text-center text-red-500 py-8">Error: {error}</p>;

  return (
    <div className="mx-auto px-4 py-8 max-w-screen-2xl relative">
      <h2 className="text-3xl font-bold mt-8 mb-10 text-black">Bestsellers</h2>
      <div className="w-full flex justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {bestSellers.map((product) => (
              <div
                key={product.id}
                className="relative rounded-lg p-6 bg-white border border-gray-200 shadow-lg hover:shadow-2xl transition-shadow cursor-pointer"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                {product.discount && (
                  <div className="absolute top-0 left-0 rounded-full bg-black px-3 text-xs text-white">
                    {product.discount}
                  </div>
                )}
                <div className="w-full h-72 flex justify-center items-center">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className="max-h-full max-w-full object-contain rounded-lg"
                    onError={(e) => (e.target.src = '/src/assets/download.gif')} // Fallback image
                  />
                </div>
                <h3 className="mt-3 mx-1 text-lg tracking-tight text-slate-900 truncate">
                  {product.name}
                </h3>
                <h6 className="text-md mx-1 tracking-tight text-slate-600 truncate">
                  {product.category}
                </h6>
                <div className="flex items-center space-x-2 mb-2">
                  <p>
                    {product.originalPrice ? (
                      <>
                        <span className="text-xl font-bold text-slate-900">
                          ${parseFloat(product.price).toFixed(2)}
                        </span>
                        <span className="text-sm text-slate-900 line-through ml-2">
                          ${parseFloat(product.originalPrice).toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="text-xl font-bold text-slate-900">
                        ${parseFloat(product.price).toFixed(2)}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center">
                  <span className="flex items-center gap-1 text-yellow-500 font-semibold">
                    {product.rating ? product.rating.toFixed(1) : '0.0'}
                    <Star size={16} className="fill-yellow-500" />
                  </span>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="text-center mt-8">
        <button
          onClick={() =>
            navigate('/products', { state: { fromBestsellers: true } })
          }
          className="bg-black text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors"
        >
          View All
        </button>
      </div>
    </div>
  );
};

export default BestSellers;
