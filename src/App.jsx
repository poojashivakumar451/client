import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Pages (to be created)
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Instructions from './pages/Instructions';
import Assessment from './pages/Assessment';
import Completed from './pages/Completed';
import Terminated from './pages/Terminated';
import Result from './pages/Result';
import AdminDashboard from './pages/Admin/Dashboard';

const PrivateRoute = ({ children, role }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!currentUser) {
    console.log("No user found, redirecting to login...");
    return <Navigate to="/login" />;
  }
  if (role && currentUser.role !== role) return <Navigate to="/" />;
  
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/instructions" element={<PrivateRoute><Instructions /></PrivateRoute>} />
          <Route path="/assessment" element={<PrivateRoute><Assessment /></PrivateRoute>} />
          <Route path="/completed" element={<PrivateRoute><Completed /></PrivateRoute>} />
          <Route path="/terminated" element={<PrivateRoute><Terminated /></PrivateRoute>} />
          <Route path="/result" element={<PrivateRoute><Result /></PrivateRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin/*" element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
