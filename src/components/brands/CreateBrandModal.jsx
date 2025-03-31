import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createBrand } from '../../utils/api';

function CreateBrandModal({
  newBrand,
  setNewBrand,
  previewUrlNewUploadBrand,
  setPreviewUrlNewUploadBrand,
  onClose,
  refetchBrands,
}) {
  const [nameError, setNameError] = useState('');

  // Validate brand name function
  const validateBrandName = (name) => {
    if (!name || name.trim() === '') {
      return 'Brand name is required';
    }
    
    if (name.length < 2) {
      return 'Brand name must be at least 2 characters';
    }
    
    if (name.length > 50) {
      return 'Brand name cannot exceed 50 characters';
    }
    
    // Check for invalid characters (optional)
    const invalidCharsRegex = /[<>{}[\]\\\/]/;
    if (invalidCharsRegex.test(name)) {
      return 'Brand name contains invalid characters';
    }
    
    return '';
  };

  // Handle name change with validation
  const handleNameChange = (e) => {
    const newName = e.target.value;
    setNewBrand({ ...newBrand, Name: newName });
    setNameError(validateBrandName(newName));
  };

  const handleAddBrand = async () => {
    // Validate name
    const nameValidationError = validateBrandName(newBrand.Name);
    if (nameValidationError) {
      toast.error(nameValidationError);
      setNameError(nameValidationError);
      return;
    }

    // Validate image
    if (!newBrand.PictureFile) {
      toast.error('Please upload a brand image');
      return;
    }

    try {
      await createBrand(newBrand);
      toast.success('Brand created successfully!');
      onClose();
      setNewBrand({ Name: '', PictureFile: '' });
      setPreviewUrlNewUploadBrand(null);
      
      if (refetchBrands) {
        refetchBrands();
      }
    } catch (error) {
      console.error('Failed to add brand:', error);
      toast.error('Failed to create brand!');
    }
  };

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
          <h3 className="text-lg font-semibold text-gray-900">
            Add New Brand
          </h3>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
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
              value={newBrand.Name}
              autoFocus
              onChange={handleNameChange}
            />
            {nameError && (
              <p className="mt-1 text-red-500 text-sm">{nameError}</p>
            )}
          </div>

          <div className="relative col-span-2">
            <label className="block mb-1 text-gray-700 font-semibold">
              Brand Image <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-row items-center gap-4">
              {previewUrlNewUploadBrand ? (
                <a
                  href={previewUrlNewUploadBrand}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-40 h-40 border border-gray-300"
                >
                  <img
                    src={previewUrlNewUploadBrand}
                    alt="Preview new upload"
                    className="w-full h-full object-cover rounded"
                  />
                </a>
              ) : (
                newBrand.PictureFile &&
                typeof newBrand.PictureFile === 'string' && (
                  <Link
                    to={newBrand.PictureFile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block w-40 h-40 border border-gray-300"
                  >
                    <img
                      src={newBrand.PictureFile}
                      alt="Existing brand image"
                      className="w-full h-full object-cover rounded"
                    />
                  </Link>
                )
              )}

              <label
                htmlFor="brand-file-upload"
                className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-50"
              >
                <span className="text-2xl text-gray-400">
                  {previewUrlNewUploadBrand ||
                   (newBrand.PictureFile && typeof newBrand.PictureFile === "string")
                    ? ""
                    : "+"}
                </span>
                <span className="text-sm text-gray-500 mt-1">
                  {previewUrlNewUploadBrand ||
                  (newBrand.PictureFile && typeof newBrand.PictureFile === "string")
                    ? "Replace image"
                    : "Upload brand image"}
                </span>
              </label>

              <input
                id="brand-file-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const newFile = e.target.files[0];
                    setNewBrand({ ...newBrand, PictureFile: newFile });
                    const preview = URL.createObjectURL(newFile);
                    setPreviewUrlNewUploadBrand(preview);
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
            onClick={handleAddBrand}
            disabled={!!nameError}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateBrandModal;
