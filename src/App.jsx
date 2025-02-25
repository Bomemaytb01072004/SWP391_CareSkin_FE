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
import Admin from './Admin';
import UserProfile from './Pages/UserProfile/UserProfile';
export default function App() {
  return (
    <Router>
      {' '}
      <Routes>
        {' '}
        <Route path="/" element={<HomePage />} />{' '}
        <Route path="/joinus" element={<LoginPage />} />{' '}
        <Route path="/skinquiz" element={<SkinQuizPage />} />{' '}
        <Route path="/skinroutine" element={<SkinRoutinePage />} />{' '}
        <Route path="/products" element={<ProductsPage />} />{' '}
        <Route path="/product/:id" element={<ProductDetailedPage />} />{' '}
        <Route path="/cart" element={<CartPage />} />{' '}
        <Route path="/checkout" element={<CheckoutPage />} />{' '}
        <Route path="/order-confirmation" element={<OrderConfirmation />} />{' '}
        <Route
          path="/compare/:product1/:product2"
          element={<CompareProduct />}
        />{' '}
        <Route path="/profile" element={<UserProfile />} />{' '}
        <Route path="/admin/*" element={<Admin />} />{' '}
      </Routes>{' '}
    </Router>
  );
}
