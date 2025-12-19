import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CustomerList from './pages/CustomerList';
import CustomerDetail from './pages/CustomerDetail';
import ComingSoon from './pages/ComingSoon';
import Layout from './components/Layout';
import { Toaster } from './components/ui/sonner';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// Axios interceptor for auth
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Setup axios response interceptor for 401 handling
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid - logout user
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              user ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />
            }
          />
          <Route
            path="/"
            element={
              user ? (
                <Layout user={user} onLogout={handleLogout}>
                  <Dashboard />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/customers"
            element={
              user ? (
                <Layout user={user} onLogout={handleLogout}>
                  <CustomerList />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/customers/:customerId"
            element={
              user ? (
                <Layout user={user} onLogout={handleLogout}>
                  <CustomerDetail />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="*"
            element={
              user ? (
                <Layout user={user} onLogout={handleLogout}>
                  <ComingSoon />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
