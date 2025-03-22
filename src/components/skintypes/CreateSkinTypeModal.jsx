import React from 'react';
import { X } from 'lucide-react';

const CreateSkinTypeModal = ({ newSkinType, setNewSkinType, handleAddSkinType, onClose }) => {
  // Handle input changes for skin type details
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setNewSkinType((prev) => ({
        ...prev,
        [name]: parseInt(value, 10) || 0,
      }));
    } else {
      setNewSkinType((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setNewSkinType((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-black">Create New Skin Type</h2>
          <button onClick={onClose} className="text-gray-700 hover:text-black">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Type Name */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Type Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="TypeName"
              value={newSkinType.TypeName}
              onChange={handleInputChange}
              className="w-full bg-gray-200 text-black rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter skin type name"
              required
            />
          </div>

          {/* Min Score */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Min Score <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="MinScore"
              value={newSkinType.MinScore}
              onChange={handleInputChange}
              className="w-full bg-gray-200 text-black rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter minimum score"
              required
              min="0"
            />
            <p className="text-xs text-gray-600 mt-1">Must be less than Max Score</p>
          </div>

          {/* Max Score */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Max Score <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="MaxScore"
              value={newSkinType.MaxScore}
              onChange={handleInputChange}
              className="w-full bg-gray-200 text-black rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter maximum score"
              required
              min="1"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="Description"
              value={newSkinType.Description}
              onChange={handleInputChange}
              rows={3}
              className="w-full bg-gray-200 text-black rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter skin type description"
              required
            />
          </div>

          {/* Active Status */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-black">
              <input
                type="checkbox"
                name="IsActive"
                checked={newSkinType.IsActive}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span>Active (will be visible to users)</span>
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end pt-4 space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddSkinType}
              disabled={!newSkinType.TypeName || !newSkinType.Description}
              className="px-4 py-2 bg-blue-300 hover:bg-blue-400 text-black rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Skin Type
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSkinTypeModal;
