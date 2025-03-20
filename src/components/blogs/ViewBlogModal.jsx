import React from 'react';
import { X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const ViewBlogModal = ({ blog, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-black">{blog.Title}</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-black">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex justify-between items-center border-b border-gray-300 pb-4">
            <div>
              <p className="text-gray-600 text-sm">
                {new Date(blog.CreatedDate || Date.now()).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Featured Image */}
          {blog.PictureUrl && (
            <div className="w-full flex justify-center">
              <img 
                src={blog.PictureUrl} 
                alt={blog.Title} 
                className="max-h-80 object-contain rounded-lg"
              />
            </div>
          )}

          {/* Blog Content */}
          <div className="prose max-w-none">
            <ReactMarkdown>{blog.Content}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewBlogModal;
