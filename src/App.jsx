import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './Pages/Home/HomePage';
import LoginPage from './Pages/Login/LoginPage';
import SkinQuizPage from './Pages/SkinQuiz/SkinQuizPage';
import SkinRoutinePage from './Pages/SkinQuiz/SkinRoutinePage';
import ProductsPage from './Pages/Products/ProductsPage'
import ProductDetailedPage from './Pages/ProductDetailed/ProductDetailedPage';
import CompareProduct from './Pages/CompareProductPage/CompareProductPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/joinus" element={<LoginPage />} />
        <Route path="/skinquiz" element={<SkinQuizPage />} />
        <Route path="/skinroutine" element={<SkinRoutinePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/product/:id" element={<ProductDetailedPage />} />
        <Route path="/compare" element={<CompareProduct />} />

      </Routes>
    </Router>
  );
}
