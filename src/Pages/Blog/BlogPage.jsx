import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';
import { motion } from 'framer-motion';

function BlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch(
          'http://careskinbeauty.shop:4456/api/BlogNews'
        );
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        setBlogs(data);
      } catch (error) {
        console.error('Fetch error:', error);
        setErrorMessage('Failed to load blog data. Please try again later.');
      }
    };

    fetchBlogs();
  }, []);

  return (
    <>
      <Navbar />
      {/* Hero-like section at the top (similar to HomePage style) */}
      <motion.div
        className="relative w-full bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* White background overlay (optional) */}
        <div className="absolute inset-0 w-full h-full bg-white"></div>

        {/* Main heading & intro text */}
        <motion.div
          className="relative flex flex-col items-center text-center mt-32 py-8 px-6 max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1
            className="font-bold leading-tight mb-4 text-3xl md:text-5xl lg:text-6xl"
            style={{
              textShadow: '0.13rem 0.13rem 0.3rem rgba(0, 0, 0, 0.25)',
              color: 'rgba(0, 0, 0, 1)',
            }}
          >
            Skincare Blog & News
          </h1>
          <p className="text-sm md:text-base lg:text-lg text-gray-600 mb-6">
            Stay up to date with the latest trends, tips, and insights for
            healthier, happier skin.
          </p>
        </motion.div>
      </motion.div>

      {/* Blog Cards Container */}
      <div className="container mx-auto px-4 py-8">
        {/* If there's an error, show it */}
        {errorMessage && (
          <div className="text-center text-red-600 mb-4">{errorMessage}</div>
        )}

        {/* Blog List */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {blogs.map((blog) => (
            <motion.div
              key={blog.id}
              className="bg-white rounded-lg shadow p-6"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-semibold mb-2">{blog.title}</h2>
              {blog.imageUrl && (
                <img
                  src={blog.imageUrl}
                  alt={blog.title}
                  className="w-full h-auto rounded mb-3"
                />
              )}
              <p className="text-gray-600">{blog.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <Footer />
    </>
  );
}

export default BlogPage;
