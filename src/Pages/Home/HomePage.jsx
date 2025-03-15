import React from 'react';
import Navbar from '../../components/Layout/Navbar';
import Footer from '../../components/Layout/Footer';
import SloganCarousel from '../../components/HomePage/Carousel/SloganCarousel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import BestSellers from '../../components/HomePage/BestSellers';
import NewArrivals from '../../components/HomePage/NewArrivals';
import IconSlider from '../../components/HomePage/Carousel/IconSlider';
import ServiceFeedback from '../../components/HomePage/ServiceFeedback';
import { motion } from 'framer-motion';
import {
  faDroplet,
  faSun,
  faJar,
  faFlask,
  faLeaf,
  faShieldAlt,
  faUserMd,
  faGem,
  faUserFriends,
  faShippingFast,
  faRecycle,
  faHeadset,
} from '@fortawesome/free-solid-svg-icons';

function HomePage() {
  // Featured articles data
  const blogPosts = [
    {
      id: 1,
      title: 'The Science Behind Hyaluronic Acid',
      excerpt:
        'Discover why this powerful ingredient is essential for maintaining skin hydration and elasticity.',
      image:
        'https://paulaschoice.vn/wp-content/uploads/2019/08/hyaluronic-acid-la-gi-cong-dung-cua-hyaluronic-acid.jpg',
      date: 'March 8, 2025',
      readTime: '5 min read',
    },
    {
      id: 2,
      title: 'Building Your Morning Skincare Routine',
      excerpt:
        'Step-by-step guide to creating an effective morning routine for glowing skin all day.',
      image:
        'https://www.behappier.com/cdn/shop/articles/Blog_1_1.jpg?v=1662199193&width=1100',
      date: 'March 1, 2025',
      readTime: '7 min read',
    },
    {
      id: 3,
      title: 'How to Choose the Right Sunscreen',
      excerpt:
        'Understanding SPF, broad-spectrum protection, and finding the perfect formula for your skin type.',
      image:
        'https://www.canada.ca/content/dam/hc-sc/images/services/publications/drugs-health-products/sunscreen-tips-poster/poster-sun_screen_tips-eng.jpg',
      date: 'February 22, 2025',
      readTime: '6 min read',
    },
  ];

  // Skin concern data
  const skinConcerns = [
    {
      id: 1,
      title: 'Acne & Breakouts',
      image: '/images/concerns/acne.jpg',
      products: 24,
    },
    {
      id: 2,
      title: 'Aging & Fine Lines',
      image: '/images/concerns/aging.jpg',
      products: 31,
    },
    {
      id: 3,
      title: 'Dryness & Dehydration',
      image: '/images/concerns/dryness.jpg',
      products: 28,
    },
    {
      id: 4,
      title: 'Hyperpigmentation',
      image: '/images/concerns/pigmentation.jpg',
      products: 19,
    },
    {
      id: 5,
      title: 'Sensitivity & Redness',
      image: '/images/concerns/sensitivity.jpg',
      products: 22,
    },
  ];

  // Values/ethos data
  const companyValues = [
    {
      icon: faLeaf,
      title: 'Clean Ingredients',
      description:
        'Formulated without harmful ingredients and backed by scientific research',
    },
    {
      icon: faShieldAlt,
      title: 'Dermatologist Tested',
      description:
        'All products undergo rigorous testing for safety and efficacy',
    },
    {
      icon: faRecycle,
      title: 'Sustainable Packaging',
      description:
        'Eco-friendly solutions to minimize our environmental footprint',
    },
    {
      icon: faUserMd,
      title: 'Expert Formulations',
      description: 'Created by skincare scientists with decades of experience',
    },
  ];

  return (
    <>
      <Navbar />
      {/* Hero Section */}
      <motion.div
        className="relative w-full bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Background Expanding Container */}
        <div className="absolute inset-0 w-full h-full bg-white"></div>

        {/* Content Section */}
        <motion.div
          className="relative flex flex-col md:flex-row items-center text-center mt-16 md:text-left py-12 md:py-20 px-6 md:px-10 max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Left Side: Text */}
          <motion.div
            className="md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1
              className="font-bold leading-tight mb-6 text-4xl md:text-5xl lg:text-6xl"
              style={{
                textShadow: '0.13rem 0.13rem 0.3rem rgba(0, 0, 0, 0.25)',
                color: 'rgba(0, 0, 0, 1)',
              }}
            >
              Discover Your Perfect Skincare Routine
            </h1>
            <p className="text-md md:text-lg lg:text-xl text-gray-600 mb-8 max-w-lg">
              Take our personalized skin quiz and get a customized skincare
              routine that works for your unique needs. Say goodbye to guesswork
              and hello to results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.a
                href="/skinquiz"
                className="px-8 py-4 bg-emerald-600 text-white rounded-full shadow-md hover:bg-emerald-700 transition text-lg font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Take Skin Quiz
              </motion.a>
              <motion.a
                href="/shop"
                className="px-8 py-4 border-2 border-emerald-600 text-emerald-600 rounded-full shadow-sm hover:bg-emerald-50 transition text-lg font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Shop Products
              </motion.a>
            </div>
            <div className="mt-8 flex items-center">
              <div className="flex -space-x-2">
                <img
                  src="https://media-cdn-v2.laodong.vn/storage/newsportal/2024/3/19/1317075/Kim-Ji-Won-6.jpg"
                  alt="Customer"
                  className="w-14 h-14 rounded-full border-2 border-white object-cover"
                />
                <img
                  src="https://cdn.tuoitre.vn/thumb_w/640/471584752817336320/2023/2/16/20210903165700624111jpeg-16765450383411414552189.jpg"
                  alt="Customer"
                  className="w-14 h-14 rounded-full border-2 border-white object-cover"
                />
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Tr%E1%BA%A5n_Th%C3%A0nh_191226.png/800px-Tr%E1%BA%A5n_Th%C3%A0nh_191226.png"
                  alt="Customer"
                  className="w-14 h-14 rounded-full border-2 border-white object-cover"
                />
              </div>
              <p className="ml-4 text-sm text-gray-600">
                Join over <span className="font-bold">50,000</span> customers
                who love our products
              </p>
            </div>
          </motion.div>
          {/* Right Side: Image */}
          <motion.div
            className="w-full md:w-1/2 flex justify-center mt-10 md:mt-0"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <SloganCarousel />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Icon Slider */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <IconSlider />
      </motion.div>

      {/* Our Mission Statement */}
      <motion.div
        className="py-20 px-6 max-w-4xl mx-auto text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
          Our Mission
        </h2>
        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
          We believe that effective skincare should be accessible to everyone.
          Our mission is to demystify skincare by providing science-backed
          formulations, personalized recommendations, and honest education — all
          at prices that make sense.
        </p>
        <motion.a
          href="/about"
          className="inline-block px-6 py-3 text-emerald-600 font-medium border-b-2 border-emerald-600 hover:text-emerald-700 hover:border-emerald-700 transition"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Learn More About Our Story →
        </motion.a>
      </motion.div>

      {/* Best Sellers Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="mb-20"
      >
        <BestSellers />
      </motion.div>

      {/* Company Values */}
      <motion.div
        className="py-16 bg-white mx-auto max-w-7xl px-5"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
          Our Commitment to You
        </h2>
        <p className="text-center text-gray-600 max-w-3xl mx-auto mb-12">
          We're more than just skincare. We're dedicated to building products
          with principles that matter.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {companyValues.map((value, index) => (
            <motion.div
              key={index}
              className="bg-gray-50 p-6 rounded-xl"
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="bg-emerald-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <FontAwesomeIcon
                  icon={value.icon}
                  className="text-emerald-600 text-2xl"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
              <p className="text-gray-600">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Shop by Category Section */}
      <motion.div
        className="py-16 bg-gray-50 rounded-xl mx-auto max-w-screen-2xl px-5 mt-10 mb-20"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
          Shop by Category
        </h2>
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
          Find the perfect products for every step in your skincare routine.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-7xl mx-auto justify-items-center">
          {[
            {
              icon: faDroplet,
              title: 'Cleansers',
              description: 'Start with a clean slate',
              products: 18,
            },
            {
              icon: faFlask,
              title: 'Serums',
              description: 'Target specific concerns',
              products: 24,
            },
            {
              icon: faJar,
              title: 'Moisturizers',
              description: 'Lock in hydration',
              products: 16,
            },
            {
              icon: faSun,
              title: 'Sunscreen',
              description: 'Daily protection',
              products: 12,
            },
          ].map((category, index) => (
            <motion.a
              href={`/category/${category.title.toLowerCase()}`}
              key={index}
              className="flex flex-col items-center justify-center bg-white p-6 rounded-lg shadow-sm hover:shadow-lg transition w-full cursor-pointer"
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <span className="p-5 bg-emerald-100 rounded-full flex items-center justify-center w-20 h-20">
                <FontAwesomeIcon
                  icon={category.icon}
                  className="text-emerald-600 text-3xl"
                />
              </span>
              <h3 className="text-xl font-semibold text-center mt-4">
                {category.title}
              </h3>
              <p className="text-gray-600 font-light text-sm text-center mt-2 mb-4">
                {category.description}
              </p>
              <span className="text-xs text-gray-500">
                {category.products} products
              </span>
            </motion.a>
          ))}
        </div>
        <div className="text-center mt-12">
          <motion.a
            href="/shop"
            className="inline-block px-8 py-3 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View All Categories
          </motion.a>
        </div>
      </motion.div>

      {/* New Arrivals */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <NewArrivals />
      </motion.div>

      {/* Shop by Skin Concern */}
      <motion.div
        className="py-16 bg-white mx-auto max-w-7xl px-5 mt-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
          Shop by Skin Concern
        </h2>
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
          Target your specific needs with products designed to address your
          unique skin concerns.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {skinConcerns.map((concern) => (
            <motion.a
              key={concern.id}
              href={`/concerns/${concern.title.toLowerCase().replace(/\s+/g, '-')}`}
              className="group block relative rounded-lg overflow-hidden shadow-sm hover:shadow-md transition"
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="aspect-w-1 aspect-h-1 w-full">
                <img
                  src={concern.image || `/api/placeholder/300/300`}
                  alt={concern.title}
                  className="w-full h-64 object-cover group-hover:scale-105 transition duration-300"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                <div>
                  <h3 className="text-white font-medium text-lg">
                    {concern.title}
                  </h3>
                  <p className="text-white/80 text-sm">
                    {concern.products} products
                  </p>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
        <div className="text-center mt-12">
          <motion.a
            href="/skin-concerns"
            className="inline-block px-8 py-3 border-2 border-emerald-600 text-emerald-600 rounded-full hover:bg-emerald-50 transition font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View All Skin Concerns
          </motion.a>
        </div>
      </motion.div>

      {/* Why Choose Us */}
      <motion.div
        className="py-16 bg-emerald-50 mt-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        <div className="max-w-7xl mx-auto px-5">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Us
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: faGem,
                title: 'Premium Quality',
                description:
                  'Formulated with the highest quality ingredients for optimal results',
              },
              {
                icon: faUserFriends,
                title: 'Expert Advice',
                description:
                  'Access to skincare experts who can answer your questions',
              },
              {
                icon: faShippingFast,
                title: 'Fast Shipping',
                description:
                  'Free shipping on orders over $50 with delivery in 2-5 business days',
              },
              {
                icon: faHeadset,
                title: '24/7 Support',
                description:
                  'Our customer support team is available around the clock',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="flex flex-col items-center text-center p-6"
                whileHover={{ y: -5 }}
              >
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <FontAwesomeIcon
                    icon={feature.icon}
                    className="text-emerald-600 text-2xl"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Featured Blog Posts */}
      <motion.div
        className="py-16 bg-white max-w-7xl mx-auto px-5 mt-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              Skincare Journal
            </h2>
            <p className="text-gray-600 mt-2">
              Expert advice, tips, and education for your skin health journey
            </p>
          </div>
          <motion.a
            href="/blog"
            className="mt-4 sm:mt-0 text-emerald-600 font-medium hover:text-emerald-700 transition"
            whileHover={{ x: 5 }}
          >
            View all articles →
          </motion.a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <motion.a
              key={post.id}
              href={`/blog/${post.id}`}
              className="group block rounded-lg overflow-hidden shadow-sm hover:shadow-md transition"
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={post.image || `/api/placeholder/400/250`}
                  alt={post.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <span>{post.date}</span>
                  <span className="mx-2">•</span>
                  <span>{post.readTime}</span>
                </div>
                <h3 className="font-semibold text-xl mb-2 group-hover:text-emerald-600 transition">
                  {post.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2">
                  {post.excerpt}
                </p>
                <p className="mt-4 text-emerald-600 font-medium text-sm group-hover:translate-x-2 transition-transform">
                  Read more →
                </p>
              </div>
            </motion.a>
          ))}
        </div>
      </motion.div>

      {/* Not Sure Where to Start Section */}
      <motion.div
        className="bg-emerald-100 py-16 px-6 text-center rounded-xl shadow-md mx-auto max-w-6xl mt-16 mb-16"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Not Sure Where to Start?
        </h2>
        <p className="text-gray-600 text-lg mb-8 max-w-3xl mx-auto">
          Take our 2-minute skin quiz to get personalized product
          recommendations based on your skin type, concerns, and goals. Our
          algorithm analyzes your unique needs and matches you with products
          that will work for you.
        </p>
        <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-6">
          <motion.a
            href="/skinquiz"
            className="px-8 py-4 bg-emerald-600 text-white rounded-full shadow-md hover:bg-emerald-700 transition text-lg font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Quiz Now
          </motion.a>
          <motion.a
            href="/consultation"
            className="px-8 py-4 bg-white border-2 border-emerald-600 text-emerald-600 rounded-full shadow-md hover:bg-emerald-50 transition text-lg font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Book Free Consultation
          </motion.a>
        </div>
      </motion.div>

      {/* Instagram Feed */}
      <motion.div
        className="py-16 bg-white max-w-7xl mx-auto px-5"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-3xl font-bold text-center mb-3">
          Follow Us on Instagram
        </h2>
        <p className="text-gray-600 text-center mb-8">@yourskincarebrand</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <motion.a
              key={item}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block aspect-square overflow-hidden rounded-lg"
              whileHover={{ scale: 1.05 }}
            >
              <img
                src={`/api/placeholder/200/200`}
                alt="Instagram post"
                className="w-full h-full object-cover hover:scale-110 transition duration-300"
              />
            </motion.a>
          ))}
        </div>
      </motion.div>

      {/* Newsletter */}
      <motion.div
        className="bg-gray-100 py-16 mt-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Newsletter</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Subscribe for exclusive offers, skincare tips, and early access to
            new product launches. Get 15% off your first order!
          </p>
          <form className="flex w-full max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="px-4 py-3 w-full border border-gray-300 rounded-l-full focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent"
              required
            />
            <motion.button
              type="submit"
              className="px-6 py-3 bg-emerald-600 text-white rounded-r-full hover:bg-emerald-700 transition font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Subscribe
            </motion.button>
          </form>

          <p className="text-gray-500 text-xs mt-4">
            By subscribing, you agree to our Privacy Policy and consent to
            receive updates from our company.
          </p>
        </div>
      </motion.div>

      {/* ServiceFeedback - Customer Testimonials */}
      <ServiceFeedback />

      {/* Footer */}
      <Footer />
    </>
  );
}

export default HomePage;
