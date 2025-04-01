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
  ThumbsUp,
  ThumbsDown,
  Filter,
  X,
  MessageCircle,
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
  const [helpfulFeedback, setHelpfulFeedback] = useState({});
  const [showMobileFilter, setShowMobileFilter] = useState(false);

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

  const handleFeedback = (id, isHelpful) => {
    setHelpfulFeedback({
      ...helpfulFeedback,
      [id]: isHelpful,
    });

    // Here you could also send feedback to your backend
    // sendFeedback(id, isHelpful);
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

  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Count FAQs in each category
  const categoryCounts = useMemo(() => {
    const counts = { all: faqs.length };

    categories.forEach((category) => {
      if (category.id !== 'all') {
        counts[category.id] = faqs.filter(
          (faq) => faq.category === category.id
        ).length;
      }
    });

    return counts;
  }, [faqs, categories]);

  return (
    <>
      <Navbar />
      <div className="bg-gradient-to-b from-purple-50 to-white min-h-screen mt-16">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-700 to-violet-800 text-white py-16 md:py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/patterns/dots.svg')] opacity-10"></div>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUpVariants}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <motion.h1
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-purple-100"
              >
                How Can We Help You?
              </motion.h1>
              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="text-xl text-purple-100 max-w-3xl mx-auto font-light"
              >
                Find answers to the most common questions about our products and
                services
              </motion.p>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="mt-10 max-w-2xl mx-auto"
              >
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full blur-sm group-hover:blur-md opacity-70 transition-all duration-300 -z-10 scale-[1.02] group-hover:scale-105"></div>
                  <input
                    type="text"
                    placeholder="Search for answers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full py-3 px-5 rounded-full bg-white/95 text-gray-800 placeholder-gray-500 shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-300 text-lg"
                  />
                  <div className="absolute right-5 top-1/2 transform -translate-y-1/2 text-purple-500">
                    <Search className="h-5 w-5" />
                  </div>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-14 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-purple-200 text-sm mt-3"
                >
                  Try searching for "shipping", "products", or "payment methods"
                </motion.p>
              </motion.div>
            </motion.div>
          </div>

          {/* Decorative circles */}
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-purple-600 opacity-20 blur-3xl"></div>
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-indigo-500 opacity-20 blur-3xl"></div>
        </div>

        <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {/* Mobile Category Filter Button */}
          <div className="md:hidden mb-6">
            <button
              onClick={() => setShowMobileFilter(!showMobileFilter)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-lg shadow text-purple-700 border border-purple-100"
            >
              <span className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Filter by category
              </span>
              <span className="bg-purple-100 px-2 py-1 rounded-full text-xs font-medium">
                {categories.find((c) => c.id === activeCategory)?.name}
              </span>
            </button>
          </div>

          {/* Mobile Filter Dropdown */}
          <AnimatePresence>
            {showMobileFilter && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="md:hidden mb-6 bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-4 space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setActiveCategory(category.id);
                        setShowMobileFilter(false);
                      }}
                      className={`flex items-center justify-between w-full p-3 rounded-lg transition-all ${
                        activeCategory === category.id
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="flex items-center">
                        <span className="mr-3">{category.icon}</span>
                        <span>{category.name}</span>
                      </span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                        {categoryCounts[category.id] || 0}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Desktop Category Tabs */}
          <div className="hidden md:block mb-10 overflow-x-auto">
            <div className="flex space-x-3 min-w-max">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center px-5 py-3.5 rounded-full transition-all shadow-sm ${
                    activeCategory === category.id
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-purple-50'
                  }`}
                >
                  <span className="mr-2.5">{category.icon}</span>
                  <span className="font-medium">{category.name}</span>
                  <span
                    className={`ml-2.5 text-xs px-2.5 py-1 rounded-full ${
                      activeCategory === category.id
                        ? 'bg-purple-500/70 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {categoryCounts[category.id] || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col justify-center items-center h-64">
              <div className="relative w-16 h-16">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-purple-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-purple-600 rounded-full animate-spin"></div>
              </div>
              <p className="mt-4 text-purple-600 font-medium">
                Loading FAQs...
              </p>
            </div>
          ) : filteredFAQs.length === 0 ? (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUpVariants}
              className="text-center py-16 px-4 bg-white rounded-2xl shadow-sm border border-gray-100"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-50 rounded-full mb-6">
                <HelpCircle className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                No FAQs Found
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mb-8">
                We couldn't find any FAQs matching "{searchTerm}". Try different
                keywords or browse by category.
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm inline-flex items-center"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Search
                </button>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              {filteredFAQs.map((faq, index) => (
                <motion.div
                  key={faq.FAQId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`bg-white rounded-xl shadow-sm overflow-hidden border transition-all ${
                    activeIndex === index
                      ? 'border-purple-200 shadow-md ring-1 ring-purple-100'
                      : 'border-gray-100 hover:border-purple-100'
                  }`}
                  style={{
                    height: 'fit-content',
                    alignSelf: 'flex-start',
                  }}
                >
                  <button
                    className={`w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-purple-200 focus:ring-inset group transition-colors ${
                      activeIndex === index
                        ? 'bg-purple-50/50'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => toggleFAQ(index)}
                    aria-expanded={activeIndex === index}
                  >
                    <span
                      className={`text-lg font-medium pr-3 transition-colors ${
                        activeIndex === index
                          ? 'text-purple-700'
                          : 'text-gray-900 group-hover:text-purple-600'
                      }`}
                    >
                      {faq.Question}
                    </span>
                    <div
                      className={`p-2 rounded-full transition-all flex-shrink-0 transform ${
                        activeIndex === index
                          ? 'bg-purple-100 rotate-0'
                          : 'bg-gray-100 group-hover:bg-purple-50'
                      }`}
                    >
                      {activeIndex === index ? (
                        <ChevronUp className="h-5 w-5 text-purple-600 transition-all" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500 group-hover:text-purple-600 transition-all" />
                      )}
                    </div>
                  </button>

                  {/* Answer accordion with improved animation */}
                  <AnimatePresence>
                    {activeIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                          height: 'auto',
                          opacity: 1,
                          transition: {
                            height: { duration: 0.3 },
                            opacity: { duration: 0.25, delay: 0.05 },
                          },
                        }}
                        exit={{
                          height: 0,
                          opacity: 0,
                          transition: {
                            height: { duration: 0.3 },
                            opacity: { duration: 0.15 },
                          },
                        }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 py-5 border-t border-purple-100 bg-gradient-to-br from-purple-50/80 to-white">
                          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                            {faq.Answer}
                          </div>

                          {/* Feedback buttons remain the same */}
                          <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <p className="text-sm text-gray-500">
                              Was this answer helpful?
                            </p>
                            <div className="flex space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFeedback(faq.FAQId, true);
                                }}
                                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm transition-all ${
                                  helpfulFeedback[faq.FAQId] === true
                                    ? 'bg-green-100 text-green-700 ring-1 ring-green-200'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                <ThumbsUp className="h-3.5 w-3.5 mr-1.5" />
                                Yes
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFeedback(faq.FAQId, false);
                                }}
                                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm transition-all ${
                                  helpfulFeedback[faq.FAQId] === false
                                    ? 'bg-red-100 text-red-700 ring-1 ring-red-200'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                <ThumbsDown className="h-3.5 w-3.5 mr-1.5" />
                                No
                              </button>
                            </div>
                          </div>
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
            className="mt-16 text-center bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white overflow-hidden relative"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white opacity-5"></div>
              <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-white opacity-5"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-white opacity-5 blur-xl"></div>
            </div>

            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
              <p className="mb-8 max-w-2xl mx-auto text-lg opacity-95">
                Can't find the answer you're looking for? Our customer support
                team is here to help you.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="/contact"
                  className="inline-flex items-center px-6 py-3.5 bg-white text-purple-600 font-medium rounded-full shadow-md hover:bg-gray-100 transition-colors"
                >
                  Contact Support
                </a>
                <button
                  onClick={() => {
                    // Open the TawkTo chat widget
                    if (
                      window.Tawk_API &&
                      typeof window.Tawk_API.maximize === 'function'
                    ) {
                      window.Tawk_API.maximize();
                      console.log('Opening TawkTo chat widget');
                    } else {
                      // Fallback if TawkTo isn't loaded yet
                      console.log(
                        'TawkTo not initialized, attempting to initialize'
                      );
                      if (typeof window.CareSkin?.initTawkTo === 'function') {
                        window.CareSkin.initTawkTo();
                        // Give it a moment to load, then maximize
                        setTimeout(() => {
                          if (
                            window.Tawk_API &&
                            typeof window.Tawk_API.maximize === 'function'
                          ) {
                            window.Tawk_API.maximize();
                          }
                        }, 1000);
                      } else {
                        // Last resort fallback to the chatbot page
                        window.location.href = '/chatbot';
                      }
                    }
                  }}
                  className="inline-flex items-center px-6 py-3.5 bg-purple-700 text-white font-medium rounded-full shadow-md hover:bg-purple-800 transition-colors border border-purple-400"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Chat with Us
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default FAQPage;
