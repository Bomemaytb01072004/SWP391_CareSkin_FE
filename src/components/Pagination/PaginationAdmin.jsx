import React from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable pagination component
 * @param {Object} props - Component props
 * @param {number} props.currentPage - Current active page
 * @param {number} props.totalPages - Total number of pages
 * @param {Function} props.onPageChange - Function called when page changes
 * @param {string} props.theme - Color theme ('blue', 'gray', 'indigo')
 * @param {number} props.maxVisiblePages - Maximum number of page buttons to show
 */
const PaginationAdmin = ({
  currentPage,
  totalPages,
  onPageChange,
  theme = 'blue',
  maxVisiblePages = 5
}) => {
  // If only one page, don't show pagination
  if (totalPages <= 1) return null;

  const themeStyles = {
    blue: {
      active: 'bg-blue-600 text-white',
      inactive: 'bg-gray-200 text-black hover:bg-gray-300',
      disabled: 'bg-gray-300 text-gray-500 cursor-not-allowed'
    },
    gray: {
      active: 'bg-gray-700 text-white',
      inactive: 'bg-gray-200 text-black hover:bg-gray-300',
      disabled: 'bg-gray-300 text-gray-500 cursor-not-allowed'
    },
    indigo: {
      active: 'bg-indigo-600 text-white',
      inactive: 'bg-gray-200 text-black hover:bg-gray-300',
      disabled: 'bg-gray-300 text-gray-500 cursor-not-allowed'
    }
  };

  const styles = themeStyles[theme] || themeStyles.blue;

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    
    // Calculate start and end page numbers to display
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Always show first page
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className={`px-4 py-2 rounded-lg ${
            currentPage === 1 ? styles.active : styles.inactive
          }`}
        >
          1
        </button>
      );
      
      // Show ellipsis if needed
      if (startPage > 2) {
        pages.push(
          <span key="start-ellipsis" className="px-2 py-2">
            ...
          </span>
        );
      }
    }

    // Add page numbers between start and end
    for (let i = startPage; i <= endPage; i++) {
      if (i === 1 || i === totalPages) continue; // Skip first and last as they're handled separately
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-4 py-2 rounded-lg ${
            currentPage === i ? styles.active : styles.inactive
          }`}
        >
          {i}
        </button>
      );
    }

    // Always show last page
    if (endPage < totalPages) {
      // Show ellipsis if needed
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="end-ellipsis" className="px-2 py-2">
            ...
          </span>
        );
      }
      
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={`px-4 py-2 rounded-lg ${
            currentPage === totalPages ? styles.active : styles.inactive
          }`}
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="flex justify-center my-4 space-x-2">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-4 py-2 mx-2 rounded-lg ${
          currentPage === 1 ? styles.disabled : styles.inactive
        }`}
      >
        Previous
      </button>

      {renderPageNumbers()}

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-4 py-2 mx-2 rounded-lg ${
          currentPage === totalPages ? styles.disabled : styles.inactive
        }`}
      >
        Next
      </button>
    </div>
  );
};

PaginationAdmin.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  theme: PropTypes.oneOf(['blue', 'gray', 'indigo']),
  maxVisiblePages: PropTypes.number
};

export default PaginationAdmin;