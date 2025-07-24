import React from 'react';
import { Navigate } from 'react-router-dom';
import { decodeUserSync } from '../utils/auth';

const ProtectedRoute = ({ children, role }) => {
  const user = decodeUserSync();

  if (!user) return <Navigate to="/login" replace />;

  if (role && user.role !== role) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default ProtectedRoute;
