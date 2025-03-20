import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

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
        const response = await fetch(
          'http://careskinbeauty.shop:4456/api/BlogNews'
        );
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

  // Add these two functions near your other formatting functions

  // Function to format just the date part
  const formatDateOnly = (dateString) => {
    if (!dateString || dateString === 'string') return 'No date';

    try {
      // Handle the new format "MM/DD/YYYY hh:mm:ss AM/PM"
      if (dateString.includes('/')) {
        const datePart = dateString.split(' ')[0]; // MM/DD/YYYY
        const [month, day, year] = datePart.split('/');
        const date = new Date(`${year}-${month}-${day}`);

        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }
      // Handle ISO date format
      else {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }
    } catch (error) {
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
      {/* Hero section with background image */}
      <motion.div
        className="relative w-full bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 py-24 md:py-32"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 bg-pattern opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/30"></div>

        <motion.div
          className="relative flex flex-col items-center text-center py-8 px-6 max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-4 py-1.5 rounded-full mb-5 shadow-sm">
            Our Skincare Journal
          </span>
          <h1 className="font-bold leading-tight mb-6 text-4xl md:text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 to-teal-600">
            Skincare Blog & News
          </h1>
          <p className="text-sm md:text-base lg:text-lg text-gray-600 mb-8 max-w-2xl">
            Stay up to date with the latest trends, tips, and insights for
            healthier, happier skin. Discover expert advice and beauty secrets.
          </p>

          {/* Enhanced Search bar */}
          <div className="w-full max-w-md mt-4">
            <div className="relative flex items-center w-full group">
              <input
                type="text"
                className="w-full px-5 py-3.5 pl-12 pr-12 text-center rounded-full border border-gray-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm transition-all duration-300 group-hover:shadow-md"
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
          </div>
        </motion.div>
      </motion.div>

      {/* Blog Cards Container */}
      <div className="container mx-auto px-4 py-12 mb-16">
        {/* Enhanced Loading State */}
        {loading && (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="w-16 h-16 relative">
              <div className="absolute inset-0 rounded-full border-t-4 border-emerald-400 animate-spin"></div>
              <div className="absolute inset-1 rounded-full border-2 border-emerald-100"></div>
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

        {/* Error Message */}
        {errorMessage && !loading && (
          <div className="text-center bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mx-auto mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {errorMessage}
          </div>
        )}

        {/* Search Results Count */}
        {!loading && searchTerm && (
          <div className="mb-6 text-gray-600">
            Found {filteredBlogs.length}{' '}
            {filteredBlogs.length === 1 ? 'result' : 'results'} for "
            {searchTerm}"
          </div>
        )}

        {/* Blog List */}
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
                  <Link to={`/blog/${blog.BlogId}`}>
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
                    {/* Enhanced overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>

                  {/* Enhanced Category Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="bg-white/90 backdrop-blur-sm text-emerald-700 text-xs font-medium px-3 py-1.5 rounded-full shadow-sm">
                      Skincare
                    </span>
                  </div>

                  {/* Add reading time badge to the image area */}
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

                {/* Blog Content */}
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

                  {/* Title with link */}
                  <Link to={`/blog/${blog.BlogId}`}>
                    <h2 className="text-xl font-semibold mb-3 line-clamp-2 text-gray-800 hover:text-emerald-600 transition-colors">
                      {blog.Title !== 'string' ? blog.Title : 'Untitled Blog'}
                    </h2>
                  </Link>

                  {/* Excerpt */}
                  <p className="text-gray-600 mb-5 flex-grow line-clamp-3 text-sm">
                    {blog.Content !== 'string'
                      ? truncateText(blog.Content, 150)
                      : 'No content available'}
                  </p>

                  {/* Bottom section with Read More link and time */}
                  <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-100">
                    <Link
                      to={`/blog/${blog.BlogId}`}
                      className="group inline-flex items-center justify-center text-emerald-600 font-medium hover:text-emerald-700 transition-colors"
                    >
                      Read More
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 ml-1 group-hover:translate-x-1.5 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </Link>

                    {/* Time display with icon */}
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

        {/* No blogs found message */}
        {!loading && filteredBlogs.length === 0 && !errorMessage && (
          <div className="text-center py-16">
            <div className="bg-gray-50 rounded-xl p-8 max-w-lg mx-auto">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto text-gray-400 mb-4"
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
              <p className="text-gray-600 text-lg mb-2">
                {searchTerm
                  ? `No results found for "${searchTerm}"`
                  : 'No blog posts available at the moment.'}
              </p>
              {searchTerm && (
                <p className="text-gray-500 text-sm mb-4">
                  Try using different keywords or check back later for new
                  content.
                </p>
              )}
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Clear search
                </button>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Pagination */}
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
                }`}
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

              {/* Pagination numbers - keep your existing code here */}

              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-4 py-2.5 border ${
                  currentPage === totalPages
                    ? 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                }`}
              >
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </nav>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}

export default BlogPage;
