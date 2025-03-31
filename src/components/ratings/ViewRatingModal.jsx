import React from 'react';
import { X, Star, ExternalLink } from 'lucide-react';

const ViewRatingModal = ({ rating, isOpen, onClose }) => {
  const [enlargedImage, setEnlargedImage] = React.useState(null);

  if (!isOpen) return null;

  const renderStars = (count) => {
    return Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        size={24}
        className={i < count ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}
      />
    ));
  };

  const openImageInNewTab = (imageUrl) => {
    window.open(imageUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      {/* Enlarged Image View */}
      {enlargedImage && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-90" 
             onClick={() => setEnlargedImage(null)}>
          <div className="relative w-full max-w-4xl">
            <div className="absolute top-4 right-4 flex space-x-2">
              <button 
                onClick={() => openImageInNewTab(enlargedImage)}
                className="text-white p-2 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center space-x-1"
                title="Open in new tab"
              >
                <ExternalLink size={18} />
                <span>Open Original</span>
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setEnlargedImage(null);
                }}
                className="text-white p-2 rounded-full bg-gray-700 hover:bg-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <img 
              src={enlargedImage} 
              alt="Enlarged Feedback" 
              className="max-h-[80vh] max-w-full object-contain mx-auto"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Main Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">View Rating</h3>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            <X size={20} />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Product Info */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-600 mb-1">Product</p>
            <p className="text-base font-semibold text-gray-800">{rating.ProductName || 'N/A'}</p>
          </div>
          
          {/* Customer Info */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-600 mb-1">Customer</p>
            <p className="text-base text-gray-800">{rating.CustomerName || 'Anonymous'}</p>
          </div>

          {/* Date */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-600 mb-1">Date</p>
            <p className="text-base text-gray-800">{new Date(rating.CreatedDate).toLocaleDateString()}</p>
          </div>
          
          {/* Star Rating */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-600 mb-1">Rating</p>
            <div className="flex">
              {renderStars(rating.Rating)}
            </div>
          </div>

          {/* Status */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-600 mb-1">Status</p>
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                rating.IsActive 
                  ? "bg-green-100 text-green-800 border border-green-300" 
                  : "bg-red-100 text-red-800 border border-red-300"
              }`}
            >
              {rating.IsActive ? "Active" : "Inactive"}
            </span>
          </div>

          {/* Feedback */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-600 mb-1">Feedback</p>
            <p className="text-base text-gray-800 bg-gray-100 p-4 rounded-md border border-gray-200">
              {rating.FeedBack || 'No feedback provided'}
            </p>
          </div>

          {/* Images */}
          {rating.FeedbackImages && rating.FeedbackImages.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-600 mb-1">Images</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {rating.FeedbackImages.map((image, index) => (
                  <div key={index} className="relative group bg-gray-100 p-2 rounded-md border border-gray-200">
                    <img
                      src={image.FeedbackImageUrl}
                      alt={`Feedback ${index + 1}`}
                      className="w-full h-48 object-contain rounded-md mb-2 cursor-pointer"
                      onClick={() => setEnlargedImage(image.FeedbackImageUrl)}
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Image {index + 1}</span>
                      <a 
                        href={image.FeedbackImageUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <ExternalLink size={14} />
                        <span>Open</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-4 border-t border-gray-200">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-700 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewRatingModal;
