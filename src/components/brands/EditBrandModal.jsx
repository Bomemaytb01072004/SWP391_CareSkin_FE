import React from 'react';
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
          <input
            type="text"
            placeholder="Brand Name"
            className="p-2 border border-gray-300 text-gray-900 rounded-lg"
            value={editingBrand.Name}
            autoFocus
            onChange={(e) =>
              setEditingBrand({ ...editingBrand, Name: e.target.value })
            }
          />
          
          {/* Active Status Toggle */}
          {/* <div className="flex items-center space-x-4">
            <span className="text-gray-700 font-medium">Status:</span>
            <div className="flex space-x-3">
              <button
                type="button"
                className={`flex items-center px-3 py-2 rounded-lg ${
                  editingBrand.IsActive
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => setEditingBrand({ ...editingBrand, IsActive: true })}
              >
                <CheckCircle size={18} className="mr-2" />
                Active
              </button>
              <button
                type="button"
                className={`flex items-center px-3 py-2 rounded-lg ${
                  !editingBrand.IsActive
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => setEditingBrand({ ...editingBrand, IsActive: false })}
              >
                <XCircle size={18} className="mr-2" />
                Inactive
              </button>
            </div>
          </div> */}

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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={handleUpdate}
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditBrandModal;
