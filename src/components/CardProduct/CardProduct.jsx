import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCodeCompare } from '@fortawesome/free-solid-svg-icons';
import { generateProductSlug } from '../../utils/urlUtils';

function CardProduct({ product, addToCart, addToCompare }) {
  return (
    <div className="w-full">
      <div className="relative flex flex-col overflow-hidden rounded-lg border border-gray-100 bg-white shadow-md">
        <Link
          className="relative mx-4 mt-3 flex-col overflow-hidden rounded-xl"
          to={`/product/${generateProductSlug(product)}`} // Changed to use the slug
        >
          <img
            className="w-auto h-auto object-cover cursor-pointer"
            src={product.PictureUrl}
            alt={product.ProductName}
          />
          {product.PromotionProducts &&
            product.PromotionProducts.length > 0 &&
            product.PromotionProducts[0].DiscountPercent && (
              <span className="absolute top-0 left-0 rounded-full bg-black px-3 text-center text-xs text-white">
                {product.PromotionProducts[0].DiscountPercent}% OFF
              </span>
            )}
        </Link>

        <div className="px-2 pb-4 flex flex-col justify-between flex-grow">
          <Link to={`/product/${generateProductSlug(product)}`}>
            <h5 className="mt-3 mx-1 text-lg tracking-tight text-slate-900 truncate">
              {product.ProductName}
            </h5>
          </Link>
          <h6 className="text-md mx-1 tracking-tight text-slate-600 truncate">
            {product.Category}
          </h6>

          <div className="my-3 mx-1 flex items-center justify-between">
            <p>
              {(() => {
                // Use the first variation instead of finding minimum price
                const firstVariation = product.Variations[0];

                // Get the display price (either sale price or regular price)
                const displayPrice =
                  firstVariation.SalePrice && firstVariation.SalePrice > 0
                    ? firstVariation.SalePrice
                    : firstVariation.Price;

                return (
                  <>
                    <span className="text-xl font-bold text-slate-900">
                      ${displayPrice.toFixed(2)}
                    </span>
                    {firstVariation.SalePrice > 0 && (
                      <span className="text-sm text-slate-900 line-through ml-2">
                        ${firstVariation.Price.toFixed(2)}
                      </span>
                    )}
                  </>
                );
              })()}
            </p>
            <div className="flex items-center">
              <span className="flex items-center gap-1 text-yellow-500 font-semibold">
                {product.AverageRating.toFixed(2) || '0.0'}
                <Star size={16} className="fill-yellow-500" />
              </span>
            </div>
          </div>

          <div className="flex items-center w-full sm:justify-around justify-between">
            <button
              className=" sm:w-5/6 max-w-[240px] whitespace-nowrap rounded-md  bg-emerald-600 px-3 py-2 text-xs xs:text-sm sm:text-base font-medium text-white transition  hover:bg-emerald-700"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addToCart(product);
              }}
            >
              Add to cart
            </button>

            <button
              className="flex items-center justify-center p-1 w-6 h-8 max-h-[40px] sm:max-h-[40 px] sm:w-10 sm:h-10 rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 shadow-sm active:scale-95"
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
