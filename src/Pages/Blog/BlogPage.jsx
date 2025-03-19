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
        // Sort blogs in descending order by BlogId
        const sortedBlogs = data.sort((a, b) => b.BlogId - a.BlogId);
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

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString || dateString === 'string') return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      <Navbar />
      {/* Hero section with background image */}
      <motion.div
        className="relative w-full bg-gradient-to-r from-emerald-50 to-teal-50 py-20 md:py-32"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 bg-opacity-50 bg-pattern"></div>

        <motion.div
          className="relative flex flex-col items-center text-center py-8 px-6 max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-3 py-1 rounded-full mb-4">
            Our Skincare Journal
          </span>
          <h1 className="font-bold leading-tight mb-4 text-4xl md:text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 to-teal-600">
            Skincare Blog & News
          </h1>
          <p className="text-sm md:text-base lg:text-lg text-gray-600 mb-6 max-w-2xl">
            Stay up to date with the latest trends, tips, and insights for
            healthier, happier skin. Discover expert advice and beauty secrets.
          </p>

          {/* Search bar */}
          <div className="w-full max-w-md mt-4">
            <div className="relative flex items-center w-full">
              <input
                type="text"
                className="w-full px-4 py-3 pl-10 pr-12 text-center rounded-full border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
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
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
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
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
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
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 h-full flex flex-col hover:shadow-xl transition-shadow duration-300"
                variants={itemVariants}
              >
                {/* Blog Image */}
                <div className="relative h-56 overflow-hidden">
                  {blog.PictureUrl ? (
                    <img
                      src={blog.PictureUrl}
                      alt={blog.Title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center text-gray-400">
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
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-white bg-opacity-90 text-emerald-700 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
                      Skincare
                    </span>
                  </div>
                </div>

                {/* Blog Content */}
                <div className="p-6 flex-grow flex flex-col">
                  {/* Date */}
                  <p className="text-xs text-gray-500 mb-2">
                    {formatDate(blog.DatePosted) || 'No date available'}
                  </p>

                  <h2 className="text-xl font-semibold mb-3 line-clamp-2 text-gray-800 hover:text-emerald-600 transition-colors">
                    {blog.Title !== 'string' ? blog.Title : 'Untitled Blog'}
                  </h2>

                  <p className="text-gray-600 mb-4 flex-grow line-clamp-3">
                    {blog.Content !== 'string'
                      ? truncateText(blog.Content, 150)
                      : 'No content available'}
                  </p>

                  <Link
                    to={`/blog/${blog.BlogId}`}
                    className="mt-auto group inline-flex items-center justify-center text-emerald-600 font-medium hover:text-emerald-700 transition-colors"
                  >
                    Read More
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform"
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
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

        {/* Pagination */}
        {!loading && filteredBlogs.length > blogsPerPage && (
          <div className="flex justify-center mt-12">
            <nav
              className="inline-flex items-center rounded-lg shadow-sm"
              aria-label="Pagination"
            >
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 rounded-l-lg border ${
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

              {totalPages <= 5 ? (
                // Show all page numbers if 5 or fewer pages
                Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (number) => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`relative inline-flex items-center px-4 py-2 border ${
                        currentPage === number
                          ? 'z-10 bg-emerald-50 border-emerald-200 text-emerald-600 font-medium'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                      }`}
                    >
                      {number}
                    </button>
                  )
                )
              ) : (
                // Show limited page numbers with ellipsis for many pages
                <>
                  {/* Always show first page */}
                  <button
                    onClick={() => paginate(1)}
                    className={`relative inline-flex items-center px-4 py-2 border ${
                      currentPage === 1
                        ? 'z-10 bg-emerald-50 border-emerald-200 text-emerald-600 font-medium'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                    }`}
                  >
                    1
                  </button>

                  {/* Show ellipsis if not near the beginning */}
                  {currentPage > 3 && (
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-200 bg-white text-gray-600">
                      ...
                    </span>
                  )}

                  {/* Show current page and neighbors */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (number) =>
                        number !== 1 &&
                        number !== totalPages &&
                        Math.abs(currentPage - number) <= 1
                    )
                    .map((number) => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`relative inline-flex items-center px-4 py-2 border ${
                          currentPage === number
                            ? 'z-10 bg-emerald-50 border-emerald-200 text-emerald-600 font-medium'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                        }`}
                      >
                        {number}
                      </button>
                    ))}

                  {/* Show ellipsis if not near the end */}
                  {currentPage < totalPages - 2 && (
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-200 bg-white text-gray-600">
                      ...
                    </span>
                  )}

                  {/* Always show last page */}
                  <button
                    onClick={() => paginate(totalPages)}
                    className={`relative inline-flex items-center px-4 py-2 border ${
                      currentPage === totalPages
                        ? 'z-10 bg-emerald-50 border-emerald-200 text-emerald-600 font-medium'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                    }`}
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-4 py-2 rounded-r-lg border ${
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
