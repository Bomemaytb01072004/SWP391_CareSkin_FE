import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { generateBlogSlug } from '../../utils/urlUtils';
const backendUrl = import.meta.env.VITE_BACKEND_URL;

function BlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [blogsPerPage] = useState(6);

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${backendUrl}/api/BlogNews`);
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        // Sort blogs by UploadDate (newest first) or fall back to BlogId
        const sortedBlogs = data.sort((a, b) => {
          // If both have UploadDate, use that for sorting
          if (a.UploadDate && b.UploadDate) {
            return new Date(b.UploadDate) - new Date(a.UploadDate);
          }
          // Otherwise fall back to BlogId
          return b.BlogId - a.BlogId;
        });
        setBlogs(sortedBlogs);
      } catch (error) {
        console.error('Fetch error:', error);
        setErrorMessage('Failed to load blog data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Function to truncate text to a specific length
  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Calculate estimated reading time
  const getReadingTime = (text) => {
    const wordsPerMinute = 200; // Average reading speed
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  // Filter blogs by search term
  const filteredBlogs = blogs
    .filter((blog) => blog.IsActive)
    .filter(
      (blog) =>
        blog.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.Content.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Get current blogs based on pagination
  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = filteredBlogs.slice(indexOfFirstBlog, indexOfLastBlog);

  // Calculate total pages
  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);

  // Change page
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Go to next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Go to previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  // Function to format just the date part
  const formatDateOnly = (dateString) => {
    if (!dateString || dateString === 'string') {
      return 'No date available';
    }

    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  // Function to format just the time part
  const formatTimeOnly = (dateString) => {
    if (!dateString || dateString === 'string') return '';

    try {
      // Handle the new format "MM/DD/YYYY hh:mm:ss AM/PM"
      if (dateString.includes('/')) {
        const parts = dateString.split(' ');
        if (parts.length >= 3) {
          const timePart = `${parts[1]} ${parts[2]}`; // hh:mm:ss AM/PM
          const [time, period] = timePart.split(' ');
          const [hours, minutes] = time.split(':');
          return `${hours}:${minutes} ${period}`;
        }
        return '';
      }
      // Handle ISO date format
      else {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
        });
      }
    } catch (error) {
      return '';
    }
  };

  return (
    <>
      <Navbar />
      {/* Enhanced Hero Section with Animated Background */}
      <motion.div
        className="relative w-full bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 py-24 md:py-32 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Animated circles in the background */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-24 w-72 h-72 bg-teal-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-20 w-80 h-80 bg-emerald-50 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

        <div className="absolute inset-0 bg-pattern opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/30"></div>

        <motion.div
          className="relative flex flex-col items-center text-center py-8 px-6 max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.span
            className="bg-emerald-100 text-emerald-800 text-xs font-medium px-4 py-1.5 rounded-full mb-5 shadow-sm"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            Our Skincare Journal
          </motion.span>
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <h1 className="font-bold leading-tight text-4xl md:text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 to-teal-600 inline-block pb-3">
              Skincare Blog & News
            </h1>
          </motion.div>
          <motion.p
            className="text-sm md:text-base lg:text-lg text-gray-600 mb-8 max-w-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            Stay up to date with the latest trends, tips, and insights for
            healthier, happier skin. Discover expert advice and beauty secrets.
          </motion.p>

          {/* Enhanced Floating Search bar */}
          <motion.div
            className="w-full max-w-md mt-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <div className="relative flex items-center w-full group">
              <input
                type="text"
                className="w-full px-5 py-3.5 pl-12 pr-12 text-center rounded-full border border-gray-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-md transition-all duration-300 group-hover:shadow-lg"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              {searchTerm && (
                <button
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors"
                  onClick={() => {
                    setSearchTerm('');
                    setCurrentPage(1);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Blog Cards Container with Enhanced Styling */}
      <div className="container mx-auto px-4 py-12 mb-16">
        {/* Enhanced Loading State with Pulsing Effect */}
        {loading && (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="w-16 h-16 relative">
              <div className="absolute inset-0 rounded-full border-t-4 border-emerald-400 animate-spin"></div>
              <div className="absolute inset-1 rounded-full border-2 border-emerald-100 animate-pulse"></div>
              <div className="absolute inset-4 rounded-full bg-emerald-50 animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-emerald-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
            </div>
            <p className="mt-4 text-emerald-600 font-medium">
              Loading blog posts...
            </p>
          </div>
        )}

        {/* Enhanced Error Message */}
        {errorMessage && !loading && (
          <div className="text-center bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl mb-8 shadow-sm max-w-2xl mx-auto">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 mx-auto mb-3 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="font-medium mb-1">Something went wrong</p>
            <p className="text-sm">{errorMessage}</p>
          </div>
        )}

        {/* Enhanced Search Results Count with Badge */}
        {!loading && searchTerm && (
          <motion.div
            className="mb-8 flex flex-col sm:flex-row items-center justify-between"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center mb-4 sm:mb-0">
              <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-3 py-1 rounded-full mr-3">
                {filteredBlogs.length}
              </span>
              <p className="text-gray-700">
                Found {filteredBlogs.length === 1 ? 'result' : 'results'} for "
                <span className="font-medium">{searchTerm}</span>"
              </p>
            </div>
            {filteredBlogs.length > 0 && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center group"
              >
                Clear search
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-1 group-hover:ml-2 transition-all"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </motion.div>
        )}

        {/* Enhanced Blog Grid with Improved Cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {!loading &&
            currentBlogs.map((blog) => (
              <motion.div
                key={blog.BlogId}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 h-full flex flex-col hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                variants={itemVariants}
              >
                {/* Blog Image with enhanced hover effect */}
                <div className="relative h-56 overflow-hidden group">
                  <Link
                    to={`/blog/${generateBlogSlug(blog)}`}
                    className="block h-full"
                  >
                    {blog.PictureUrl ? (
                      <img
                        src={blog.PictureUrl}
                        alt={blog.Title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-emerald-50 to-teal-50 flex items-center justify-center text-emerald-300">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-12 w-12"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                    {/* Enhanced overlay gradient with content peek on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end">
                      <div className="p-4 w-full transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="text-white font-medium text-lg line-clamp-1">
                          {blog.Title}
                        </h3>
                        <p className="text-white/80 text-xs line-clamp-1 mt-1">
                          {truncateText(blog.Content, 60)}
                        </p>
                      </div>
                    </div>
                  </Link>

                  {/* Enhanced Category Badge with Blur Effect */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="bg-white/90 backdrop-blur-sm text-emerald-700 text-xs font-medium px-3 py-1.5 rounded-full shadow-sm border border-white/40">
                      Skincare
                    </span>
                  </div>

                  {/* Redesigned Reading Time Badge */}
                  <div className="absolute bottom-4 right-4 z-10">
                    <span className="bg-black/70 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-sm flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3.5 w-3.5 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {getReadingTime(blog.Content)}
                    </span>
                  </div>
                </div>

                {/* Blog Content with Enhanced Styling */}
                <div className="p-6 flex-grow flex flex-col">
                  {/* Date with icon */}
                  <div className="flex items-center text-xs text-gray-500 mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1.5 text-emerald-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <time dateTime={blog.UploadDate || blog.CreateDate}>
                      {formatDateOnly(blog.UploadDate || blog.CreateDate)}
                    </time>
                  </div>

                  {/* Title with link - Enhanced hover */}
                  <Link
                    to={`/blog/${generateBlogSlug(blog)}`}
                    className="group"
                  >
                    <h2 className="text-xl font-semibold mb-3 line-clamp-2 text-gray-800 group-hover:text-emerald-600 transition-colors">
                      {blog.Title !== 'string' ? blog.Title : 'Untitled Blog'}
                    </h2>
                  </Link>

                  {/* Excerpt with Better Typography */}
                  <p className="text-gray-600 mb-5 flex-grow line-clamp-3 text-sm leading-relaxed">
                    {blog.Content !== 'string'
                      ? truncateText(blog.Content, 150)
                      : 'No content available'}
                  </p>

                  {/* Bottom section with Enhanced Read More Button */}
                  <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-100">
                    <Link
                      to={`/blog/${generateBlogSlug(blog)}`}
                      className="group inline-flex items-center justify-center text-emerald-600 font-medium hover:text-emerald-700 transition-colors"
                      aria-label={`Read more about ${blog.Title}`}
                    >
                      Read article
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 ml-1 transform transition-transform duration-300 group-hover:translate-x-1.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </Link>

                    {/* Time display with enhanced icon */}
                    <span className="text-xs text-gray-500 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3.5 w-3.5 mr-1 text-emerald-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {formatTimeOnly(blog.UploadDate || blog.CreateDate)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
        </motion.div>

        {/* No blogs found message with Enhanced UI */}
        {!loading && filteredBlogs.length === 0 && !errorMessage && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-gradient-to-b from-gray-50 to-white rounded-xl p-8 max-w-lg mx-auto shadow-sm border border-gray-100">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-gray-800 text-xl font-bold mb-2">
                {searchTerm ? 'No Matches Found' : 'No Blog Posts Available'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm
                  ? `We couldn't find any articles matching "${searchTerm}"`
                  : 'There are no blog posts available at the moment.'}
              </p>
              {searchTerm && (
                <div className="flex flex-col items-center">
                  <p className="text-gray-500 text-sm mb-4">
                    Try using different keywords or check back later for new
                    content.
                  </p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full hover:bg-emerald-200 transition-colors font-medium text-sm"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Clear search
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Enhanced Pagination with Page Numbers */}
        {!loading && filteredBlogs.length > blogsPerPage && (
          <div className="flex justify-center mt-16">
            <nav
              className="inline-flex items-center rounded-xl shadow-sm overflow-hidden"
              aria-label="Pagination"
            >
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2.5 border ${
                  currentPage === 1
                    ? 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                } transition-colors duration-200`}
              >
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {/* Page Numbers - Added number display */}
              {[...Array(totalPages)].map((_, index) => {
                const pageNum = index + 1;
                // Only show current page, first, last, and 1 page before/after current
                const showPageNum =
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  Math.abs(currentPage - pageNum) <= 1;

                if (!showPageNum && pageNum === 2 && currentPage > 3) {
                  // Show ellipsis for skipped pages at the beginning
                  return (
                    <span
                      key={`ellipsis-start`}
                      className="relative inline-flex items-center px-4 py-2.5 border border-gray-200 bg-white text-gray-700"
                    >
                      ...
                    </span>
                  );
                }

                if (
                  !showPageNum &&
                  pageNum === totalPages - 1 &&
                  currentPage < totalPages - 2
                ) {
                  // Show ellipsis for skipped pages at the end
                  return (
                    <span
                      key={`ellipsis-end`}
                      className="relative inline-flex items-center px-4 py-2.5 border border-gray-200 bg-white text-gray-700"
                    >
                      ...
                    </span>
                  );
                }

                if (!showPageNum) return null;

                return (
                  <button
                    key={pageNum}
                    onClick={() => paginate(pageNum)}
                    className={`relative inline-flex items-center px-4 py-2.5 border ${
                      currentPage === pageNum
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 z-10 font-medium'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-emerald-50 hover:text-emerald-600'
                    } transition-colors duration-200`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-4 py-2.5 border ${
                  currentPage === totalPages
                    ? 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                } transition-colors duration-200`}
              >
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </nav>
          </div>
        )}
      </div>

      <Footer />

      {/* Add this CSS to your global styles or in a style tag */}
      <style jsx="true" global="true">{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </>
  );
}

export default BlogPage;
