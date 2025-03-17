import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const UnauthorizedPage = () => {

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600">403</h1>
          <h2 className="mt-2 text-2xl font-semibold text-gray-800">No access</h2>
          <p className="mt-4 text-gray-600">
          You do not have permission to access this page. This page is for administrators only..
          </p>
        </div>
        
        <div className="flex flex-col space-y-3 mt-6">
          <Link 
            to="/" 
            className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700 text-center"
          >
            Back to home page
          </Link>
          
          <Link 
            to="/"  
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 text-center"
          >
            Logout
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
