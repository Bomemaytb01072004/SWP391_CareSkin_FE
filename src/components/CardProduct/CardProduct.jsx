import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCodeCompare } from '@fortawesome/free-solid-svg-icons';

function CardProduct({ product, addToCart, addToCompare }) {
  // Extract pricing details from the first variation (assuming products have at least one variation)
  const originalPrice = product.Variations[0]?.Price;
  const hasPromotion =
    product.PromotionProducts && product.PromotionProducts.length > 0;

  // If there is a promotion, use SalePrice; otherwise, just use original Price
  const currentPrice =
    hasPromotion && product.Variations[0]?.SalePrice !== 0
      ? product.Variations[0]?.SalePrice
      : originalPrice;

  const isDiscounted = hasPromotion && currentPrice < originalPrice;

  return (
    <div className="w-full">
      <div className="relative flex flex-col overflow-hidden rounded-lg border border-gray-100 bg-white shadow-md">
        <Link
          className="relative mx-4 mt-3 flex-col overflow-hidden rounded-xl"
          to={`/product/${product.ProductId}`}
        >
          <img
            className="w-auto h-auto object-cover"
            src={product.PictureUrl}
            alt={product.ProductName}
          />
          {isDiscounted && (
            <span className="absolute top-0 left-0 rounded-full bg-black px-3 text-center text-xs text-white">
              {Math.round(
                ((originalPrice - currentPrice) / originalPrice) * 100
              )}
              % OFF
            </span>
          )}
        </Link>

        <div className="px-2 pb-4 flex flex-col justify-between flex-grow">
          <Link to={`/product/${product.ProductId}`}>
            <h5 className="text-lg tracking-tight text-slate-900 truncate">
              {product.ProductName}
            </h5>
          </Link>

          <div className="mt-2 mb-5 flex items-center justify-between">
            <p>
              <span className="text-xl font-bold text-slate-900">
                ${currentPrice.toFixed(2)}
              </span>
              {isDiscounted && (
                <span className="text-sm text-gray-500 line-through ml-2">
                  ${originalPrice.toFixed(2)}
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

          <div className="flex items-center w-full sm:justify-around justify-between">
            <button
              className="sm:w-5/6 max-w-[240px] whitespace-nowrap rounded-md bg-emerald-600 px-3 py-2 text-xs xs:text-sm sm:text-base font-medium text-white transition hover:bg-emerald-700"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addToCart(product);
              }}
            >
              Add to cart
            </button>

            <button
              className="flex items-center justify-center p-1 w-6 h-8 max-h-[40px] sm:max-h-[40px] sm:w-10 sm:h-10 rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 shadow-sm active:scale-95"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addToCompare(product);
              }}
            >
              <FontAwesomeIcon
                icon={faCodeCompare}
                className="w-5 h-5 sm:w-5 sm:h-5 text-gray-500 transition-colors duration-200 hover:text-gray-700"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardProduct;
