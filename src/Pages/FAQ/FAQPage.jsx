// src/Pages/FAQ/FAQPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Search,
  ShoppingBag,
  Truck,
  Clock,
  CreditCard,
  HelpCircle,
  Users,
} from 'lucide-react';
import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const FAQPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Define FAQ categories
  const categories = [
    {
      id: 'all',
      name: 'All Questions',
      icon: <HelpCircle className="h-5 w-5" />,
    },
    {
      id: 'product',
      name: 'Products',
      icon: <ShoppingBag className="h-5 w-5" />,
    },
    { id: 'shipping', name: 'Shipping', icon: <Truck className="h-5 w-5" /> },
    { id: 'orders', name: 'Orders', icon: <Clock className="h-5 w-5" /> },
    {
      id: 'payment',
      name: 'Payment',
      icon: <CreditCard className="h-5 w-5" />,
    },
    { id: 'account', name: 'Account', icon: <Users className="h-5 w-5" /> },
  ];

  // Categorize FAQs based on keywords in questions
  const categorizeFAQ = (faq) => {
    const question = faq.Question.toLowerCase();

    if (
      question.includes('product') ||
      question.includes('skin') ||
      question.includes('pores') ||
      question.includes('acne') ||
      question.includes('shelf life') ||
      question.includes('authentic') ||
      question.includes('ingredient')
    ) {
      return 'product';
    } else if (question.includes('delivery') || question.includes('shipping')) {
      return 'shipping';
    } else if (question.includes('order') || question.includes('place')) {
      return 'orders';
    } else if (question.includes('payment') || question.includes('check')) {
      return 'payment';
    } else if (question.includes('account') || question.includes('profile')) {
      return 'account';
    }

    return 'all';
  };

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/FAQ/GetAll`);
        if (!response.ok) {
          throw new Error('Failed to fetch FAQs');
        }
        const data = await response.json();

        // Add category to each FAQ
        const categorizedFaqs = data.map((faq) => ({
          ...faq,
          category: categorizeFAQ(faq),
        }));

        setFaqs(categorizedFaqs);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching FAQs:', error);
        setLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  // Filter FAQs based on search term and active category
  const filteredFAQs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesSearch =
        faq.Question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.Answer.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        activeCategory === 'all' || faq.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [faqs, searchTerm, activeCategory]);

  return (
    <>
      <Navbar />
      <div className="bg-gradient-to-b from-purple-50 to-white min-h-screen">
        {/* Hero Section */}
        <div className="bg-purple-700 text-white py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                How Can We Help You?
              </h1>
              <p className="text-xl text-purple-100 max-w-3xl mx-auto">
                Find answers to the most common questions about our products and
                services
              </p>

              {/* Search Bar */}
              <div className="mt-8 max-w-2xl mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for answers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full py-3 px-5 pr-12 rounded-full bg-white text-gray-800 placeholder-gray-500 shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <Search className="h-5 w-5 text-purple-500" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {/* Category Tabs */}
          <div className="mb-10 overflow-x-auto">
            <div className="flex space-x-2 md:space-x-4 min-w-max">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center px-4 py-2 rounded-full transition-all ${
                    activeCategory === category.id
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-purple-100'
                  }`}
                >
                  <span className="mr-2">{category.icon}</span>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mb-4"></div>
              <p className="text-purple-600 font-medium">Loading FAQs...</p>
            </div>
          ) : filteredFAQs.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="h-16 w-16 text-purple-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No FAQs Found
              </h3>
              <p className="text-gray-500">
                We couldn't find any FAQs matching your search. Try different
                keywords or browse by category.
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {filteredFAQs.map((faq, index) => (
                <motion.div
                  key={faq.FAQId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
                >
                  <button
                    className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none group"
                    onClick={() => toggleFAQ(index)}
                    aria-expanded={activeIndex === index}
                  >
                    <span className="text-lg font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                      {faq.Question}
                    </span>
                    <div
                      className={`p-1 rounded-full transition-colors ${
                        activeIndex === index
                          ? 'bg-purple-100'
                          : 'bg-gray-100 group-hover:bg-purple-50'
                      }`}
                    >
                      {activeIndex === index ? (
                        <ChevronUp
                          className={`h-5 w-5 ${activeIndex === index ? 'text-purple-600' : 'text-gray-500'}`}
                        />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500 group-hover:text-purple-600" />
                      )}
                    </div>
                  </button>
                  <AnimatePresence>
                    {activeIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-gray-100"
                      >
                        <div className="px-6 py-5 bg-purple-50 bg-opacity-30">
                          <p className="text-gray-700 leading-relaxed">
                            {faq.Answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}

          {/* Still Need Help Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-16 text-center bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl shadow-xl p-8 text-white"
          >
            <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
            <p className="mb-6 max-w-2xl mx-auto">
              Can't find the answer you're looking for? Please feel free to
              contact our customer support team.
            </p>
            <a
              href="/contact"
              className="inline-block px-6 py-3 bg-white text-purple-600 font-medium rounded-full shadow-md hover:bg-gray-100 transition-colors"
            >
              Contact Us
            </a>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default FAQPage;
