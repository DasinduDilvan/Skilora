// src/components/AdminComponents/Dashboard/Dashboard.jsx
import { useAuth } from '../../../context/AuthContext';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();

  const stats = [
    { label: 'Total Users', value: '1,284', icon: '👥', color: '#3b82f6' },
    { label: 'Active Projects', value: '346', icon: '📁', color: '#10b981' },
    { label: 'Pending Reports', value: '12', icon: '⚠️', color: '#f59e0b' },
    { label: 'Revenue (Monthly)', value: '$24,890', icon: '💰', color: '#8b5cf6' },
  ];

  const recentActivity = [
    { text: 'New freelancer registered: John Doe', time: '2 min ago' },
    { text: 'Report filed by user: kamal@mail.com', time: '15 min ago' },
    { text: 'Payment processed: $450 to Freelancer #2145', time: '1 hr ago' },
    { text: 'New category added: "AI & Machine Learning"', time: '3 hrs ago' },
  ];

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Overview 🛡️</h1>
        <p>Welcome, {user?.name || 'Admin'}. Here's your platform summary.</p>
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
          <h2>Recent Platform Activity</h2>
          <ul className="activity-list">
            {recentActivity.map((a, i) => (
              <li key={i}>
                <span className="dot"></span>
                <div>
                  <p>{a.text}</p>
                  <span className="time">{a.time}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="dashboard-card">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <button className="action-btn">👥 Manage Users</button>
            <button className="action-btn">📁 Review Projects</button>
            <button className="action-btn">⚠️ Handle Reports</button>
            <button className="action-btn">💳 View Payments</button>
          </div>
        </div>
      </div>
    </div>
  );
}