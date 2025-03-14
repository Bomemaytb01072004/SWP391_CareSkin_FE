import React from "react";
import { X, RefreshCcw, Scale } from "lucide-react";

const ComparePopup = ({ compareList, removeFromCompare, clearCompare, onCompareNow }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 md:left-40 z-50 transition-transform duration-300">
      <div className="w-full px-2 md:px-6 lg:px-8">
        <div className="mx-auto w-full lg:ml-[280px] xl:ml-[350px] max-w-full lg:max-w-[calc(100%-280px)] xl:max-w-[calc(100%-350px)]">
          <div className="bg-white rounded-t-xl shadow-lg border border-gray-200">
            <div className="flex justify-between items-center px-4 md:px-6 py-3 md:py-4 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <Scale className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                <span className="font-semibold text-gray-800 text-sm md:text-base">
                  Compare Products ({compareList.length})
                </span>
              </div>
              <button
                onClick={clearCompare}
                className="flex items-center space-x-1 text-gray-600 hover:text-red-500 transition-colors duration-200"
              >
                <RefreshCcw className="w-3 h-3 md:w-4 md:h-4" />
                <span className="text-xs md:text-sm">Clear All</span>
              </button>
            </div>

            <div className="px-4 md:px-6 py-3 md:py-4">
              <div className="flex space-x-3 md:space-x-4 overflow-x-auto pb-2 hide-scrollbar">
                {compareList.map((product) => (
                  <div
                    key={product.ProductId}
                    className="flex items-center space-x-2 md:space-x-3 bg-gray-50 border border-gray-200 
                             rounded-lg px-3 md:px-4 py-2 min-w-[160px] md:min-w-[200px] 
                             group hover:border-blue-300 transition-all duration-200"
                  >
                    <div className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0">
                      <img
                        src={product.PictureUrl || 'https://via.placeholder.com/40'}
                        alt={product.ProductName}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm font-medium text-gray-800 truncate">
                        {product.ProductName}
                      </p>
                      {product.Category && (
                        <p className="text-[10px] md:text-xs text-gray-500 truncate">
                          {product.Category}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => removeFromCompare(product.ProductId)}
                      className="p-1 md:opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <X className="w-3 h-3 md:w-4 md:h-4 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-4 md:px-6 py-3 md:py-4 bg-gray-50 rounded-b-xl">
              <button
                onClick={onCompareNow}
                disabled={compareList.length < 2}
                className={`w-full py-2.5 md:py-3 rounded-lg font-medium text-sm md:text-base 
                          transition-all duration-200
                          ${compareList.length < 2
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg active:transform active:scale-[0.99]'
                          }`}
              >
                Compare Now
              </button>
              {compareList.length < 2 && (
                <p className="text-[10px] md:text-xs text-gray-500 text-center mt-2">
                  Add at least 2 products to compare
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparePopup;
