import { useEffect } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/ClientComponents/Navbar/Navbar';
import Dashboard from '../components/ClientComponents/Dashboard/Dashboard';
import PostProject from '../components/ClientComponents/PostProject/PostProject';
import Applications from '../components/ClientComponents/Applications/Applications';
import Freelancers from '../components/ClientComponents/Freelancers/Freelancers';
import BrowseProjects from '../components/ClientComponents/BrowseProjects/BrowseProjects';
import MyProjects from '../components/ClientComponents/MyProjects/MyProjects';

// Placeholder view for secondary Client sub-pages
const ClientPlaceholder = ({ title }) => (
  <div
    style={{
      maxWidth: 1400,
      margin: '0 auto',
      padding: '70px 24px',
      textAlign: 'center',
    }}
  >
    <div
      style={{
        width: 56,
        height: 56,
        background: 'var(--primary-light, #eef2ff)',
        color: 'var(--primary, #4f46e5)',
        borderRadius: 12,
        display: 'grid',
        placeItems: 'center',
        fontSize: '1.6rem',
        margin: '0 auto 16px',
      }}
    >
      🚧
    </div>
    <h1 style={{ fontSize: '1.6rem', color: 'var(--text, #111827)', marginBottom: 8 }}>
      {title}
    </h1>
    <p style={{ color: 'var(--text-light, #6b7280)', maxWidth: 450, margin: '0 auto' }}>
      This module is under development and will be available in the next release.
    </p>
  </div>
);

export default function Client() {
  const { section } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Authentication & Role-Based Access Control Protection
  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate('/auth/signin', { replace: true });
      return;
    }

    if (user.role && user.role !== 'client') {
      navigate(`/${user.role}/dashboard`, { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          color: 'var(--text-light, #6b7280)',
          fontFamily: 'inherit',
        }}
      >
        Verifying client session...
      </div>
    );
  }

  if (!user || user.role !== 'client') {
    return null;
  }

  // Component Router matching the :section parameter
  const renderClientSection = () => {
    switch (section) {
      case 'dashboard':
        return <Dashboard />;
      case 'post-project':
        return <PostProject />;
      case 'applications':
        return <Applications />;
      case 'browse-projects':
        return <BrowseProjects />;
      case 'my-projects':
        return <MyProjects />;
      case 'payments':
        return <ClientPlaceholder title="Payments & Invoices" />;
      case 'freelancers':
        return <Freelancers />;
      case 'profile':
        return <ClientPlaceholder title="My Profile" />;
      case 'settings':
        return <ClientPlaceholder title="Client Settings" />;
      default:
        return <Navigate to="/client/dashboard" replace />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar />
      <main>{renderClientSection()}</main>
    </div>
  );
}