import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

function CardProduct({ product, addToCart }) {
  return (
    <div className="w-full">
      <div className="relative flex flex-col overflow-hidden rounded-lg border border-gray-100 bg-white shadow-md">
        <Link
          className="relative mx-4 mt-3 flex-col overflow-hidden rounded-xl"
          to={`/product/${product.id}`}
        >
          <img
            className="w-auto h-auto object-cover"
            src={product.image}
            alt={product.name}
          />
          {product.discount && (
            <span className="absolute top-0 left-0 rounded-full bg-black px-3 text-center text-xs text-white">
              {product.discount} OFF
            </span>
          )}
        </Link>

        <div className="px-2 pb-4 flex flex-col justify-between flex-grow">
          <Link to={`/product/${product.id}`}>
            <h5 className="text-lg tracking-tight text-slate-900 truncate">
              {product.name}
            </h5>
          </Link>

          <div className="mt-2 mb-5 flex items-center justify-between">
            <p>
              <span className="text-xl font-bold text-slate-900">
                ${product.price}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-slate-900 line-through ml-2">
                  ${product.originalPrice}
                </span>
              )}
            </p>
            <div className="flex items-center">
              <span className="flex items-center gap-1 text-yellow-500 font-semibold">
                {product.rating || '0.0'}
                <Star size={16} className="fill-yellow-500" />
              </span>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            className="flex items-center justify-center rounded-md bg-emerald-600 py-2.5 text-center text-sm font-medium text-white hover:bg-emerald-700"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(product);
            }}
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default CardProduct;
