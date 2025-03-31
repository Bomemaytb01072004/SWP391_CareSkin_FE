import React, { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

function EditBrandModal({
  editingBrand,
  setEditingBrand,
  previewUrlEdit,
  setPreviewUrlEdit,
  onClose,
  handleUpdate,
}) {
  const [nameError, setNameError] = useState('');
  
  useEffect(() => {
    if (editingBrand && editingBrand.Name) {
      validateBrandName(editingBrand.Name);
    }
  }, []);
  
  // Validate brand name function
  const validateBrandName = (name) => {
    if (!name || name.trim() === '') {
      setNameError('Brand name is required');
      return false;
    }
    
    if (name.length < 2) {
      setNameError('Brand name must be at least 2 characters');
      return false;
    }
    
    if (name.length > 50) {
      setNameError('Brand name cannot exceed 50 characters');
      return false;
    }
    
    // Check for invalid characters
    const invalidCharsRegex = /[<>{}[\]\\\/]/;
    if (invalidCharsRegex.test(name)) {
      setNameError('Brand name contains invalid characters');
      return false;
    }
    
    setNameError('');
    return true;
  };

  // Handle name change with validation
  const handleNameChange = (e) => {
    const newName = e.target.value;
    setEditingBrand({ ...editingBrand, Name: newName });
    validateBrandName(newName);
  };

  const handleSubmitUpdate = () => {
    // Validate name
    if (!validateBrandName(editingBrand.Name)) {
      toast.error(nameError, {
        position: 'top-right',
        autoClose: 3000
      });
      return;
    }

    // Proceed with update
    try {
      handleUpdate();
      toast.success('Brand updated successfully!', {
        position: 'top-right',
        autoClose: 3000
      });
    } catch (error) {
      console.error('Failed to update brand:', error);
      toast.error('Failed to update brand: ' + (error.message || 'Unknown error'), {
        position: 'top-right',
        autoClose: 5000
      });
    }
  };

  if (!editingBrand) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[9999]"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-4xl overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Edit Brand</h3>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="col-span-2 md:col-span-1">
            <label className="block mb-1 text-gray-700 font-semibold">
              Brand Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Brand Name"
              className={`p-2 w-full border ${nameError ? 'border-red-500' : 'border-gray-300'} text-gray-900 rounded-lg`}
              value={editingBrand.Name}
              autoFocus
              onChange={handleNameChange}
              maxLength={50}
            />
            {nameError && (
              <p className="mt-1 text-red-500 text-sm">{nameError}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Brand name must be between 2-50 characters
            </p>
          </div>
          
          {/* Active Status Toggle - Uncomment if needed */}
          {/* <div className="flex items-center space-x-4">...</div> */}

          <div className="relative col-span-2">
            <label className="block mb-1 text-gray-700 font-semibold">
              Brand Image
            </label>
            <div className="flex flex-row items-center gap-4">
              {previewUrlEdit ? (
                <a
                  href={previewUrlEdit}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-40 h-40 border border-gray-300"
                >
                  <img
                    src={previewUrlEdit}
                    alt="Preview"
                    className="w-full h-full object-cover rounded"
                  />
                </a>
              ) : (
                editingBrand.PictureUrl && (
                  <Link
                    to={editingBrand.PictureUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block w-40 h-40 border border-gray-300"
                  >
                    <img
                      src={editingBrand.PictureUrl}
                      alt="Existing brand image"
                      className="w-full h-full object-cover rounded"
                    />
                  </Link>
                )
              )}

              <label
                htmlFor="brand-file-upload-edit"
                className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-50"
              >
                <span className="text-sm text-gray-500 mt-1">
                  {previewUrlEdit ? "Replace image" : "Upload brand image"}
                </span>
              </label>

              <input
                id="brand-file-upload-edit"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const newFile = e.target.files[0];
                    setEditingBrand({ ...editingBrand, PictureFile: newFile });
                    const preview = URL.createObjectURL(newFile);
                    setPreviewUrlEdit(preview);
                  }
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            className="px-4 py-2 bg-gray-400 text-white rounded-lg"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className={`px-4 py-2 ${nameError ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg`}
            onClick={handleSubmitUpdate}
            disabled={!!nameError}
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditBrandModal;
