// src/pages/Admin.jsx
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/AdminComponents/Navbar/Navbar';
import Dashboard from '../components/AdminComponents/Dashboard/Dashboard';

export default function Admin() {
  const { section } = useParams();
  const { user } = useAuth();

  if (!user) return <Navigate to="/auth/signin" replace />;
  if (user.role !== 'admin') return <Navigate to={`/${user.role}/dashboard`} replace />;

  const renderSection = () => {
    switch (section) {
      case 'dashboard': return <Dashboard />;
      case 'users': return <PlaceholderPage title="Manage Users" />;
      case 'projects': return <PlaceholderPage title="Manage Projects" />;
      case 'categories': return <PlaceholderPage title="Manage Categories" />;
      case 'payments': return <PlaceholderPage title="Payment Transactions" />;
      case 'reports': return <PlaceholderPage title="Reports & Complaints" />;
      case 'settings': return <PlaceholderPage title="Platform Settings" />;
      default: return <Dashboard />;
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