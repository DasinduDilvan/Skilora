import { Link } from 'react-router-dom';
import './Navbar.css';

export default function Navbar({ mode }) {
  const isSignIn = mode === 'signin';

  return (
    <nav className="navbar auth-navbar">
      <div className="navbar-container">
        {/* Exact same Logo markup and class names as your Home Navbar */}
        <Link to="/" className="navbar-logo">
          <img src="/logo.png" alt="Skillora Logo" className="logo-img" />
          Skillora
        </Link>

        {/* Dynamic Context Action Switcher */}
        <div className="navbar-actions auth-actions">
          {isSignIn ? (
            <div className="auth-switch-text">
              <span className="hide-mobile">New here?</span>{' '}
              <Link to="/auth/signup" className="btn btn-primary">
                Create an Account
              </Link>
            </div>
          ) : (
            <div className="auth-switch-text">
              <span className="hide-mobile">Already have an account?</span>{' '}
              <Link to="/auth/signin" className="btn btn-ghost auth-btn-login">
                Log In
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}