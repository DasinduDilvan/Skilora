// src/components/ClientComponents/Dashboard/Dashboard.jsx
import { useAuth } from '../../../context/AuthContext';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();

  const stats = [
    { label: 'Active Projects', value: '8', icon: '📁', color: '#3b82f6' },
    { label: 'Pending Applications', value: '24', icon: '📨', color: '#f59e0b' },
    { label: 'Hired Freelancers', value: '12', icon: '👥', color: '#10b981' },
    { label: 'Total Spent', value: '$4,850', icon: '💰', color: '#8b5cf6' },
  ];

  const recentProjects = [
    { title: 'E-commerce Website Redesign', status: 'In Progress', budget: '$1,200' },
    { title: 'Mobile App UI/UX', status: 'Open', budget: '$800' },
    { title: 'Brand Logo Design', status: 'Completed', budget: '$300' },
  ];

  return (
    <div className="client-dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name || 'Client'} 👋</h1>
        <p>Here's what's happening with your projects today.</p>
      </div>

      <div className="stats-grid">
        {stats.map((s, i) => (
          <div key={i} className="stat-card" style={{ borderTopColor: s.color }}>
            <div className="stat-icon" style={{ background: `${s.color}20` }}>
              {s.icon}
            </div>
            <div className="stat-info">
              <h3>{s.value}</h3>
              <p>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2>Recent Projects</h2>
          <div className="project-list">
            {recentProjects.map((p, i) => (
              <div key={i} className="project-item">
                <div>
                  <h4>{p.title}</h4>
                  <span className={`status status-${p.status.toLowerCase().replace(' ', '-')}`}>
                    {p.status}
                  </span>
                </div>
                <div className="project-budget">{p.budget}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <button className="action-btn">➕ Post New Project</button>
            <button className="action-btn">🔍 Browse Freelancers</button>
            <button className="action-btn">📊 View Reports</button>
            <button className="action-btn">💳 Manage Payments</button>
          </div>
        </div>
      </div>
    </div>
  );
}