import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';

const EditPromotionModal = ({ editPromotionState, setEditPromotion, products, handleEdit, onClose }) => {
  const [selectedProducts, setSelectedProducts] = useState([]);

  useEffect(() => {
    if (editPromotionState && editPromotionState.ApplicableProducts) {
      setSelectedProducts(editPromotionState.ApplicableProducts);
    }
  }, [editPromotionState]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = value;
    
    // Handle date formatting
    if (type === 'date') {
      finalValue = value; // Keep the original date format as YYYY-MM-DD
    } else if (type === 'number') {
      finalValue = parseFloat(value); // Convert to number for DiscountPercent
    }
    
    setEditPromotion((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : finalValue,
    }));

    // Log the current state after update
    console.log('Current editPromotionState:', {
      ...editPromotionState,
      [name]: finalValue
    });
  };

  const handlePromotionTypeChange = (e) => {
    const value = parseInt(e.target.value);
    setEditPromotion(prev => ({
      ...prev,
      PromotionType: value
    }));
  };

  const handleProductSelection = (e) => {
    const productId = parseInt(e.target.value);
    const isChecked = e.target.checked;
    
    if (isChecked) {
      setSelectedProducts(prev => [...prev, productId]);
      setEditPromotion(prev => ({
        ...prev,
        ApplicableProducts: [...(prev.ApplicableProducts || []), productId]
      }));
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId));
      setEditPromotion(prev => ({
        ...prev,
        ApplicableProducts: (prev.ApplicableProducts || []).filter(id => id !== productId)
      }));
    }
  };

  // Add validation function
  const validateForm = () => {
    // Log current state for debugging
    console.log('Validating form with state:', editPromotionState);

    const promotion = editPromotionState || {};
    
    // Name is required
    if (!promotion.Name || promotion.Name.trim() === '') {
      console.log('Name is missing');
      return false;
    }
    
    // PromotionType must be 1 or 2
    if (!promotion.PromotionType || ![1, 2].includes(Number(promotion.PromotionType))) {
      console.log('Invalid PromotionType:', promotion.PromotionType);
      return false;
    }
    
    // DiscountPercent must be between 0 and 100
    const discount = Number(promotion.DiscountPercent);
    if (isNaN(discount) || discount < 0 || discount > 100) {
      console.log('Invalid DiscountPercent:', promotion.DiscountPercent);
      return false;
    }
    
    // Dates must be present
    if (!promotion.StartDate || !promotion.EndDate) {
      console.log('Missing dates:', { start: promotion.StartDate, end: promotion.EndDate });
      return false;
    }

    return true;
  };

  useEffect(() => {
    if (editPromotionState) {
      console.log('Promotion state updated:', editPromotionState);
    }
  }, [editPromotionState]);

  useEffect(() => {
    console.log('Current promotion state:', editPromotionState);
  }, [editPromotionState]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-black">Edit Promotion</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Promotion Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="Name"
              value={editPromotionState.Name}
              onChange={handleInputChange}
              className="w-full bg-gray-100 text-black rounded-lg px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter promotion name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Promotion Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div 
                className={`p-3 rounded-lg border-2 cursor-pointer ${editPromotionState.PromotionType === 1 
                  ? 'border-blue-500 bg-blue-100' 
                  : 'border-gray-300 hover:border-gray-400'}`}
                onClick={() => {
                  setEditPromotion(prev => ({ ...prev, PromotionType: 1 }));
                }}
              >
                <div className="flex items-center mb-1">
                  <input 
                    type="radio" 
                    checked={editPromotionState.PromotionType === 1} 
                    onChange={() => {}} 
                    className="mr-2"
                  />
                  <span className="font-medium text-black">Product Discount</span>
                </div>
                <p className="text-sm text-gray-600">
                  Apply discount directly to specific products. Customers will see discounted prices on product pages.
                </p>
              </div>
              
              <div 
                className={`p-3 rounded-lg border-2 cursor-pointer ${editPromotionState.PromotionType === 2 
                  ? 'border-green-500 bg-green-100' 
                  : 'border-gray-300 hover:border-gray-400'}`}
                onClick={() => {
                  setEditPromotion(prev => ({ ...prev, PromotionType: 2 }));
                }}
              >
                <div className="flex items-center mb-1">
                  <input 
                    type="radio" 
                    checked={editPromotionState.PromotionType === 2} 
                    onChange={() => {}} 
                    className="mr-2"
                  />
                  <span className="font-medium text-black">Order Discount</span>
                </div>
                <p className="text-sm text-gray-600">
                  Customers can apply this promotion during checkout to their entire order.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Discount Percentage <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="DiscountPercent"
              value={editPromotionState.DiscountPercent}
              onChange={handleInputChange}
              className="w-full bg-gray-100 text-black rounded-lg px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter discount percentage"
              min="0"
              max="100"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="StartDate"
                value={editPromotionState.StartDate}
                onChange={handleInputChange}
                className="w-full bg-gray-100 text-black rounded-lg px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="EndDate"
                value={editPromotionState.EndDate}
                onChange={handleInputChange}
                className="w-full bg-gray-100 text-black rounded-lg px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Applicable Products
            </label>
            <div className="max-h-60 overflow-y-auto bg-gray-100 rounded-lg p-3 border border-gray-300">
              {products.length > 0 ? (
                products.map((product) => (
                  <div key={product.ProductId} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id={`edit-product-${product.ProductId}`}
                      value={product.ProductId}
                      checked={selectedProducts.includes(product.ProductId)}
                      onChange={handleProductSelection}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`edit-product-${product.ProductId}`} className="ml-2 block text-sm text-black">
                      {product.ProductName}
                    </label>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-sm">No products available</p>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={() => {
                if (validateForm()) {
                  handleEdit();
                } else {
                  console.log('Form validation failed');
                  toast.error('Please fill in all required fields: Name, Type, Discount %, Start Date, and End Date');
                }
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium"
            >
              Update Promotion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPromotionModal;
