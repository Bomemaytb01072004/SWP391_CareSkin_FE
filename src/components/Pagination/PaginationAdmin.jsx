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
    
    // Trường hợp số trang ít, hiển thị tất cả
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
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
      return pages;
    }
    
    // Trường hợp nhiều trang, hiển thị có chọn lọc
    
    // 1. Luôn hiển thị trang 1
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
    
    // 2. Xác định vị trí trang hiện tại và thêm dấu "..." hoặc số trang
    let startPage, endPage;
    
    if (currentPage <= 4) {
      // Gần trang đầu: hiển thị 1 2 3 4 5 ... 20
      startPage = 2;
      endPage = 5;
      
      // Thêm các trang từ startPage đến endPage
      for (let i = startPage; i <= endPage; i++) {
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
      
      // Thêm dấu "..." nếu cần
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis-end" className="px-2 py-2">
            ...
          </span>
        );
      }
    } 
    else if (currentPage >= totalPages - 3) {
      // Gần trang cuối: hiển thị 1 ... 16 17 18 19 20
      
      // Thêm dấu "..." sau trang 1
      pages.push(
        <span key="ellipsis-start" className="px-2 py-2">
          ...
        </span>
      );
      
      // Thêm 4 trang cuối
      startPage = totalPages - 4;
      endPage = totalPages - 1;
      
      for (let i = startPage; i <= endPage; i++) {
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
    } 
    else {
      // Ở giữa: hiển thị 1 ... 8 9 10 ... 20
      
      // Thêm dấu "..." sau trang 1
      pages.push(
        <span key="ellipsis-start" className="px-2 py-2">
          ...
        </span>
      );
      
      // Hiển thị trang hiện tại và 1 trang trước/sau
      startPage = Math.max(2, currentPage - 1);
      endPage = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = startPage; i <= endPage; i++) {
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
      
      // Thêm dấu "..." trước trang cuối
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis-end" className="px-2 py-2">
            ...
          </span>
        );
      }
    }
    
    // 3. Luôn hiển thị trang cuối cùng
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