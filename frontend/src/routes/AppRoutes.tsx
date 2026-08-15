import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Login } from '../pages/Login/Login';
import { Dashboard } from '../pages/Dashboard/Dashboard';
import { Customers } from '../pages/Customers/Customers';
import { Products } from '../pages/Products/Products';
import { Challans } from '../pages/Challans/Challans';
import { NotFound } from '../pages/NotFound/NotFound';
import { ProtectedRoute } from './ProtectedRoute';
import { MainLayout } from '../components/layout/MainLayout';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route
          path="customers"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SALES']}>
              <Customers />
            </ProtectedRoute>
          }
        />
        <Route path="products" element={<Products />} />
        <Route path="challans" element={<Challans />} />
      </Route>

      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
