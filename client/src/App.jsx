import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import CollegeDetailPage from './pages/CollegeDetailPage';
import AuthPage from './pages/AuthPage';

// Dashboards
import AdminDashboard from './dashboards/AdminDashboard';
import StudentDashboard from './dashboards/StudentDashboard';
import CollegeAdminDashboard from './dashboards/CollegeAdminDashboard';
import CollegeRequestForm from './pages/CollegeRequestForm';

export default function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = "/";
  };

  return (
    <Router>
      <Navbar user={user} handleLogout={handleLogout} />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/college/:id" element={<CollegeDetailPage user={user} />} />
        <Route path="/auth" element={<AuthPage setUser={setUser} />} />
        <Route path="/register-college" element={<CollegeRequestForm />} />

        {/* DYNAMIC DASHBOARD ROUTE */}
        <Route
          path="/dashboard"
          element={
            !user ? (
              <Navigate to="/auth" />
            ) : user.role === 'web_admin' ? (
              <AdminDashboard user={user} />
            ) : user.role === 'clg_admin' ? (
              <CollegeAdminDashboard user={user} /> 
            ) : (
              <StudentDashboard user={user} />
            )
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}