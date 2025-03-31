import React from 'react';
import { X } from 'lucide-react';

const EditPromotionModal = ({ editPromotionState, setEditPromotion, handleEdit, onClose }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditPromotion({ ...editPromotionState, [name]: value });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-black">Edit Promotion</h2>
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
              name="Name"
              value={editPromotionState.Name || ''}
              onChange={handleInputChange}
              className="w-full bg-gray-100 text-black px-3 py-2 rounded-md border border-gray-300"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Promotion Type <span className="text-red-500">*</span>
            </label>
            <select
              name="PromotionType"
              value={editPromotionState.PromotionType || ''}
              onChange={handleInputChange}
              className="w-full bg-gray-100 text-black px-3 py-2 rounded-md border border-gray-300"
              required
              disabled
            >
              <option value="1">Product Discount</option>
              <option value="2">Order Discount</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Description
            </label>
            <textarea
              name="Description"
              value={editPromotionState.Description || ''}
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
                value={editPromotionState.DiscountPercent || ''}
                onChange={handleInputChange}
                className="w-full bg-gray-100 text-black px-3 py-2 rounded-md border border-gray-300"
                min="0"
                max="100"
                step="0.1"
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
                value={editPromotionState.StartDate ? editPromotionState.StartDate.split('T')[0] : ''}
                onChange={handleInputChange}
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
                value={editPromotionState.EndDate ? editPromotionState.EndDate.split('T')[0] : ''}
                onChange={handleInputChange}
                className="w-full bg-gray-100 text-black px-3 py-2 rounded-md border border-gray-300"
                required
              />
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> To manage which products this promotion applies to, please use the "Manage Product Discounts" feature.
            </p>
          </div>

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
              onClick={handleEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
