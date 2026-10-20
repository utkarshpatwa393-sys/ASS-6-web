// client/src/App.jsx
// Main application component with React Router configuration matching all PS9 specifications

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import MyDonations from './pages/MyDonations';
import NewRequest from './pages/NewRequest';
import MyRequests from './pages/MyRequests';
import EditRequest from './pages/EditRequest';
import AdminDashboard from './pages/AdminDashboard';
import AdminStock from './pages/AdminStock';
import AdminRequests from './pages/AdminRequests';
import AdminDonors from './pages/AdminDonors';
import AdminDonorDetails from './pages/AdminDonorDetails';
import AdminNewDonation from './pages/AdminNewDonation';

// Home redirect based on role
const HomeRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/profile" replace />;
};

function AppRoutes() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Default Root Redirect */}
          <Route path="/" element={<HomeRedirect />} />

          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Donor & General Protected Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-donations"
            element={
              <ProtectedRoute>
                <MyDonations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/requests/new"
            element={
              <ProtectedRoute>
                <NewRequest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-requests"
            element={
              <ProtectedRoute>
                <MyRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-requests/:id/edit"
            element={
              <ProtectedRoute>
                <EditRequest />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute roleRequired="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/stock"
            element={
              <ProtectedRoute roleRequired="admin">
                <AdminStock />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/requests"
            element={
              <ProtectedRoute roleRequired="admin">
                <AdminRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/donors"
            element={
              <ProtectedRoute roleRequired="admin">
                <AdminDonors />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/donors/:id"
            element={
              <ProtectedRoute roleRequired="admin">
                <AdminDonorDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/donations/new"
            element={
              <ProtectedRoute roleRequired="admin">
                <AdminNewDonation />
              </ProtectedRoute>
            }
          />

          {/* Fallback 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="footer">
        <p>
          🩸 <strong>LifeFlow Blood Bank Management System</strong> — PS9 MERN Stack Individual Assignment
        </p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
