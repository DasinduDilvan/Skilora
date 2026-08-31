// src/pages/Client.jsx
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/ClientComponents/Navbar/Navbar';
import Dashboard from '../components/ClientComponents/Dashboard/Dashboard';

export default function Client() {
  const { section } = useParams();
  const { user } = useAuth();

  // Protect route: only clients allowed
  if (!user) return <Navigate to="/auth/signin" replace />;
  if (user.role !== 'client') return <Navigate to={`/${user.role}/dashboard`} replace />;

  const renderSection = () => {
    switch (section) {
      case 'dashboard':
        return <Dashboard />;
      case 'post-project':
        return <PlaceholderPage title="Post a Project" />;
      case 'applications':
        return <PlaceholderPage title="Applications Received" />;
      case 'browse-projects':
        return <PlaceholderPage title="Browse Projects" />;
      case 'my-projects':
        return <PlaceholderPage title="My Projects (Posted)" />;
      case 'payments':
        return <PlaceholderPage title="Payments" />;
      case 'freelancers':
        return <PlaceholderPage title="Freelancers" />;
      case 'profile':
        return <PlaceholderPage title="My Profile" />;
      case 'settings':
        return <PlaceholderPage title="Settings" />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      <Navbar />
      <main className="role-main">{renderSection()}</main>
    </>
  );
}

function PlaceholderPage({ title }) {
  return (
    <div style={{ padding: '60px 24px', textAlign: 'center', minHeight: '60vh' }}>
      <h1 style={{ fontSize: '2rem', color: 'var(--text)' }}>{title}</h1>
      <p style={{ color: 'var(--text-light)', marginTop: '10px' }}>
        This section is under construction.
      </p>
    </div>
  );
}