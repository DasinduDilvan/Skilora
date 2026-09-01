// src/components/ClientComponents/Dashboard/Dashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import API from '../../../api/axios';
import './Dashboard.css';

/* ---------- Utility Helpers ---------- */
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val || 0);

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const StatusBadge = ({ status }) => {
  const map = {
    draft: { label: 'Draft', cls: 'badge-gray' },
    open: { label: 'Open', cls: 'badge-blue' },
    active: { label: 'Active', cls: 'badge-green' },
    'in-progress': { label: 'In Progress', cls: 'badge-green' },
    completed: { label: 'Completed', cls: 'badge-purple' },
    cancelled: { label: 'Cancelled', cls: 'badge-red' },
    pending: { label: 'Pending', cls: 'badge-yellow' },
    accepted: { label: 'Accepted', cls: 'badge-green' },
    rejected: { label: 'Rejected', cls: 'badge-red' },
    withdrawn: { label: 'Withdrawn', cls: 'badge-gray' },
  };
  const badge = map[status] || { label: status || 'Unknown', cls: 'badge-gray' };
  return <span className={`cl-badge ${badge.cls}`}>{badge.label}</span>;
};

export default function Dashboard() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    pendingApplications: 0,
    totalSpent: 0,
  });
  const [projects, setProjects] = useState([]);
  const [applications, setApplications] = useState([]);
  const [payments, setPayments] = useState({
    totalSpent: 0,
    recentAmount: 0,
    recentStatus: '—',
    recentMethod: '—',
    recentDate: null,
  });

  const displayName =
    user?.firstName ||
    user?.name ||
    user?.username ||
    (user?.email ? user.email.split('@')[0] : 'Client');

  /* ---------- Fetch Dashboard Data ---------- */
  useEffect(() => {
    const fetchDashboard = async () => {
      if (!user?.userId && !user?._id) return;
      const currentUserId = user.userId || user._id;

      try {
        setLoading(true);
        setError(null);

        // 1. Resolve client profile (get clientId from userId)
        let clientId = currentUserId;
        try {
          const clientRes = await API.get(`/clients?userId=${currentUserId}`);
          const clientData = Array.isArray(clientRes.data)
            ? clientRes.data[0]
            : clientRes.data?.data?.[0] || clientRes.data?.data || clientRes.data;
          clientId = clientData?.clientId || clientData?._id || currentUserId;
        } catch {
          clientId = currentUserId;
        }

        // 2. Fetch projects, applications, payments in parallel
        const [projectsRes, applicationsRes, paymentsRes] = await Promise.all([
          API.get(`/projects?clientId=${clientId}`),
          API.get(`/applications?clientId=${clientId}`),
          API.get(`/payments?clientId=${clientId}`),
        ]);

        const projectList = projectsRes.data?.data || projectsRes.data || [];
        const applicationList = applicationsRes.data?.data || applicationsRes.data || [];
        const paymentList = paymentsRes.data?.data || paymentsRes.data || [];

        /* ---------- Compute Stats ---------- */
        const totalProjects = projectList.length;
        const activeProjects = projectList.filter(
          (p) => p.status === 'active' || p.status === 'in-progress'
        ).length;
        const completedProjects = projectList.filter((p) => p.status === 'completed').length;
        const pendingApplications = applicationList.filter((a) => a.status === 'pending').length;
        const totalSpent = paymentList
          .filter((p) => p.status === 'completed')
          .reduce((sum, p) => sum + (p.amount || 0), 0);

        setStats({
          totalProjects,
          activeProjects,
          completedProjects,
          pendingApplications,
          totalSpent,
        });

        /* ---------- Latest Payment ---------- */
        const sortedPayments = [...paymentList].sort(
          (a, b) => new Date(b.paidAt || b.createdAt) - new Date(a.paidAt || a.createdAt)
        );
        const latestPayment = sortedPayments[0];

        setPayments({
          totalSpent,
          recentAmount: latestPayment?.amount || 0,
          recentStatus: latestPayment?.status || '—',
          recentMethod: latestPayment?.paymentMethod || '—',
          recentDate: latestPayment?.paidAt || latestPayment?.createdAt || null,
        });

        /* ---------- Recent Projects ---------- */
        const recentProjects = [...projectList]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 4);

        const projectsWithNames = await Promise.all(
          recentProjects.map(async (p) => {
            let freelancerName = 'Unassigned';
            const fid = p.freelancerId?._id || p.freelancerId;
            if (fid) {
              try {
                const uRes = await API.get(`/users/${fid}`);
                const uData = uRes.data?.data || uRes.data;
                freelancerName =
                  `${uData?.firstName || ''} ${uData?.lastName || ''}`.trim() ||
                  uData?.username ||
                  'Freelancer';
              } catch {
                freelancerName = 'Freelancer';
              }
            }
            return {
              projectId: p.projectId || p._id,
              title: p.title,
              category: p.categoryId?.name || p.categoryName || 'General',
              freelancer: freelancerName,
              budget: p.budget || 0,
              deadline: p.deadline,
              progress: p.progress || 0,
              status: p.status || 'open',
            };
          })
        );
        setProjects(projectsWithNames);

        /* ---------- Recent Applications ---------- */
        const recentApplications = [...applicationList]
          .sort(
            (a, b) => new Date(b.appliedAt || b.createdAt) - new Date(a.appliedAt || a.createdAt)
          )
          .slice(0, 3);

        const applicationsResolved = await Promise.all(
          recentApplications.map(async (app) => {
            let freelancerName = 'Freelancer';
            let projectTitle = 'Project';

            const fid = app.freelancerId?._id || app.freelancerId;
            if (fid) {
              try {
                const uRes = await API.get(`/users/${fid}`);
                const uData = uRes.data?.data || uRes.data;
                freelancerName =
                  `${uData?.firstName || ''} ${uData?.lastName || ''}`.trim() ||
                  uData?.username ||
                  'Freelancer';
              } catch { /* ignore */ }
            }

            const pid = app.projectId?._id || app.projectId;
            if (pid) {
              try {
                const pRes = await API.get(`/projects/${pid}`);
                const pData = pRes.data?.data || pRes.data;
                projectTitle = pData?.title || 'Project';
              } catch { /* ignore */ }
            }

            return {
              applicationId: app.applicationId || app._id,
              freelancerName,
              projectTitle,
              proposedBudget: app.proposedBudget || 0,
              estimatedDuration: `${app.estimatedDuration || 0} ${app.durationUnit || 'days'}`,
              appliedAt: app.appliedAt || app.createdAt,
              status: app.status || 'pending',
            };
          })
        );
        setApplications(applicationsResolved);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError(
          err.response?.data?.message || err.message || 'Failed to load dashboard data.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user]);

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div className="cl-dash-loading">
        <div className="cl-spinner" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  /* ---------- Render ---------- */
  return (
    <div className="cl-dashboard-page">
      {/* Gradient Page Header */}
      <div className="cl-dash-hero">
        <div className="cl-dash-hero-inner">
          <div className="cl-dash-hero-text">
            <h1>{getGreeting()}, {displayName} 👋</h1>
            <p>Manage your projects, applications, freelancers, and payments from one place.</p>
          </div>
          <div className="cl-dash-hero-actions">
            <Link to="/client/post-project" className="cl-btn-hero-white">
              + Post a Project
            </Link>
            <Link to="/client/freelancers" className="cl-btn-hero-outline">
              Browse Freelancers
            </Link>
          </div>
        </div>
      </div>

      <div className="cl-dashboard">
        {error && <div className="cl-dash-alert">{error}</div>}

        {/* Statistics Cards */}
        <section className="cl-stats-grid">
          <div className="cl-stat-card border-blue">
            <span className="cl-stat-label">Total Projects</span>
            <span className="cl-stat-value">{stats.totalProjects}</span>
          </div>
          <div className="cl-stat-card border-green">
            <span className="cl-stat-label">Active Projects</span>
            <span className="cl-stat-value">{stats.activeProjects}</span>
          </div>
          <div className="cl-stat-card border-purple">
            <span className="cl-stat-label">Completed Projects</span>
            <span className="cl-stat-value">{stats.completedProjects}</span>
          </div>
          <div className="cl-stat-card border-amber">
            <span className="cl-stat-label">Pending Applications</span>
            <span className="cl-stat-value">{stats.pendingApplications}</span>
          </div>
          <div className="cl-stat-card border-indigo">
            <span className="cl-stat-label">Total Spent</span>
            <span className="cl-stat-value">{formatCurrency(stats.totalSpent)}</span>
          </div>
        </section>

        {/* Main Grid */}
        <div className="cl-dash-layout">
          {/* Left Column */}
          <div className="cl-dash-main">
            {/* Recent Projects */}
            <section className="cl-card">
              <div className="cl-card-head">
                <h2>Recent Projects</h2>
                <Link to="/client/my-projects" className="cl-link">View all →</Link>
              </div>
              <div className="cl-project-list">
                {projects.length === 0 ? (
                  <div className="cl-empty-inline">
                    No projects yet.{' '}
                    <Link to="/client/post-project" className="cl-link">
                      Post your first project →
                    </Link>
                  </div>
                ) : (
                  projects.map((project) => (
                    <div key={project.projectId} className="cl-project-item">
                      <div className="cl-project-header">
                        <div>
                          <h3 className="cl-project-title">{project.title}</h3>
                          <div className="cl-project-meta">
                            <span>{project.category}</span>
                            <span>•</span>
                            <span>Freelancer: <strong>{project.freelancer}</strong></span>
                          </div>
                        </div>
                        <StatusBadge status={project.status} />
                      </div>

                      <div className="cl-project-metrics">
                        <div>
                          <span className="cl-sub-label">Budget:</span>{' '}
                          <strong>{formatCurrency(project.budget)}</strong>
                        </div>
                        <div>
                          <span className="cl-sub-label">Deadline:</span>{' '}
                          <strong>{formatDate(project.deadline)}</strong>
                        </div>
                      </div>

                      <div className="cl-progress-wrap">
                        <div className="cl-progress-bar">
                          <div className="cl-progress-fill" style={{ width: `${project.progress}%` }} />
                        </div>
                        <span className="cl-progress-text">{project.progress}% Complete</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Recent Applications */}
            <section className="cl-card">
              <div className="cl-card-head">
                <h2>Recent Applications</h2>
                <Link to="/client/applications" className="cl-link">View all →</Link>
              </div>
              <div className="cl-app-list">
                {applications.length === 0 ? (
                  <div className="cl-empty-inline">No applications received yet.</div>
                ) : (
                  applications.map((app) => (
                    <div key={app.applicationId} className="cl-app-item">
                      <div className="cl-app-freelancer">
                        <div className="cl-avatar-thumb">
                          {app.freelancerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="cl-app-name">{app.freelancerName}</h4>
                          <p className="cl-app-project-link">{app.projectTitle}</p>
                          <span className="cl-app-meta">
                            {formatCurrency(app.proposedBudget)} • {app.estimatedDuration} •{' '}
                            {formatDate(app.appliedAt)}
                          </span>
                        </div>
                      </div>
                      <div className="cl-app-actions">
                        <StatusBadge status={app.status} />
                        <Link to="/client/applications" className="cl-btn-sm">Review</Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="cl-dash-sidebar">
            {/* Payment Summary */}
            <section className="cl-card">
              <div className="cl-card-head">
                <h2>Payment Summary</h2>
                <Link to="/client/payments" className="cl-link">Details →</Link>
              </div>
              <div className="cl-payment-box">
                <span className="cl-payment-label">Total Amount Spent</span>
                <span className="cl-payment-figure">{formatCurrency(payments.totalSpent)}</span>
              </div>
              <div className="cl-payment-details">
                <div className="cl-payment-row">
                  <span>Latest Payment</span>
                  <strong>{formatCurrency(payments.recentAmount)}</strong>
                </div>
                <div className="cl-payment-row">
                  <span>Status</span>
                  <StatusBadge status={payments.recentStatus} />
                </div>
                <div className="cl-payment-row">
                  <span>Method</span>
                  <strong>{payments.recentMethod}</strong>
                </div>
                <div className="cl-payment-row">
                  <span>Date</span>
                  <strong>{formatDate(payments.recentDate)}</strong>
                </div>
              </div>
            </section>

            {/* Quick Actions */}
            <section className="cl-card">
              <div className="cl-card-head">
                <h2>Quick Actions</h2>
              </div>
              <div className="cl-quick-grid">
                <Link to="/client/post-project" className="cl-quick-item">
                  <span className="cl-quick-icon bg-indigo">+</span>
                  <div>
                    <div className="cl-quick-title">Post a Project</div>
                    <div className="cl-quick-desc">Create a new job posting</div>
                  </div>
                </Link>
                <Link to="/client/browse-projects" className="cl-quick-item">
                  <span className="cl-quick-icon bg-blue">🔍</span>
                  <div>
                    <div className="cl-quick-title">Browse Projects</div>
                    <div className="cl-quick-desc">Explore marketplace posts</div>
                  </div>
                </Link>
                <Link to="/client/freelancers" className="cl-quick-item">
                  <span className="cl-quick-icon bg-amber">👥</span>
                  <div>
                    <div className="cl-quick-title">Find Freelancers</div>
                    <div className="cl-quick-desc">Discover vetted talent</div>
                  </div>
                </Link>
                <Link to="/client/applications" className="cl-quick-item">
                  <span className="cl-quick-icon bg-purple">📩</span>
                  <div>
                    <div className="cl-quick-title">Applications</div>
                    <div className="cl-quick-desc">Review incoming proposals</div>
                  </div>
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}