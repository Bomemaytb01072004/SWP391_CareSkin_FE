import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './Pages/Home/HomePage';
import LoginPage from './Pages/Login/LoginPage';
import SkinQuizPage from './Pages/SkinQuiz/SkinQuizPage';
import SkinRoutinePage from './Pages/SkinQuiz/SkinRoutinePage';
import ProductsPage from './Pages/Products/ProductsPage';
import ProductDetailedPage from './Pages/ProductDetailed/ProductDetailedPage';
import CompareProduct from './Pages/CompareProductPage/CompareProductPage';
import CartPage from './Pages/Cart/CartPage';
import CheckoutPage from './Pages/Checkout/CheckoutPage';
import OrderConfirmation from './Pages/Checkout/OrderConfirmation';
import OrderConfirmationMoMo from './Pages/Checkout/OrderConfirmationMoMo';
import OrderConfirmationZalo from './Pages/Checkout/OrderConfirmationZalo';
import Admin from './Admin';
import UserProfile from './Pages/UserProfile/UserProfile';
import OrderDetails from './Pages/OrderDetails/OrderDetails';
import BlogPage from './Pages/Blog/BlogPage';
import BlogDetails from './Pages/Blog/BlogDetails';
import UnauthorizedPage from './Pages/Unauthorized/UnauthorizedPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import ResetPasswordPage from './Pages/UserProfile/ResetPasswordPage';
import AboutPage from './Pages/About/AboutPage';
import GuestUnauthorizedPage from './Pages/Unauthorized/GuestUnauthorizedPage';
import ContactPage from './Pages/Contact/ContactPage';
import FAQPage from './Pages/FAQ/FAQPage';
export default function App() {
  return (
    <AuthProvider>
      {' '}
      <Router>
        {' '}
        <Routes>
          {' '}
          {/* Public Routes */} <Route path="/" element={<HomePage />} />{' '}
          <Route path="/login" element={<LoginPage />} />{' '}
          <Route path="/joinus" element={<LoginPage />} />{' '}
          <Route path="/skinquiz" element={<SkinQuizPage />} />{' '}
          <Route path="/skinroutine" element={<SkinRoutinePage />} />{' '}
          <Route path="/products" element={<ProductsPage />} />{' '}
          {/* <Route path="/product/:id" element={<ProductDetailedPage />} />{' '} */}
          <Route path="/product/:slug" element={<ProductDetailedPage />} />{' '}
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/cart" element={<CartPage />} />{' '}
          <Route path="/blogs" element={<BlogPage />} />{' '}
          <Route path="/about" element={<AboutPage />} />{' '}
          <Route path="/checkout" element={<CheckoutPage />} />{' '}
          <Route path="/contact" element={<ContactPage />} />{' '}
          <Route path="/order-confirmation" element={<OrderConfirmation />} />{' '}
          <Route
            path="/momo-confirmation"
            element={<OrderConfirmationMoMo />}
          />{' '}
          <Route
            path="/zalo-confirmation"
            element={<OrderConfirmationZalo />}
          />{' '}
          <Route path="/blog/:blogSlug" element={<BlogDetails />} />{' '}
          <Route path="/reset-password" element={<ResetPasswordPage />} />{' '}
          <Route
            path="/compare/:product1/:product2"
            element={<CompareProduct />}
          />{' '}
          {/* Protected User Routes */}{' '}
          <Route element={<ProtectedRoute />}>
            {' '}
            <Route path="/profile" element={<UserProfile />} />{' '}
            <Route path="/order-details" element={<OrderDetails />} />
          </Route>{' '}
          {/* Admin Routes - Protected by Admin Role */}{' '}
          <Route element={<ProtectedRoute requireAdmin={true} />}>
            {' '}
            <Route path="/admin/*" element={<Admin />} />{' '}
          </Route>{' '}
          {/* Error Pages */}{' '}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />{' '}
          <Route path="/guest" element={<GuestUnauthorizedPage />} />{' '}
        </Routes>{' '}
      </Router>{' '}
    </AuthProvider>
  );
}
