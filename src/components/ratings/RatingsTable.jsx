import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Star, Eye, Trash, Search } from 'lucide-react';
import { deleteRating } from '../../utils/apiOfRating';
import ViewRatingModal from './ViewRatingModal';

const RatingsTable = ({ ratings, refetchRatings }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRatings, setFilteredRatings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ratingsPerPage = 8;

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingRating, setViewingRating] = useState(null);

  useEffect(() => {
    // Sort ratings by ID in descending order (newest first)
    const sorted = [...ratings].sort((a, b) => b.RatingFeedbackId - a.RatingFeedbackId);
    // Then filter by search term (product name or feedback text)
    const term = searchTerm.toLowerCase();
    const filtered = sorted.filter(
      (rating) => 
        (rating.ProductName && rating.ProductName.toLowerCase().includes(term)) ||
        (rating.FeedBack && rating.FeedBack.toLowerCase().includes(term))
    );
    setFilteredRatings(filtered);
    setCurrentPage(1);
  }, [searchTerm, ratings]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleDelete = (ratingId) => {
    if (window.confirm('Are you sure you want to delete this rating?')) {
      try {
        deleteRating(ratingId);
        toast.success('Rating deleted successfully!');
        if (refetchRatings) {
          refetchRatings();
        }
      } catch (error) {
        console.error('Error deleting rating:', error);
        toast.error('Failed to delete rating!');
      }
    }
  };

  const handleView = (rating) => {
    setViewingRating(rating);
    setIsViewModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsViewModalOpen(false);
    setViewingRating(null);
  };

  const renderStars = (count) => {
    return Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        size={18}
        className={i < count ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
      />
    ));
  };
  
  const getRatingStatusBadge = (rating) => {
    const isActive = !!rating.IsActive; 
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs ${isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
      >
        {isActive ? "Active" : "Inactive"}
      </span>
    );
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredRatings.length / ratingsPerPage);
  const indexOfLastRating = currentPage * ratingsPerPage;
  const indexOfFirstRating = indexOfLastRating - ratingsPerPage;
  const displayedRatings = filteredRatings.slice(indexOfFirstRating, indexOfLastRating);

  return (
    <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden">
      {/* Search and filter */}
      <div className="p-4 border-b border-gray-700 flex items-center">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by product or feedback..."
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-900">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Product
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Customer
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Rating
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Feedback
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {displayedRatings.length > 0 ? (
              displayedRatings.map((rating) => (
                <tr key={rating.RatingFeedbackId} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                    {rating.ProductName || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {rating.CustomerName || 'Anonymous'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {renderStars(rating.Rating)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300 max-w-xs">
                    <div className="line-clamp-2">{rating.FeedBack}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {new Date(rating.CreatedDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {getRatingStatusBadge(rating)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleView(rating)}
                        className="text-indigo-400 hover:text-indigo-300 p-1 rounded-full hover:bg-gray-700 transition"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(rating.RatingFeedbackId)}
                        className="text-red-400 hover:text-red-300 p-1 rounded-full hover:bg-gray-700 transition"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-300">
                  No ratings found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredRatings.length > 0 && (
        <div className="flex justify-center my-4 space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 mx-2 rounded-lg ${currentPage === 1 ? 'bg-gray-500 text-gray-400 cursor-not-allowed' : 'bg-gray-700 text-white'}`}
          >
            Previous
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              className={`px-4 py-2 rounded-lg ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 mx-2 rounded-lg ${currentPage === totalPages ? 'bg-gray-500 text-gray-400 cursor-not-allowed' : 'bg-gray-700 text-white'}`}
          >
            Next
          </button>
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && viewingRating && (
        <ViewRatingModal
          rating={viewingRating}
          isOpen={isViewModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default RatingsTable;
