import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RecordsProvider } from './context/RecordsContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminDashboard from './pages/AdminDashboard';
import History from './pages/History';
import Profile from './pages/Profile';

function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: 'employee' | 'admin' }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route element={<Layout />}>
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              {user?.role === 'admin' ? <AdminDashboard /> : <EmployeeDashboard />}
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/history" 
          element={
            <ProtectedRoute role="employee">
              <History />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        {/* Placeholder routes for admin */}
        <Route 
          path="/employees" 
          element={
            <ProtectedRoute role="admin">
              <div className="p-4 text-center text-slate-500">Em desenvolvimento</div>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reports" 
          element={
            <ProtectedRoute role="admin">
              <div className="p-4 text-center text-slate-500">Em desenvolvimento</div>
            </ProtectedRoute>
          } 
        />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RecordsProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </RecordsProvider>
    </AuthProvider>
  );
}

