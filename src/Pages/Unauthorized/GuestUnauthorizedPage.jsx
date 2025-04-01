import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const GuestUnauthorizedPage = ({
  pageName = 'this page',
  redirectPath = '/login',
  returnUrl = '/',
  message = 'Please log in to access this feature',
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(10);

  // Store the full path including query parameters
  const currentPath = location.pathname + location.search;

  // Use the provided returnUrl or fallback to current path if not specified
  const effectiveReturnUrl = returnUrl === '/' ? currentPath : returnUrl;

  // Auto-redirect countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Navigate to login with state containing the return URL
          navigate(redirectPath, {
            state: {
              from: effectiveReturnUrl.startsWith('/')
                ? effectiveReturnUrl.substring(1)
                : effectiveReturnUrl,
              message: message,
              isRedirect: true,
            },
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, redirectPath, effectiveReturnUrl, message]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-emerald-50 to-teal-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full text-center"
      >
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-amber-600"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <h2 className="text-3xl font-bold text-amber-600 mb-2">
          Login Required
        </h2>
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Members Only Feature
        </h3>

        <p className="text-gray-600 mb-6">
          You need to be logged in to access {pageName}. Create an account or
          log in to access your personalized skin recommendations.
        </p>

        <div className="flex flex-col space-y-3 mb-6">
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-emerald-500 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 10 }}
            />
          </div>
          <p className="text-sm text-gray-500">
            Redirecting to login page in {countdown} seconds
          </p>
        </div>

        <div className="flex flex-col space-y-3">
          <Link
            to={redirectPath}
            state={{
              from: effectiveReturnUrl.startsWith('/')
                ? effectiveReturnUrl.substring(1)
                : effectiveReturnUrl,
              message: message,
              isRedirect: true,
            }}
            className="px-4 py-3 text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all duration-200 text-center font-medium flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
            Login / Register
          </Link>

          <Link
            to="/"
            className="px-4 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all duration-200 text-center font-medium flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Back to Home
          </Link>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="mt-8 text-center text-gray-500 text-sm"
      >
        © {new Date().getFullYear()} CareSkin Beauty. All rights reserved.
      </motion.div>
    </div>
  );
};

export default GuestUnauthorizedPage;
