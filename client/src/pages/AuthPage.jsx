import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Lock, Mail, User } from 'lucide-react';

export default function AuthPage({ setUser }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'student', // આ બાય-ડિફોલ્ટ 'student' જ રહેશે
  });

  useEffect(() => {
    if (location.state?.showSignup) {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const res = await axios.post('http://localhost:5000/api/login', {
          email: form.email,
          password: form.password,
        });

        localStorage.setItem('user', JSON.stringify(res.data));
        setUser(res.data);

        // એડમિન હોય તો ડેશબોર્ડ પર, બાકી હોમ પેજ પર
        if (res.data.role === 'web_admin' || res.data.role === 'clg_admin') {
          navigate('/dashboard');
        } else {
          navigate('/');
        }
      } else {
        // સાઈન-અપ વખતે આખું ફોર્મ (સાથે role: 'student') મોકલાશે
        await axios.post('http://localhost:5000/api/signup', form);
        alert('Account Created Successfully! Please Login.');
        setIsLogin(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Authentication failed.');
    }
  };

  return (
    <div className="auth-container" style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f7fe' }}>
      <form className="auth-card" onSubmit={handleSubmit} style={{ background: '#fff', padding: '40px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '100%', maxWidth: '450px' }}>

        <h2 style={{ textAlign: 'center', marginBottom: '10px', color: '#1e293b' }}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', marginBottom: '30px' }}>
          {isLogin ? 'Enter your credentials to access your account' : 'Join as a Student to explore and manage colleges'}
        </p>

        {!isLogin && (
          <div className="input-group" style={{ marginBottom: '15px' }}>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Full Name"
                style={{ width: '100%', padding: '12px 12px 12px 45px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }}
                required
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />
            </div>
          </div>
        )}

        <div className="input-group" style={{ marginBottom: '15px' }}>
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="email"
              placeholder="Email Address"
              style={{ width: '100%', padding: '12px 12px 12px 45px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }}
              required
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
        </div>

        <div className="input-group" style={{ marginBottom: '20px' }}>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="password"
              placeholder="Password"
              style={{ width: '100%', padding: '12px 12px 12px 45px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }}
              required
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
        </div>

        <button type="submit"
          style={{
            background: '#2563eb',
            color: 'white',
            border: 'none',
            width: '100%',
            padding: '14px',
            borderRadius: '12px',
            marginBottom: '20px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '16px'
          }}>{isLogin ? 'Sign In' : 'Sign Up'}
        </button>

        <p onClick={() => setIsLogin(!isLogin)}
          style={{
            cursor: 'pointer',
            textAlign: 'center',
            fontSize: '14px',
            color: '#2563eb',
            fontWeight: '600'
          }}>{isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
        </p>

        <div style={{
          margin: '25px 0',
          borderTop: '1px solid #e2e8f0',
          position: 'relative'
        }}>
          <span style={{
            position: 'absolute',
            top: '-10px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#fff',
            padding: '0 10px',
            color: '#94a3b8',
            fontSize: '12px'
          }}>OR</span>
        </div>

        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          color: '#64748b',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </form>
    </div>
  );
}