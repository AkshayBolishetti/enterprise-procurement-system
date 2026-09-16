import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-slate-500">Loading session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect unauthenticated access to proper login page
    return <Navigate to={requiredRole === 'ADMIN' ? '/admin/login' : '/login'} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect role mismatch
    return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  return children;
};
