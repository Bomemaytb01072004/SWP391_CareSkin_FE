import React, { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';

const CreatePromotionModal = ({ newPromotion, setNewPromotion, handleAddPromotion, onClose }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPromotion({ ...newPromotion, [name]: value });
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setNewPromotion({ ...newPromotion, [name]: value });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-black">Create New Promotion</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Promotion Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="PromotionName"
              value={newPromotion.PromotionName || ''}
              onChange={handleInputChange}
              className="w-full bg-gray-100 text-black px-3 py-2 rounded-md border border-gray-300"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Promotion Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div 
                className={`border ${newPromotion.PromotionType === 1 ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} rounded-lg p-3 cursor-pointer transition-colors`}
                onClick={() => setNewPromotion({...newPromotion, PromotionType: 1})}
              >
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    checked={newPromotion.PromotionType === 1} 
                    onChange={() => {}} 
                    className="mr-2"
                  />
                  <div>
                    <p className="font-medium text-black">Product Discount</p>
                    <p className="text-xs text-gray-600">Apply discount to specific products</p>
                  </div>
                </div>
              </div>
              
              <div 
                className={`border ${newPromotion.PromotionType === 2 ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} rounded-lg p-3 cursor-pointer transition-colors`}
                onClick={() => setNewPromotion({...newPromotion, PromotionType: 2})}
              >
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    checked={newPromotion.PromotionType === 2} 
                    onChange={() => {}}
                    className="mr-2" 
                  />
                  <div>
                    <p className="font-medium text-black">Order Discount</p>
                    <p className="text-xs text-gray-600">Apply discount to entire orders</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Description
            </label>
            <textarea
              name="Description"
              value={newPromotion.Description || ''}
              onChange={handleInputChange}
              className="w-full bg-gray-100 text-black px-3 py-2 rounded-md border border-gray-300 h-24"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Discount Percentage <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center">
              <input
                type="number"
                name="DiscountPercent"
                value={newPromotion.DiscountPercent || ''}
                onChange={handleInputChange}
                className="w-full bg-gray-100 text-black px-3 py-2 rounded-md border border-gray-300"
                min="0"
                max="100"
                step="0.01"
                required
              />
              <span className="ml-2 text-black">%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="StartDate"
                value={newPromotion.StartDate || ''}
                onChange={handleDateChange}
                className="w-full bg-gray-100 text-black px-3 py-2 rounded-md border border-gray-300"
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
                value={newPromotion.EndDate || ''}
                onChange={handleDateChange}
                className="w-full bg-gray-100 text-black px-3 py-2 rounded-md border border-gray-300"
                required
              />
            </div>
          </div>

          {newPromotion.PromotionType === 1 && (
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> To apply this promotion to specific products, please use the "Manage Product Discounts" feature after creating the promotion.
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddPromotion}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Promotion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePromotionModal;
