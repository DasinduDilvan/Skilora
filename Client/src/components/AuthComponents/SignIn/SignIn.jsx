// src/components/AuthComponents/SignIn/SignIn.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './SignIn.css';

const SignIn = () => {
  const navigate = useNavigate();
  const { signin } = useAuth();
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [id]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setAlert({ type: 'error', message: '❌ Please enter your email and password.' });
      return;
    }

    setSubmitting(true);
    setAlert({ type: '', message: '' });

    try {
      const res = await signin(form.email, form.password);
      
      // Safely extract role
      const role = res?.user?.role || res?.role || 'client';
      
      setAlert({ type: 'success', message: '✅ Login successful! Redirecting...' });
      
      // Immediate navigate to client dashboard
      setTimeout(() => {
        if (role === 'client') {
          navigate('/client/dashboard', { replace: true });
        } else if (role === 'freelancer') {
          navigate('/freelancer/dashboard', { replace: true });
        } else if (role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }, 400);

    } catch (err) {
      console.error("Login error:", err);
      setAlert({ 
        type: 'error', 
        message: `❌ ${err.response?.data?.message || err.message || 'Invalid credentials'}` 
      });
      setSubmitting(false);
    }
  };

  return (
    <div className="signin-page-wrap">
      {/* LEFT PANEL */}
      <div className="signin-left-panel">
        <div className="lp-icon">🔐</div>
        <h2>Welcome Back to Skillora</h2>
        <p>Log in to access your dashboard, manage projects, and connect with the right people.</p>
        <div className="testimonial">
          <p>"Skillora helped me find my first freelance project within a week of signing up. The platform is incredibly easy to use!"</p>
          <div className="testimonial-author">
            <div className="t-avatar">KR</div>
            <div className="t-info">
              <h5>Kamal Ruwan</h5>
              <span>Full-Stack Developer, Freelancer</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="signin-right-panel">
        <div className="form-header">
          <h2>Log In</h2>
          <p>Enter your credentials to access your account.</p>
        </div>

        {alert.message && (
          <div className={`alert alert-${alert.type}`}>{alert.message}</div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={form.email}
              onChange={handleChange}
              placeholder="youremail@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="toggle-pw"
                onClick={() => setShowPassword((p) => !p)}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <div className="forgot-row">
            <Link to="/auth/forgot-password">Forgot Password?</Link>
          </div>

          <div className="remember-row">
            <input
              type="checkbox"
              id="remember"
              checked={form.remember}
              onChange={handleChange}
            />
            <label htmlFor="remember">Remember me for 30 days</label>
          </div>

          <button type="submit" className="btn-submit" disabled={submitting}>
            {submitting ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="sign-up-link">
          Don't have an account? <Link to="/auth/signup">Sign Up Free</Link>
        </div>
      </div>
    </div>
  );
};

export default SignIn;