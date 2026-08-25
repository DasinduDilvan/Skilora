// src/components/HomeComponents/Navbar/Navbar.jsx
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { navLinks } from '../../../data/dummyData';
import './Navbar.css';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef(null);
  const btnRef = useRef(null);
  const location = useLocation();

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

  // Handle section smooth scroll if links are hash tags (e.g., #categories)
  const handleNavClick = (e, path) => {
    if (path.startsWith('#')) {
      e.preventDefault();
      const el = document.querySelector(path);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
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

        {/* Action Buttons */}
        <div className="navbar-actions">
          <Link to="/auth/signin" className="btn btn-ghost">
            Sign In
          </Link>
          <Link to="/auth/signup" className="btn btn-primary">
            Sign Up
          </Link>
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
          <Link to="/auth/signin" className="btn btn-secondary">
            Sign In
          </Link>
          <Link to="/auth/signup" className="btn btn-primary">
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}