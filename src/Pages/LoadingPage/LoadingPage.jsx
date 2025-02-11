import React from "react";

const LoadingPage = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-lg">
      <div className="flex flex-col items-center bg-white px-6 py-5 rounded-lg shadow-lg">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-700 text-sm font-semibold">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingPage;
