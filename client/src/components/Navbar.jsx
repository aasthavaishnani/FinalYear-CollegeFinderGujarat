import React from 'react';
import { Link } from 'react-router-dom';
import { LogIn, UserPlus, LogOut, LayoutDashboard, Home, ShieldCheck } from 'lucide-react';

export default function Navbar({ user, handleLogout }) {
  // ફેરફાર: નવા રોલ મુજબ web_admin ચેક કરશે
  const isWebAdmin = user && user.role === 'web_admin';

  return (
    <nav className="main-nav">
      <div className="container nav-flex">
        {/* Logo - Always takes user to first page */}
        <Link to="/" className="logo">
          Edu<span>Gujarat</span>
        </Link>

        <div className="nav-actions">
          {/* Home link - Visible to everyone */}
          <Link to="/" className="nav-link">
            <Home size={18} /> Home
          </Link>

          {!user ? (
            <>
              {/* નવું: કોલેજ ઓનબોર્ડિંગ માટેની લિંક */}
              <Link to="/register-college" className="nav-link" style={{ fontWeight: '600', color: 'var(--primary-blue)' }}>
                List Your College
              </Link>
              <Link to="/auth" className="nav-link">
                <LogIn size={18} /> Login
              </Link>
              <Link to="/auth" state={{ showSignup: true }} className="signup-btn">
                <UserPlus size={18} /> Join Now
              </Link>
            </>
          ) : (
            <div className="user-controls">
              {/* Role Tag helps user know which account type is active */}
              <span className="role-tag" style={{ textTransform: 'capitalize' }}>
                {user.role.replace('_', ' ')}
              </span>

              {/* Conditional Dashboard Link: web_admin માટે Admin Panel બાકીના માટે Dashboard */}
              {isWebAdmin ? (
                <Link to="/dashboard" className="nav-link" style={{ color: 'var(--secondary-blue)' }}>
                  <ShieldCheck size={18} /> Admin Panel
                </Link>
              ) : (
                <Link to="/dashboard" className="nav-link">
                  <LayoutDashboard size={18} /> Dashboard
                </Link>
              )}

              {/* Logout Button with visual feedback */}
              <button
                onClick={handleLogout}
                className="logout-icon"
                title="Logout"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '5px',
                  color: '#666',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#ff4d4d'}
                onMouseOut={(e) => e.currentTarget.style.color = '#666'}
              >
                <LogOut size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}