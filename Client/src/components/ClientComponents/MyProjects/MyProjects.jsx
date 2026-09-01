// src/components/ClientComponents/MyProjects/MyProjects.jsx
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import API from '../../../api/axios';
import './MyProjects.css';

/* ============================================================
   HELPERS
============================================================ */
const formatCurrency = (val) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val || 0);

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatFullDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const daysLeft = (deadline) => {
  if (!deadline) return null;
  return Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
};

const StatusPill = ({ status }) => {
  const map = {
    draft: { label: 'Draft', cls: 'mp-pill-gray' },
    open: { label: 'Open', cls: 'mp-pill-green' },
    active: { label: 'In Progress', cls: 'mp-pill-blue' },
    'in-progress': { label: 'In Progress', cls: 'mp-pill-blue' },
    completed: { label: 'Completed', cls: 'mp-pill-purple' },
    cancelled: { label: 'Cancelled', cls: 'mp-pill-red' },
    pending: { label: 'Pending', cls: 'mp-pill-amber' },
    accepted: { label: 'Accepted', cls: 'mp-pill-green' },
    rejected: { label: 'Rejected', cls: 'mp-pill-red' },
  };
  const b = map[status] || { label: status || 'Unknown', cls: 'mp-pill-gray' };
  return <span className={`mp-pill ${b.cls}`}>{b.label}</span>;
};

const TABS = [
  { id: 'all', label: 'All Projects', icon: '📁' },
  { id: 'draft', label: 'Drafts', icon: '📝' },
  { id: 'open', label: 'Open', icon: '📢' },
  { id: 'active', label: 'In Progress', icon: '⚡' },
  { id: 'completed', label: 'Completed', icon: '✅' },
  { id: 'cancelled', label: 'Cancelled', icon: '🚫' },
];

