import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingPage from '../../Pages/LoadingPage/LoadingPage'

const ProtectedRoute = ({ requireAdmin = false }) => {
  const { currentUser, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <LoadingPage />
    );
  }

  if (!currentUser) {
    return <Navigate to="/joinus" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
