import React from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';

const ViewSkinTypeModal = ({ skinType, onClose }) => {
  if (!skinType) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-black">Skin Type Details</h2>
          <button onClick={onClose} className="text-gray-700 hover:text-black">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Skin Type Information */}
          <div className="space-y-4">
            {/* ID */}
            <div>
              <h3 className="text-sm font-medium text-black">ID</h3>
              <p className="text-sm text-black mt-1 font-mono">{skinType.SkinTypeId}</p>
            </div>

            {/* Type Name */}
            <div>
              <h3 className="text-sm font-medium text-black">Type Name</h3>
              <p className="text-lg font-medium text-black mt-1">{skinType.TypeName}</p>
            </div>

            {/* Score Range */}
            <div>
              <h3 className="text-sm font-medium text-black">Score Range</h3>
              <div className="bg-gray-200 rounded p-2 mt-1">
                <div className="flex justify-between">
                  <div>
                    <span className="text-xs text-black">Min:</span>
                    <span className="text-md text-black ml-2">{skinType.MinScore}</span>
                  </div>
                  <div>
                    <span className="text-xs text-black">Max:</span>
                    <span className="text-md text-black ml-2">{skinType.MaxScore}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-sm font-medium text-black">Description</h3>
              <div className="mt-1 p-3 bg-gray-200 rounded-lg text-black">
                <p>{skinType.Description}</p>
              </div>
            </div>

            {/* Status */}
            <div>
              <h3 className="text-sm font-medium text-black">Status</h3>
              <div className="flex items-center mt-1">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    skinType.IsActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {skinType.IsActive ? (
                    <>
                      <CheckCircle2 className="mr-1" size={12} />
                      Active
                    </>
                  ) : (
                    <>
                      <AlertCircle className="mr-1" size={12} />
                      Inactive
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-black px-6 py-2 rounded-lg font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewSkinTypeModal;
