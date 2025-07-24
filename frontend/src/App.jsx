import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './components/Register';
import RegisterUser from './components/RegisterUser';
import MerchantDashboard from './components/MerchantDashboard';
import AdminDashboard from './components/AdminDashboard';
import Scanner from './components/Scanner';

import { decodeUserSync } from './utils/auth';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const decodedUser = decodeUserSync();
      console.log("Decoded user:", decodedUser);  // <--- Add this

    if (decodedUser) setUser(decodedUser);
  }, []);

  return (
    <Router>
      <Toaster />
      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-user" element={<RegisterUser />} />
        <Route
          path="/merchant"
          element={
            <ProtectedRoute role="merchant">
              <MerchantDashboard user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/scanner"
          element={
            <ProtectedRoute role="merchant">
              <Scanner user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
