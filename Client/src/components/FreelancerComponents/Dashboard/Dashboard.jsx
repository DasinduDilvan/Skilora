// src/components/FreelancerComponents/Dashboard/Dashboard.jsx
import { useAuth } from '../../../context/AuthContext';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();

  const stats = [
    { label: 'Active Projects', value: '3', icon: '🚀', color: '#3b82f6' },
    { label: 'Applications Sent', value: '18', icon: '📤', color: '#f59e0b' },
    { label: 'Completed Jobs', value: '27', icon: '✅', color: '#10b981' },
    { label: 'Total Earnings', value: '$6,320', icon: '💵', color: '#8b5cf6' },
  ];

  const workingProjects = [
    { title: 'React Dashboard Development', client: 'TechCorp Inc.', deadline: 'Nov 25', progress: 75 },
    { title: 'Mobile App Backend API', client: 'StartupHub', deadline: 'Dec 05', progress: 40 },
    { title: 'Logo & Brand Guidelines', client: 'Creative Studio', deadline: 'Nov 20', progress: 90 },
  ];

  return (
    <div className="freelancer-dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {user?.name || 'Freelancer'} 👋</h1>
        <p>Track your projects, applications, and earnings.</p>
      </div>

      <div className="stats-grid">
        {stats.map((s, i) => (
          <div key={i} className="stat-card" style={{ borderTopColor: s.color }}>
            <div className="stat-icon" style={{ background: `${s.color}20` }}>{s.icon}</div>
            <div className="stat-info">
              <h3>{s.value}</h3>
              <p>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2>Current Working Projects</h2>
          <div className="working-list">
            {workingProjects.map((p, i) => (
              <div key={i} className="working-item">
                <div className="working-info">
                  <h4>{p.title}</h4>
                  <p>Client: {p.client} • Due: {p.deadline}</p>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${p.progress}%` }}></div>
                  </div>
                  <span className="progress-text">{p.progress}% Complete</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card">
          <h2>Recent Notifications</h2>
          <ul className="notif-list">
            <li>✅ Application accepted: <b>React Dashboard</b></li>
            <li>💬 New message from TechCorp Inc.</li>
            <li>💰 Payment received: $450</li>
            <li>⏰ Reminder: Logo project due tomorrow</li>
          </ul>
        </div>
      </div>
    </div>
  );
}