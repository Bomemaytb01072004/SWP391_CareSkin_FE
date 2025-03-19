import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const EditBlogModal = ({ editBlogState, setEditBlog, handleEdit, onClose }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    // If there's an existing image URL, set it as the selected image
    if (editBlogState.PictureUrl) {
      setSelectedImage(editBlogState.PictureUrl);
    }
  }, [editBlogState]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditBlog((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Preview the image
      setSelectedImage(URL.createObjectURL(file));
      setEditBlog((prev) => ({
        ...prev,
        PictureFile: file,
        // Keep the original PictureUrl in case the upload fails
        // It will be replaced on the backend if the upload succeeds
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Edit Blog</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Blog Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Blog Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="Title"
              value={editBlogState.Title}
              onChange={handleInputChange}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter blog title"
              required
            />
          </div>

          {/* Blog Content */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              name="Content"
              value={editBlogState.Content}
              onChange={handleInputChange}
              rows={12}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter blog content (Markdown supported)"
              required
            />
          </div>

          {/* Blog Image */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Blog Image <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="blogImageUploadEdit"
              />
              <label
                htmlFor="blogImageUploadEdit"
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg cursor-pointer"
              >
                Upload New Image
              </label>
              {selectedImage && (
                <div className="relative w-24 h-24">
                  <img
                    src={selectedImage}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      setEditBlog((prev) => ({ 
                        ...prev, 
                        PictureFile: null,
                        PictureUrl: null
                      }));
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    title="Remove image"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={handleEdit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              Update Blog
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditBlogModal;
