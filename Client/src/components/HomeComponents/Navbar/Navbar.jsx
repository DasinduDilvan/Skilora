// src/components/HomeComponents/Navbar/Navbar.jsx
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { navLinks } from '../../../data/dummyData';
import { useAuth } from '../../../context/AuthContext'; // <-- LIVE AUTH
import './Navbar.css';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef(null);
  const btnRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  const { user, logout } = useAuth(); // <-- Get user state

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      ) {
        setMobileOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleMenu = () => setMobileOpen((prev) => !prev);

  const handleNavClick = (e, path) => {
    if (path.startsWith('#')) {
      e.preventDefault();
      const el = document.querySelector(path);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src="/logo.png" alt="Skillora Logo" className="logo-img" />
          Skillora
        </Link>

        {/* Navigation links */}
        <div className="navbar-links">
          {navLinks.map((link) => (
            link.path.startsWith('#') ? (
              <a
                key={link.id}
                href={link.path}
                onClick={(e) => handleNavClick(e, link.path)}
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.id}
                to={link.path}
                className={location.pathname === link.path ? 'active' : ''}
              >
                {link.label}
              </Link>
            )
          ))}
        </div>

        {/* Dynamic Action Buttons */}
        <div className="navbar-actions">
          {user ? (
            <>
              <Link to={`/${user.role}/dashboard`} className="btn btn-ghost">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="btn btn-primary" style={{ border: 'none', cursor: 'pointer' }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/auth/signin" className="btn btn-ghost">
                Sign In
              </Link>
              <Link to="/auth/signup" className="btn btn-primary">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <button
          ref={btnRef}
          className={`mobile-menu-btn${mobileOpen ? ' active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          <div className="hamburger">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
      </div>

      {/* Mobile Drawer */}
      <div
        ref={menuRef}
        className={`mobile-menu${mobileOpen ? ' active' : ''}`}
      >
        {navLinks.map((link) => (
          link.path.startsWith('#') ? (
            <a
              key={link.id}
              href={link.path}
              onClick={(e) => {
                handleNavClick(e, link.path);
                setMobileOpen(false);
              }}
            >
              {link.label}
            </a>
          ) : (
            <Link key={link.id} to={link.path}>
              {link.label}
            </Link>
          )
        ))}
        <div className="mobile-actions">
          {user ? (
            <>
              <Link to={`/${user.role}/dashboard`} className="btn btn-ghost">Dashboard</Link>
              <button onClick={handleLogout} className="btn btn-primary" style={{width: '100%'}}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/auth/signin" className="btn btn-secondary">Sign In</Link>
              <Link to="/auth/signup" className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}