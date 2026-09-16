import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { FeedbackFab } from './components/FeedbackFab';

// Layouts
import { EmployeeLayout } from './components/layout/EmployeeLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { SupplierLayout } from './components/layout/SupplierLayout';

// Auth Pages
import { UnifiedLogin } from './pages/UnifiedLogin';
import { Register } from './pages/Register';
import { SupplierRegister } from './pages/SupplierRegister';
import { AdminRegister } from './pages/AdminRegister';

// Employee Pages
import { Dashboard as EmployeeDashboard } from './pages/employee/Dashboard';
import { Requests as EmployeeRequests } from './pages/employee/Requests';
import { RequestDetails as EmployeeRequestDetails } from './pages/employee/RequestDetails';
import { Orders as EmployeeOrders } from './pages/employee/Orders';
import { OrderDetails as EmployeeOrderDetails } from './pages/employee/OrderDetails';
import { Notifications as EmployeeNotifications } from './pages/employee/Notifications';
import { Products as EmployeeProducts } from './pages/employee/Products';

// Admin Pages
import { Dashboard as AdminDashboard } from './pages/admin/Dashboard';
import { UnifiedRequests } from './pages/admin/UnifiedRequests';
import { Departments as AdminDepartments } from './pages/admin/Departments';
import { Employees as AdminEmployees } from './pages/admin/Employees';
import { Suppliers as AdminSuppliers } from './pages/admin/Suppliers';
import { Payments as AdminPayments } from './pages/admin/Payments';
import { Notifications as AdminNotifications } from './pages/admin/Notifications';
import { Settings } from './pages/Settings';

// Supplier Pages
import { Dashboard as SupplierDashboard } from './pages/supplier/Dashboard';
import { Products as SupplierProducts } from './pages/supplier/Products';
import { ProductForm as SupplierProductForm } from './pages/supplier/ProductForm';
import { UnifiedSupplierOrders } from './pages/supplier/UnifiedSupplierOrders';
import { Payments as SupplierPayments } from './pages/supplier/Payments';
import { Profile as SupplierProfile } from './pages/supplier/Profile';
import { Notifications as SupplierNotifications } from './pages/supplier/Notifications';

// Landing
import { Landing } from './pages/Landing';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<UnifiedLogin />} />
            <Route path="/admin/login" element={<Navigate to="/login" replace />} />
            <Route path="/supplier/login" element={<Navigate to="/login" replace />} />
            
            <Route path="/register" element={<Register />} />
            <Route path="/admin/register" element={<AdminRegister />} />
            <Route path="/supplier/register" element={<SupplierRegister />} />
            
            {/* Landing Page */}
            <Route path="/" element={<Landing />} />

            {/* Employee Portal Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requiredRole="EMPLOYEE">
                  <EmployeeLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<EmployeeDashboard />} />
              <Route path="products" element={<EmployeeProducts />} />
              <Route path="requests" element={<EmployeeRequests />} />
              <Route path="requests/:id" element={<EmployeeRequestDetails />} />
              <Route path="orders" element={<EmployeeOrders />} />
              <Route path="orders/:id" element={<EmployeeOrderDetails />} />
              <Route path="notifications" element={<EmployeeNotifications />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Admin Portal Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="requests" element={<UnifiedRequests />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="departments" element={<AdminDepartments />} />
              <Route path="employees" element={<AdminEmployees />} />
              <Route path="suppliers" element={<AdminSuppliers />} />
              <Route path="notifications" element={<AdminNotifications />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Supplier Portal Routes */}
            <Route
              path="/supplier"
              element={
                <ProtectedRoute requiredRole="SUPPLIER">
                  <SupplierLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<SupplierDashboard />} />
              <Route path="products" element={<SupplierProducts />} />
              <Route path="products/new" element={<SupplierProductForm />} />
              <Route path="products/:id" element={<SupplierProductForm />} />
              <Route path="orders" element={<UnifiedSupplierOrders />} />
              <Route path="payments" element={<SupplierPayments />} />
              <Route path="profile" element={<SupplierProfile />} />
              <Route path="notifications" element={<SupplierNotifications />} />
            </Route>

            {/* Default Redirect */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          <FeedbackFab />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

