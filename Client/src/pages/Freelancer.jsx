// src/pages/Freelancer.jsx
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/FreelancerComponents/Navbar/Navbar';
import Dashboard from '../components/FreelancerComponents/Dashboard/Dashboard';

export default function Freelancer() {
  const { section } = useParams();
  const { user } = useAuth();

  if (!user) return <Navigate to="/auth/signin" replace />;
  if (user.role !== 'freelancer') return <Navigate to={`/${user.role}/dashboard`} replace />;

  const renderSection = () => {
    switch (section) {
      case 'dashboard': return <Dashboard />;
      case 'browse-projects': return <PlaceholderPage title="Browse Projects" />;
      case 'my-projects': return <PlaceholderPage title="My Projects (Working)" />;
      case 'profile': return <PlaceholderPage title="Profile" />;
      case 'notifications': return <PlaceholderPage title="Notifications" />;
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