import React from 'react';

const ComparePopup = ({
  compareList,
  removeFromCompare,
  clearCompare,
  onCompareNow,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow p-4 z-50">
      <div className="flex justify-between items-center mb-2">
        <div className="font-bold">Compare List</div>
        <button onClick={clearCompare} className="text-red-500">
          Clear All
        </button>
      </div>
      <div className="flex space-x-4 overflow-x-auto">
        {compareList.map((product) => (
          <div
            key={product.id}
            className="flex items-center space-x-2 border p-2 rounded"
          >
            <span>{product.name}</span>
            <button
              onClick={() => removeFromCompare(product.id)}
              className="text-red-500"
            >
              x
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={onCompareNow}
        className="mt-4 w-full bg-blue-600 text-white py-2 rounded"
      >
        Compare Now
      </button>
    </div>
  );
};

export default ComparePopup;
