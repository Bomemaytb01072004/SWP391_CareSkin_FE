import React, { useEffect, useState } from 'react';

const ServiceFeedback = () => {
  const [customers, setCustomers] = useState([]);
  const [visibleFeedback, setVisibleFeedback] = useState([]);
  const [fade, setFade] = useState(true); // State for controlling the fade animation

  // Fetch data from MockAPI
  useEffect(() => {
    fetch('https://678b21431a6b89b27a299db3.mockapi.io/api/v1/ServiceFeedback') // Replace with your MockAPI endpoint
      .then((res) => res.json())
      .then((data) => {
        // Filter for ratings 3 and above
        const filteredFeedback = data.filter((item) => item.rating >= 3);
        // Shuffle and select 10 random feedbacks
        const shuffledFeedback = filteredFeedback.sort(
          () => 0.5 - Math.random()
        );
        const topTenFeedback = shuffledFeedback.slice(0, 10);
        setCustomers(topTenFeedback);
        setVisibleFeedback(topTenFeedback.slice(0, 3)); // Display the first 3 feedback initially
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  // Auto-update feedback every 5 seconds with smooth animation
  useEffect(() => {
    const interval = setInterval(() => {
      if (customers.length > 0) {
        setFade(false); // Start fade-out
        setTimeout(() => {
          const randomFeedback = [...customers].sort(() => 0.5 - Math.random());
          setVisibleFeedback(randomFeedback.slice(0, 3));
          setFade(true); // Start fade-in
        }, 500); // Wait for fade-out animation to complete
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [customers]);

  return (
    <div className="py-16 bg-gray-50 rounded-xl max-w-screen-2xl px-5 mt-8 mx-auto justify-items-center">
      <h2 className="text-3xl font-bold text-center text-black mb-16">
        Customer Stories
      </h2>
      <div
        className={`lg:h-60 max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-500 ${
          fade ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {visibleFeedback.map((customer) => (
          <div
            key={customer.id}
            className="bg-white max-h-80 p-10 rounded-lg shadow-md hover:shadow-lg transition"
          >
            <div className="flex items-center mb-4">
              <img
                src={customer.profileImage}
                alt={customer.name}
                className="w-12 h-12 rounded-full mr-4"
              />
              <div>
                <h3 className="font-bold text-lg text-gray-800">
                  {customer.name}
                </h3>
                <div className="flex items-center text-yellow-500">
                  {'★'.repeat(customer.rating)}
                </div>
              </div>
            </div>
            <p className="text-gray-600 text-sm">{customer.review}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceFeedback;
