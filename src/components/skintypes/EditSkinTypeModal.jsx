import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';

const EditSkinTypeModal = ({ editSkinTypeState, setEditSkinType, handleEdit, onClose }) => {
  const [nameError, setNameError] = useState('');
  
  // Validate type name
  const validateTypeName = (name) => {
    if (!name || name.trim() === '') {
      return 'Type name is required';
    }
    
    if (!name.trim().endsWith('Skin')) {
      return 'Type name must end with "Skin"';
    }
    
    if (name.length < 6) { // At least some characters + "Skin"
      return 'Type name is too short';
    }
    
    if (name.length > 50) {
      return 'Type name cannot exceed 50 characters';
    }
    
    return '';
  };
  
  // Check validation on initial load
  useEffect(() => {
    if (editSkinTypeState && editSkinTypeState.TypeName) {
      setNameError(validateTypeName(editSkinTypeState.TypeName));
    }
  }, []);
  
  // Handle input changes for skin type details
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    if (name === 'TypeName') {
      const error = validateTypeName(value);
      setNameError(error);
    }
    
    if (type === 'number') {
      setEditSkinType((prev) => ({
        ...prev,
        [name]: parseInt(value, 10) || 0,
      }));
    } else {
      setEditSkinType((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setEditSkinType((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };
  
  // Wrapper for handleEdit with validation
  const handleSubmit = () => {
    const nameValidationError = validateTypeName(editSkinTypeState.TypeName);
    
    if (nameValidationError) {
      toast.error(nameValidationError, {
        position: 'top-right',
        autoClose: 3000
      });
      setNameError(nameValidationError);
      return;
    }
    
    // Validate Min and Max Score
    if (editSkinTypeState.MinScore >= editSkinTypeState.MaxScore) {
      toast.error('Min Score must be less than Max Score', {
        position: 'top-right',
        autoClose: 3000
      });
      return;
    }
    
    // Validate description length
    if (!editSkinTypeState.Description || editSkinTypeState.Description.length < 20) {
      toast.error('Description must be at least 20 characters long', {
        position: 'top-right',
        autoClose: 3000
      });
      return;
    }
    
    // If all validations pass, call the original handler
    handleEdit();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-black">Edit Skin Type</h2>
          <button onClick={onClose} className="text-gray-700 hover:text-black">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Type Name */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Type Name <span className="text-red-500">*</span>
              <span className="text-xs text-gray-500 ml-1">(must end with "Skin")</span>
            </label>
            <input
              type="text"
              name="TypeName"
              value={editSkinTypeState.TypeName}
              onChange={handleInputChange}
              className={`w-full bg-gray-200 text-black rounded-lg px-4 py-2 focus:outline-none focus:ring-2 
                ${nameError ? 'border-2 border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}`}
              placeholder="Enter skin type name (e.g., 'Dry Skin')"
              required
            />
            {nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
          </div>

          {/* Min Score */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Min Score <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="MinScore"
              value={editSkinTypeState.MinScore}
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
              value={editSkinTypeState.MaxScore}
              onChange={handleInputChange}
              className="w-full bg-gray-200 text-black rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter maximum score"
              required
              min="1"
            />
            {editSkinTypeState.MinScore >= editSkinTypeState.MaxScore && 
              <p className="text-red-500 text-xs mt-1">Max Score must be greater than Min Score</p>
            }
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Description <span className="text-red-500">*</span>
              <span className="text-xs text-gray-500 ml-1">(minimum 20 characters)</span>
            </label>
            <textarea
              name="Description"
              value={editSkinTypeState.Description}
              onChange={handleInputChange}
              rows={3}
              className={`w-full bg-gray-200 text-black rounded-lg px-4 py-2 focus:outline-none focus:ring-2 
                ${editSkinTypeState.Description && editSkinTypeState.Description.length < 20 ? 'border-2 border-red-500' : 'focus:ring-blue-500'}`}
              placeholder="Enter skin type description"
              required
            />
            {editSkinTypeState.Description && editSkinTypeState.Description.length < 20 && 
              <p className="text-red-500 text-xs mt-1">Description must be at least 20 characters long ({20 - editSkinTypeState.Description.length} more needed)</p>
            }
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
              onClick={handleSubmit}
              disabled={nameError || 
                !editSkinTypeState.TypeName || 
                !editSkinTypeState.Description || 
                editSkinTypeState.Description.length < 20 ||
                editSkinTypeState.MinScore >= editSkinTypeState.MaxScore}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              Update Skin Type
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditSkinTypeModal;