/* ============================================================
   MAIN COMPONENT
============================================================ */
export default function MyProjects() {
  const { user } = useAuth();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [clientId, setClientId] = useState(null);

  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // grid | list

  // Detail drawer
  const [detail, setDetail] = useState(null);

  // Action modals
  const [confirmAction, setConfirmAction] = useState(null); // { type, project }
  const [actionBusy, setActionBusy] = useState(false);

  /* ---------- Fetch Data ---------- */
  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;
      const currentUserId = user.userId || user._id;

      try {
        setLoading(true);
        setError('');

        // Resolve clientId
        let cid = currentUserId;
        try {
          const cRes = await API.get(`/clients?userId=${currentUserId}`);
          const cData = Array.isArray(cRes.data)
            ? cRes.data[0]
            : cRes.data?.data?.[0] || cRes.data?.data || cRes.data;
          cid = cData?.clientId || cData?._id || currentUserId;
        } catch { cid = currentUserId; }
        setClientId(cid);

        // Fetch projects, categories, applications, payments in parallel
        const [projRes, catRes, appRes, payRes] = await Promise.all([
          API.get(`/projects?clientId=${cid}`),
          API.get('/categories'),
          API.get(`/applications?clientId=${cid}`),
          API.get(`/payments?clientId=${cid}`),
        ]);

        const projList = projRes.data?.data || projRes.data || [];
        const catList = catRes.data?.data || catRes.data || [];
        const appList = appRes.data?.data || appRes.data || [];
        const payList = payRes.data?.data || payRes.data || [];

        const catMap = new Map(catList.map((c) => [c.categoryId || c._id, c]));

        // Application counts per project
        const appStats = {};
        appList.forEach((a) => {
          const pid = a.projectId?._id || a.projectId;
          if (!appStats[pid]) appStats[pid] = { total: 0, pending: 0, accepted: 0 };
          appStats[pid].total += 1;
          if (a.status === 'pending') appStats[pid].pending += 1;
          if (a.status === 'accepted') appStats[pid].accepted += 1;
        });

        // Payment totals per project
        const payStats = {};
        payList.forEach((p) => {
          const pid = p.projectId?._id || p.projectId;
          if (!payStats[pid]) payStats[pid] = { paid: 0, count: 0 };
          if (p.status === 'completed') payStats[pid].paid += p.amount || 0;
          payStats[pid].count += 1;
        });

        // Resolve freelancers
        const freelancerCache = new Map();
        const resolved = await Promise.all(
          projList.map(async (p) => {
            const pid = p.projectId || p._id;
            const fid = p.freelancerId?._id || p.freelancerId;
            const catObj = catMap.get(p.categoryId?._id || p.categoryId);
            const dLeft = daysLeft(p.deadline);
            const tasks = p.tasks || [];

            let freelancer = null;
            if (fid) {
              if (freelancerCache.has(fid)) {
                freelancer = freelancerCache.get(fid);
              } else {
                try {
                  const fRes = await API.get(`/freelancers/${fid}`);
                  const fData = fRes.data?.data || fRes.data;
                  const uid = fData?.userId?._id || fData?.userId;
                  let uData = null;
                  if (uid) {
                    try {
                      const uRes = await API.get(`/users/${uid}`);
                      uData = uRes.data?.data || uRes.data;
                    } catch { /* ignore */ }
                  }
                  freelancer = {
                    id: fid,
                    name: uData
                      ? `${uData.firstName || ''} ${uData.lastName || ''}`.trim() || uData.username
                      : 'Freelancer',
                    headline: fData?.headline || 'Professional Freelancer',
                    profileImage: uData?.profileImage || fData?.profileImage || '',
                    hourlyRate: fData?.hourlyRate || 0,
                    jobSuccessRate: fData?.jobSuccessRate || 0,
                    rating: fData?.dashboardStats?.averageRating || 0,
                    isTopRated: fData?.isTopRated || false,
                  };
                  freelancerCache.set(fid, freelancer);
                } catch { freelancer = null; }
              }
            }

            const completedTasks = tasks.filter((t) => t.status === 'completed').length;

            return {
              projectId: pid,
              raw: p,
              title: p.title || 'Untitled Project',
              description: p.description || '',
              categoryName: catObj?.name || 'General',
              categoryIcon: catObj?.icon || '📁',
              budget: p.budget || 0,
              status: p.status || 'draft',
              startDate: p.startDate,
              deadline: p.deadline,
              daysLeft: dLeft,
              isOverdue: dLeft !== null && dLeft < 0 && p.status !== 'completed',
              isUrgent: dLeft !== null && dLeft >= 0 && dLeft <= 7 && p.status === 'active',
              progress: p.progress || 0,
              tasks,
              totalTasks: tasks.length,
              completedTasks,
              freelancer,
              applications: appStats[pid] || { total: 0, pending: 0, accepted: 0 },
              payments: payStats[pid] || { paid: 0, count: 0 },
              metadata: p.metadata || {},
              createdAt: p.createdAt,
              updatedAt: p.updatedAt,
            };
          })
        );

        setProjects(resolved);
      } catch (err) {
        console.error('Failed to load projects:', err);
        setError('Failed to load your projects. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user]);

  /* ---------- Stats ---------- */
  const stats = useMemo(() => {
    const totalBudget = projects.reduce((s, p) => s + p.budget, 0);
    const totalSpent = projects.reduce((s, p) => s + p.payments.paid, 0);
    return {
      total: projects.length,
      draft: projects.filter((p) => p.status === 'draft').length,
      open: projects.filter((p) => p.status === 'open').length,
      active: projects.filter((p) => p.status === 'active' || p.status === 'in-progress').length,
      completed: projects.filter((p) => p.status === 'completed').length,
      cancelled: projects.filter((p) => p.status === 'cancelled').length,
      totalBudget,
      totalSpent,
      pendingApps: projects.reduce((s, p) => s + p.applications.pending, 0),
    };
  }, [projects]);

  const tabCounts = useMemo(() => ({
    all: stats.total,
    draft: stats.draft,
    open: stats.open,
    active: stats.active,
    completed: stats.completed,
    cancelled: stats.cancelled,
  }), [stats]);

  /* ---------- Filtered List ---------- */
  const filtered = useMemo(() => {
    let list = projects.filter((p) => {
      if (activeTab !== 'all') {
        if (activeTab === 'active') {
          if (p.status !== 'active' && p.status !== 'in-progress') return false;
        } else if (p.status !== activeTab) return false;
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !p.title.toLowerCase().includes(q) &&
          !p.description.toLowerCase().includes(q) &&
          !p.categoryName.toLowerCase().includes(q) &&
          !(p.freelancer?.name || '').toLowerCase().includes(q)
        ) return false;
      }

      return true;
    });

    list.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'budget-high') return b.budget - a.budget;
      if (sortBy === 'budget-low') return a.budget - b.budget;
      if (sortBy === 'progress') return b.progress - a.progress;
      if (sortBy === 'deadline') {
        if (a.daysLeft === null) return 1;
        if (b.daysLeft === null) return -1;
        return a.daysLeft - b.daysLeft;
      }
      return 0;
    });

    return list;
  }, [projects, activeTab, search, sortBy]);

  /* ---------- Actions ---------- */
  const handleAction = async () => {
    if (!confirmAction) return;
    const { type, project } = confirmAction;

    setActionBusy(true);
    try {
      if (type === 'publish') {
        await API.put(`/projects/${project.projectId}`, { status: 'open' });
        setProjects((prev) =>
          prev.map((p) => (p.projectId === project.projectId ? { ...p, status: 'open' } : p))
        );
      } else if (type === 'cancel') {
        await API.put(`/projects/${project.projectId}`, { status: 'cancelled' });
        setProjects((prev) =>
          prev.map((p) => (p.projectId === project.projectId ? { ...p, status: 'cancelled' } : p))
        );
      } else if (type === 'complete') {
        await API.put(`/projects/${project.projectId}`, { status: 'completed', progress: 100 });
        setProjects((prev) =>
          prev.map((p) =>
            p.projectId === project.projectId ? { ...p, status: 'completed', progress: 100 } : p
          )
        );
      } else if (type === 'delete') {
        await API.delete(`/projects/${project.projectId}`);
        setProjects((prev) => prev.filter((p) => p.projectId !== project.projectId));
      }

      setConfirmAction(null);
      setDetail(null);
    } catch (err) {
      console.error('Action failed:', err);
      setError(err.response?.data?.message || 'Action failed. Please try again.');
      setConfirmAction(null);
    } finally {
      setActionBusy(false);
    }
  };

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div className="mp-loading">
        <div className="mp-spinner" />
        <p>Loading your projects...</p>
      </div>
    );
  }

  return (
    <div className="mp-page">
      {/* ============ GRADIENT HERO ============ */}
      <div className="mp-hero">
        <div className="mp-hero-inner">
          <div className="mp-hero-text">
            <span className="mp-hero-badge">📂 Project Manager</span>
            <h1>My Projects</h1>
            <p>Track, manage and monitor all the projects you've posted on Skillora.</p>
          </div>
          <Link to="/client/post-project" className="mp-hero-btn">
            + Post New Project
          </Link>
        </div>
      </div>

      {/* ============ STATS STRIP ============ */}
      <div className="mp-stats-strip">
        <div className="mp-stat blue">
          <div className="mp-stat-icon">📁</div>
          <div>
            <span className="mp-stat-num">{stats.total}</span>
            <span className="mp-stat-lbl">Total Projects</span>
          </div>
        </div>
        <div className="mp-stat green">
          <div className="mp-stat-icon">⚡</div>
          <div>
            <span className="mp-stat-num">{stats.active}</span>
            <span className="mp-stat-lbl">In Progress</span>
          </div>
        </div>
        <div className="mp-stat purple">
          <div className="mp-stat-icon">✅</div>
          <div>
            <span className="mp-stat-num">{stats.completed}</span>
            <span className="mp-stat-lbl">Completed</span>
          </div>
        </div>
        <div className="mp-stat amber">
          <div className="mp-stat-icon">📩</div>
          <div>
            <span className="mp-stat-num">{stats.pendingApps}</span>
            <span className="mp-stat-lbl">Pending Proposals</span>
          </div>
        </div>
        <div className="mp-stat indigo">
          <div className="mp-stat-icon">💰</div>
          <div>
            <span className="mp-stat-num">{formatCurrency(stats.totalSpent)}</span>
            <span className="mp-stat-lbl">Total Spent</span>
          </div>
        </div>
      </div>

      <div className="mp-container">
        {error && (
          <div className="mp-alert">
            <span>⚠️</span>
            <p>{error}</p>
            <button onClick={() => setError('')}>×</button>
          </div>
        )}

        {/* ============ TABS ============ */}
        <div className="mp-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`mp-tab ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              <span className="mp-tab-icon">{t.icon}</span>
              {t.label}
              <span className="mp-tab-count">{tabCounts[t.id] ?? 0}</span>
            </button>
          ))}
        </div>

        {/* ============ TOOLBAR ============ */}
        <div className="mp-toolbar">
          <div className="mp-search">
            <span className="mp-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by title, description, category or freelancer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="mp-search-clear" onClick={() => setSearch('')}>×</button>
            )}
          </div>

          <select
            className="mp-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="budget-high">Budget: High to Low</option>
            <option value="budget-low">Budget: Low to High</option>
            <option value="progress">Progress: Most Complete</option>
            <option value="deadline">Deadline: Soonest</option>
          </select>

          <div className="mp-view-toggle">
            <button
              className={viewMode === 'grid' ? 'active' : ''}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              ▦
            </button>
            <button
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              ☰
            </button>
          </div>
        </div>

        <div className="mp-count">
          Showing <strong>{filtered.length}</strong> of <strong>{projects.length}</strong> projects
        </div>

        {/* ============ PROJECT LIST ============ */}
        {filtered.length === 0 ? (
          <div className="mp-empty">
            <div className="mp-empty-icon">
              {projects.length === 0 ? '🚀' : '🔍'}
            </div>
            <h3>
              {projects.length === 0
                ? "You haven't posted any projects yet"
                : 'No projects match your filters'}
            </h3>
            <p>
              {projects.length === 0
                ? 'Post your first project and start receiving proposals from talented freelancers.'
                : 'Try changing the tab, adjusting your search, or resetting filters.'}
            </p>
            {projects.length === 0 ? (
              <Link to="/client/post-project" className="mp-btn mp-btn-primary">
                🚀 Post Your First Project
              </Link>
            ) : (
              <button
                className="mp-btn mp-btn-outline"
                onClick={() => { setSearch(''); setActiveTab('all'); }}
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className={`mp-list ${viewMode}`}>
            {filtered.map((p) => (
              <div
                key={p.projectId}
                className={`mp-card ${p.isOverdue ? 'overdue' : ''}`}
                onClick={() => setDetail(p)}
              >
                {/* Card Head */}
                <div className="mp-card-head">
                  <div className="mp-card-badges">
                    <span className="mp-cat-badge">
                      {p.categoryIcon} {p.categoryName}
                    </span>
                    <StatusPill status={p.status} />
                    {p.isOverdue && <span className="mp-pill mp-pill-red">Overdue</span>}
                    {p.isUrgent && <span className="mp-pill mp-pill-amber">Due Soon</span>}
                  </div>
                  <div className="mp-card-budget">{formatCurrency(p.budget)}</div>
                </div>

                {/* Title & Desc */}
                <h3 className="mp-card-title">{p.title}</h3>
                <p className="mp-card-desc">
                  {p.description.length > 140
                    ? `${p.description.slice(0, 140)}...`
                    : p.description}
                </p>

                {/* Progress */}
                <div className="mp-progress-block">
                  <div className="mp-progress-head">
                    <span>Progress</span>
                    <strong>{p.progress}%</strong>
                  </div>
                  <div className="mp-progress-bar">
                    <div
                      className={`mp-progress-fill ${p.status === 'completed' ? 'done' : ''}`}
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                  {p.totalTasks > 0 && (
                    <span className="mp-task-count">
                      {p.completedTasks} of {p.totalTasks} tasks completed
                    </span>
                  )}
                </div>

                {/* Freelancer */}
                <div className="mp-freelancer-row">
                  {p.freelancer ? (
                    <>
                      <div className="mp-fl-avatar">
                        {p.freelancer.profileImage ? (
                          <img src={p.freelancer.profileImage} alt={p.freelancer.name} />
                        ) : (
                          p.freelancer.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="mp-fl-info">
                        <strong>{p.freelancer.name}</strong>
                        <span>
                          ⭐ {p.freelancer.rating.toFixed(1)} · {p.freelancer.jobSuccessRate}% success
                        </span>
                      </div>
                      {p.freelancer.isTopRated && (
                        <span className="mp-top-rated">Top Rated</span>
                      )}
                    </>
                  ) : (
                    <div className="mp-no-freelancer">
                      <span className="mp-nf-icon">👤</span>
                      <span>No freelancer assigned yet</span>
                    </div>
                  )}
                </div>

                {/* Footer Metrics */}
                <div className="mp-card-footer">
                  <div className="mp-metric">
                    <span className="mp-m-label">Deadline</span>
                    <strong className={p.isOverdue ? 'danger' : ''}>
                      {formatDate(p.deadline)}
                    </strong>
                  </div>
                  <div className="mp-metric">
                    <span className="mp-m-label">Time Left</span>
                    <strong className={p.isOverdue ? 'danger' : p.isUrgent ? 'warn' : ''}>
                      {p.daysLeft === null
                        ? '—'
                        : p.daysLeft < 0
                        ? `${Math.abs(p.daysLeft)}d overdue`
                        : `${p.daysLeft} days`}
                    </strong>
                  </div>
                  <div className="mp-metric">
                    <span className="mp-m-label">Proposals</span>
                    <strong>
                      {p.applications.total}
                      {p.applications.pending > 0 && (
                        <span className="mp-new-dot">{p.applications.pending} new</span>
                      )}
                    </strong>
                  </div>
                  <div className="mp-metric">
                    <span className="mp-m-label">Paid</span>
                    <strong className="success">{formatCurrency(p.payments.paid)}</strong>
                  </div>
                </div>

                <div className="mp-card-cta">View Full Details →</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============ DETAIL DRAWER ============ */}
      {detail && (
        <div className="mp-drawer-overlay" onClick={() => setDetail(null)}>
          <div className="mp-drawer" onClick={(e) => e.stopPropagation()}>
            {/* Drawer Header */}
            <div className="mp-drawer-head">
              <button className="mp-drawer-close" onClick={() => setDetail(null)}>
                ✕
              </button>
              <div className="mp-drawer-badges">
                <span className="mp-cat-badge light">
                  {detail.categoryIcon} {detail.categoryName}
                </span>
                <StatusPill status={detail.status} />
              </div>
              <h2>{detail.title}</h2>
              <div className="mp-drawer-meta">
                <span>📅 Created {formatDate(detail.createdAt)}</span>
                <span>•</span>
                <span>🔄 Updated {formatDate(detail.updatedAt)}</span>
              </div>
            </div>

            <div className="mp-drawer-body">
              {/* Key Stats */}
              <div className="mp-d-stats">
                <div>
                  <span>Budget</span>
                  <strong className="green">{formatCurrency(detail.budget)}</strong>
                </div>
                <div>
                  <span>Paid</span>
                  <strong>{formatCurrency(detail.payments.paid)}</strong>
                </div>
                <div>
                  <span>Progress</span>
                  <strong>{detail.progress}%</strong>
                </div>
                <div>
                  <span>Proposals</span>
                  <strong>{detail.applications.total}</strong>
                </div>
              </div>

              {/* Timeline */}
              <section className="mp-d-section">
                <h4>📆 Timeline</h4>
                <div className="mp-timeline">
                  <div className="mp-tl-item">
                    <span className="mp-tl-dot start" />
                    <div>
                      <strong>Start Date</strong>
                      <span>{formatFullDate(detail.startDate)}</span>
                    </div>
                  </div>
                  <div className="mp-tl-line" />
                  <div className="mp-tl-item">
                    <span className={`mp-tl-dot ${detail.isOverdue ? 'overdue' : 'end'}`} />
                    <div>
                      <strong>Deadline</strong>
                      <span className={detail.isOverdue ? 'danger' : ''}>
                        {formatFullDate(detail.deadline)}
                        {detail.daysLeft !== null && (
                          <em>
                            {detail.daysLeft < 0
                              ? ` (${Math.abs(detail.daysLeft)} days overdue)`
                              : ` (${detail.daysLeft} days left)`}
                          </em>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mp-d-progress">
                  <div className="mp-progress-bar lg">
                    <div
                      className={`mp-progress-fill ${detail.status === 'completed' ? 'done' : ''}`}
                      style={{ width: `${detail.progress}%` }}
                    />
                  </div>
                  <span>{detail.progress}% Complete</span>
                </div>
              </section>

              {/* Description */}
              <section className="mp-d-section">
                <h4>📄 Description</h4>
                <p className="mp-d-text">{detail.description}</p>
              </section>

              {/* Specifications */}
              {(detail.metadata.projectType ||
                detail.metadata.requiredSkills?.length > 0 ||
                detail.metadata.workRequirements ||
                detail.metadata.additionalNotes) && (
                <section className="mp-d-section">
                  <h4>⚙️ Specifications</h4>

                  {detail.metadata.projectType && (
                    <div className="mp-spec-row">
                      <span>Payment Model</span>
                      <strong>{detail.metadata.projectType}</strong>
                    </div>
                  )}

                  {detail.metadata.requiredSkills?.length > 0 && (
                    <div className="mp-spec-block">
                      <span>Required Skills</span>
                      <div className="mp-chips">
                        {detail.metadata.requiredSkills.map((s, i) => (
                          <span key={i} className="mp-chip">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {detail.metadata.workRequirements && (
                    <div className="mp-spec-block">
                      <span>Deliverables & Requirements</span>
                      <p className="mp-d-text sm">{detail.metadata.workRequirements}</p>
                    </div>
                  )}

                  {detail.metadata.additionalNotes && (
                    <div className="mp-spec-block">
                      <span>Additional Notes</span>
                      <p className="mp-d-text sm">{detail.metadata.additionalNotes}</p>
                    </div>
                  )}
                </section>
              )}

              {/* Freelancer */}
              <section className="mp-d-section">
                <h4>👤 Assigned Freelancer</h4>
                {detail.freelancer ? (
                  <div className="mp-d-freelancer">
                    <div className="mp-fl-avatar lg">
                      {detail.freelancer.profileImage ? (
                        <img src={detail.freelancer.profileImage} alt={detail.freelancer.name} />
                      ) : (
                        detail.freelancer.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="mp-d-fl-info">
                      <div className="mp-d-fl-name">
                        <strong>{detail.freelancer.name}</strong>
                        {detail.freelancer.isTopRated && (
                          <span className="mp-top-rated">⭐ Top Rated</span>
                        )}
                      </div>
                      <p>{detail.freelancer.headline}</p>
                      <div className="mp-d-fl-stats">
                        <span>⭐ {detail.freelancer.rating.toFixed(1)} rating</span>
                        <span>•</span>
                        <span>{detail.freelancer.jobSuccessRate}% job success</span>
                        <span>•</span>
                        <span>{formatCurrency(detail.freelancer.hourlyRate)}/hr</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mp-d-empty">
                    <span>👤</span>
                    <div>
                      <strong>No freelancer assigned</strong>
                      <p>
                        {detail.applications.pending > 0
                          ? `You have ${detail.applications.pending} pending proposal(s) waiting for review.`
                          : 'Waiting for freelancers to apply to your project.'}
                      </p>
                    </div>
                    {detail.applications.pending > 0 && (
                      <Link to="/client/applications" className="mp-btn mp-btn-sm">
                        Review Proposals
                      </Link>
                    )}
                  </div>
                )}
              </section>

              {/* Tasks */}
              <section className="mp-d-section">
                <h4>
                  📋 Tasks
                  <span className="mp-count-tag">
                    {detail.completedTasks}/{detail.totalTasks} done
                  </span>
                </h4>
                {detail.tasks.length === 0 ? (
                  <div className="mp-d-empty simple">
                    <span>📋</span>
                    <p>No tasks have been created for this project yet.</p>
                  </div>
                ) : (
                  <div className="mp-task-list">
                    {detail.tasks.map((task, idx) => (
                      <div key={task.taskId || idx} className="mp-task">
                        <div className="mp-task-head">
                          <div>
                            <strong>{task.title}</strong>
                            {task.description && <p>{task.description}</p>}
                          </div>
                          <div className="mp-task-badges">
                            <StatusPill status={task.status} />
                            {task.priority && (
                              <span className={`mp-prio mp-prio-${task.priority}`}>
                                {task.priority}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mp-task-metrics">
                          {task.budget > 0 && (
                            <span>💰 {formatCurrency(task.budget)}</span>
                          )}
                          {task.deadline && <span>🎯 {formatDate(task.deadline)}</span>}
                          {task.workRange && <span>📏 {task.workRange}</span>}
                        </div>

                        <div className="mp-task-progress">
                          <div className="mp-progress-bar sm">
                            <div
                              className="mp-progress-fill"
                              style={{ width: `${task.progress || 0}%` }}
                            />
                          </div>
                          <span>{task.progress || 0}%</span>
                        </div>

                        {task.clientNote && (
                          <div className="mp-note client">
                            <strong>Your Note:</strong> {task.clientNote}
                          </div>
                        )}
                        {task.freelancerNote && (
                          <div className="mp-note freelancer">
                            <strong>Freelancer:</strong> {task.freelancerNote}
                          </div>
                        )}

                        {task.sections?.length > 0 && (
                          <div className="mp-sections">
                            <span className="mp-sec-title">
                              Sections ({task.sections.length})
                            </span>
                            {task.sections
                              .slice()
                              .sort((a, b) => (a.order || 0) - (b.order || 0))
                              .map((sec, si) => (
                                <div key={sec.sectionId || si} className="mp-section">
                                  <span className="mp-sec-num">{sec.order || si + 1}</span>
                                  <div className="mp-sec-info">
                                    <strong>{sec.title}</strong>
                                    {sec.description && <p>{sec.description}</p>}
                                    <div className="mp-sec-foot">
                                      <div className="mp-progress-bar xs">
                                        <div
                                          className="mp-progress-fill"
                                          style={{ width: `${sec.progress || 0}%` }}
                                        />
                                      </div>
                                      <span>
                                        {sec.progress || 0}% · Due {formatDate(sec.dueDate)}
                                      </span>
                                    </div>
                                  </div>
                                  <StatusPill status={sec.status} />
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Applications Summary */}
              <section className="mp-d-section">
                <h4>📩 Applications Overview</h4>
                <div className="mp-app-summary">
                  <div className="mp-app-stat">
                    <strong>{detail.applications.total}</strong>
                    <span>Total Received</span>
                  </div>
                  <div className="mp-app-stat amber">
                    <strong>{detail.applications.pending}</strong>
                    <span>Pending Review</span>
                  </div>
                  <div className="mp-app-stat green">
                    <strong>{detail.applications.accepted}</strong>
                    <span>Accepted</span>
                  </div>
                </div>
                {detail.applications.total > 0 && (
                  <Link to="/client/applications" className="mp-btn mp-btn-outline full">
                    View All Proposals →
                  </Link>
                )}
              </section>

              {/* Payments Summary */}
              <section className="mp-d-section">
                <h4>💳 Payment Summary</h4>
                <div className="mp-pay-box">
                  <div>
                    <span>Total Budget</span>
                    <strong>{formatCurrency(detail.budget)}</strong>
                  </div>
                  <div>
                    <span>Amount Paid</span>
                    <strong className="green">{formatCurrency(detail.payments.paid)}</strong>
                  </div>
                  <div>
                    <span>Remaining</span>
                    <strong className="amber">
                      {formatCurrency(Math.max(0, detail.budget - detail.payments.paid))}
                    </strong>
                  </div>
                </div>
                <div className="mp-pay-bar">
                  <div
                    className="mp-pay-fill"
                    style={{
                      width: `${detail.budget > 0
                        ? Math.min(100, (detail.payments.paid / detail.budget) * 100)
                        : 0}%`,
                    }}
                  />
                </div>
                <span className="mp-pay-note">
                  {detail.payments.count} transaction{detail.payments.count !== 1 ? 's' : ''} recorded
                </span>
              </section>
            </div>

            {/* Drawer Footer Actions */}
            <div className="mp-drawer-foot">
              {detail.status === 'draft' && (
                <>
                  <button
                    className="mp-btn mp-btn-danger-ghost"
                    onClick={() => setConfirmAction({ type: 'delete', project: detail })}
                  >
                    🗑 Delete
                  </button>
                  <button
                    className="mp-btn mp-btn-primary"
                    onClick={() => setConfirmAction({ type: 'publish', project: detail })}
                  >
                    🚀 Publish Project
                  </button>
                </>
              )}

              {detail.status === 'open' && (
                <>
                  <button
                    className="mp-btn mp-btn-danger-ghost"
                    onClick={() => setConfirmAction({ type: 'cancel', project: detail })}
                  >
                    Cancel Project
                  </button>
                  <Link to="/client/applications" className="mp-btn mp-btn-primary">
                    Review Proposals →
                  </Link>
                </>
              )}

              {(detail.status === 'active' || detail.status === 'in-progress') && (
                <>
                  <button
                    className="mp-btn mp-btn-danger-ghost"
                    onClick={() => setConfirmAction({ type: 'cancel', project: detail })}
                  >
                    Cancel Project
                  </button>
                  <button
                    className="mp-btn mp-btn-success"
                    onClick={() => setConfirmAction({ type: 'complete', project: detail })}
                  >
                    ✓ Mark as Completed
                  </button>
                </>
              )}

              {(detail.status === 'completed' || detail.status === 'cancelled') && (
                <button className="mp-btn mp-btn-outline full" onClick={() => setDetail(null)}>
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============ CONFIRM MODAL ============ */}
      {confirmAction && (
        <div
          className="mp-modal-overlay"
          onClick={() => !actionBusy && setConfirmAction(null)}
        >
          <div className="mp-modal" onClick={(e) => e.stopPropagation()}>
            <div className={`mp-modal-icon ${confirmAction.type}`}>
              {confirmAction.type === 'publish' && '🚀'}
              {confirmAction.type === 'cancel' && '⚠️'}
              {confirmAction.type === 'complete' && '✅'}
              {confirmAction.type === 'delete' && '🗑️'}
            </div>

            <h3>
              {confirmAction.type === 'publish' && 'Publish this project?'}
              {confirmAction.type === 'cancel' && 'Cancel this project?'}
              {confirmAction.type === 'complete' && 'Mark as completed?'}
              {confirmAction.type === 'delete' && 'Delete this project?'}
            </h3>

            <p>
              {confirmAction.type === 'publish' &&
                `"${confirmAction.project.title}" will go live and freelancers can start submitting proposals immediately.`}
              {confirmAction.type === 'cancel' &&
                `"${confirmAction.project.title}" will be cancelled. Any active work will be stopped and freelancers will be notified.`}
              {confirmAction.type === 'complete' &&
                `"${confirmAction.project.title}" will be marked 100% complete. Make sure all deliverables have been received and approved.`}
              {confirmAction.type === 'delete' &&
                `"${confirmAction.project.title}" will be permanently deleted. This action cannot be undone.`}
            </p>

            <div className="mp-modal-actions">
              <button
                className="mp-btn mp-btn-outline"
                onClick={() => setConfirmAction(null)}
                disabled={actionBusy}
              >
                Keep It
              </button>
              <button
                className={`mp-btn ${
                  confirmAction.type === 'delete' || confirmAction.type === 'cancel'
                    ? 'mp-btn-danger'
                    : confirmAction.type === 'complete'
                    ? 'mp-btn-success'
                    : 'mp-btn-primary'
                }`}
                onClick={handleAction}
                disabled={actionBusy}
              >
                {actionBusy
                  ? 'Processing...'
                  : confirmAction.type === 'publish'
                  ? 'Yes, Publish'
                  : confirmAction.type === 'cancel'
                  ? 'Yes, Cancel'
                  : confirmAction.type === 'complete'
                  ? 'Yes, Complete'
                  : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}