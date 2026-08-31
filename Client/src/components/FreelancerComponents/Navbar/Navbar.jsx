// src/components/FreelancerComponents/Navbar/Navbar.jsx
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './Navbar.css';

const freelancerLinks = [
  { id: 1, label: 'Dashboard', path: '/freelancer/dashboard' },
  { id: 2, label: 'Browse Projects', path: '/freelancer/browse-projects' },
  { id: 3, label: 'My Projects', path: '/freelancer/my-projects' },
  { id: 4, label: 'Profile', path: '/freelancer/profile' },
  { id: 5, label: 'Notifications', path: '/freelancer/notifications' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef(null);
  const btnRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        btnRef.current && !btnRef.current.contains(e.target)
      ) setMobileOpen(false);
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/');
  };

  return (
    <nav className="role-navbar single-line">
      <div className="role-navbar-container">
        <Link to="/freelancer/dashboard" className="role-navbar-logo">
          <img src="/logo.png" alt="Skillora Logo" className="logo-img" />
          Skillora
        </Link>

        <div className="role-navbar-links inline">
          {freelancerLinks.map((link) => (
            <Link
              key={link.id}
              to={link.path}
              className={location.pathname === link.path ? 'active' : ''}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="role-navbar-user">
          <span className="user-greet">Hi, {user?.name || 'Freelancer'}</span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>

        <button
          ref={btnRef}
          className={`role-mobile-btn${mobileOpen ? ' active' : ''}`}
          onClick={() => setMobileOpen((p) => !p)}
          aria-label="Toggle menu"
        >
          <div className="hamburger">
            <span></span><span></span><span></span>
          </div>
        </button>
      </div>

      <div ref={menuRef} className={`role-mobile-menu${mobileOpen ? ' active' : ''}`}>
        {freelancerLinks.map((link) => (
          <Link
            key={link.id}
            to={link.path}
            className={location.pathname === link.path ? 'active' : ''}
          >
            {link.label}
          </Link>
        ))}
        <button onClick={handleLogout} className="btn-logout mobile">Logout</button>
      </div>
    </nav>
  );
}