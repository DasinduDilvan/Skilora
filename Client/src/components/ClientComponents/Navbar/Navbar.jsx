// src/components/ClientComponents/Navbar/Navbar.jsx
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './Navbar.css';

// Client Navigation Links
const clientLinks = [
  { id: 1, label: 'Dashboard', path: '/client/dashboard' },
  { id: 2, label: 'Applications', path: '/client/applications' },
  { id: 3, label: 'Browse Projects', path: '/client/browse-projects' },
  { id: 4, label: 'My Projects', path: '/client/my-projects' },
  { id: 5, label: 'Payments', path: '/client/payments' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const menuRef = useRef(null);
  const btnRef = useRef(null);
  const profileRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const clientName =
    user?.firstName ||
    user?.name ||
    user?.username ||
    (user?.email ? user.email.split('@')[0] : 'Client');

  const avatarLetter = clientName.charAt(0).toUpperCase();

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

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
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    setProfileOpen(false);
    navigate('/auth/signin');
  };

  return (
    <nav className="role-navbar">
      <div className="role-navbar-container">
        {/* Real Logo Image (Matches Home page) */}
        <Link to="/client/dashboard" className="role-navbar-logo">
          <img src="/logo.png" alt="Skillora Logo" className="logo-img" />
          Skillora
        </Link>

        {/* Desktop Navigation Links (Now on the same line) */}
        <div className="role-navbar-links">
          {clientLinks.map((link) => (
            <Link
              key={link.id}
              to={link.path}
              className={location.pathname === link.path ? 'active' : ''}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Avatar Dropdown */}
        <div className="role-navbar-user-section" ref={profileRef}>
          <button
            className={`role-avatar-btn ${profileOpen ? 'active' : ''}`}
            onClick={() => setProfileOpen((p) => !p)}
            aria-label="User Profile Options"
          >
            <div className="navbar-avatar">
              {user?.profileImage ? (
                <img src={user.profileImage} alt={clientName} />
              ) : (
                avatarLetter
              )}
            </div>
            <span className="user-greet-name hide-mobile">{clientName} ▾</span>
          </button>

          {/* Profile Dropdown Menu */}
          {profileOpen && (
            <div className="profile-dropdown">
              <div className="dropdown-user-header">
                <strong>{clientName}</strong>
                <span>{user?.email || 'Client Account'}</span>
              </div>
              <hr />
              <Link to="/client/profile" className="dropdown-item">
                👤 My Profile
              </Link>
              <Link to="/client/settings" className="dropdown-item">
                ⚙️ Settings
              </Link>
              <hr />
              <button onClick={handleLogout} className="dropdown-item logout-btn-item">
                🚪 Logout
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger toggle */}
        <button
          ref={btnRef}
          className={`role-mobile-btn${mobileOpen ? ' active' : ''}`}
          onClick={() => setMobileOpen((p) => !p)}
          aria-label="Toggle navigation menu"
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
        className={`role-mobile-menu${mobileOpen ? ' active' : ''}`}
      >
        <div className="mobile-user-info">
          <div className="mobile-user-avatar">
            {user?.profileImage ? (
              <img src={user.profileImage} alt={clientName} />
            ) : (
              avatarLetter
            )}
          </div>
          <div>
            <div className="mobile-user-name">{clientName}</div>
            <div className="mobile-user-role">Client Account</div>
          </div>
        </div>

        {/* Core Mobile Links */}
        <div className="mobile-core-links">
          {clientLinks.map((link) => (
            <Link
              key={link.id}
              to={link.path}
              className={location.pathname === link.path ? 'active' : ''}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <hr className="mobile-divider" />

        {/* Profile Dropdown Actions in Mobile View */}
        <div className="mobile-profile-actions">
          <Link to="/client/profile" className="mobile-profile-link">
            👤 My Profile
          </Link>
          <Link to="/client/settings" className="mobile-profile-link">
            ⚙️ Settings
          </Link>
          <button onClick={handleLogout} className="btn-logout mobile">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}