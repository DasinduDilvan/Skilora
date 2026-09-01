// src/components/ClientComponents/Applications/Applications.jsx
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import API from '../../../api/axios';
import './Applications.css';

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
    pending: { label: 'Pending', cls: 'badge-yellow' },
    accepted: { label: 'Accepted', cls: 'badge-green' },
    rejected: { label: 'Rejected', cls: 'badge-red' },
    withdrawn: { label: 'Withdrawn', cls: 'badge-gray' },
  };
  const badge = map[status] || { label: status || 'Pending', cls: 'badge-gray' };
  return <span className={`cl-badge ${badge.cls}`}>{badge.label}</span>;
};

export default function Applications() {
  const { user } = useAuth();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Modals
  const [selectedApp, setSelectedApp] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionSubmitting, setActionSubmitting] = useState(false);

  /* ---------- Fetch Applications ---------- */
  useEffect(() => {
    const fetchApplicationsData = async () => {
      if (!user) return;
      const currentUserId = user.userId || user._id;

      try {
        setLoading(true);
        setError('');

        // Resolve clientId
        let clientId = currentUserId;
        try {
          const clientRes = await API.get(`/clients?userId=${currentUserId}`);
          const clientData = Array.isArray(clientRes.data)
            ? clientRes.data[0]
            : clientRes.data?.data?.[0] || clientRes.data?.data || clientRes.data;
          clientId = clientData?.clientId || clientData?._id || currentUserId;
        } catch { clientId = currentUserId; }

        // Projects map
        const projectsRes = await API.get(`/projects?clientId=${clientId}`);
        const projectsList = projectsRes.data?.data || projectsRes.data || [];
        const projectsMap = new Map(projectsList.map((p) => [p.projectId || p._id, p]));

        // Applications
        const appsRes = await API.get(`/applications?clientId=${clientId}`);
        const appsRaw = appsRes.data?.data || appsRes.data || [];

        const resolvedApps = await Promise.all(
          appsRaw.map(async (app) => {
            const projId = app.projectId?._id || app.projectId;
            const project = projectsMap.get(projId);
            const projectTitle = project?.title || 'Unknown Project';

            let freelancerInfo = {
              name: 'Unknown Freelancer',
              headline: 'Freelancer',
              rating: 5.0,
              jobSuccessRate: 100,
              hourlyRate: 0,
              profileImage: '',
            };

            const fid = app.freelancerId?._id || app.freelancerId;
            if (fid) {
              try {
                const freeRes = await API.get(`/freelancers/${fid}`);
                const freeData = freeRes.data?.data || freeRes.data;
                const fUserId = freeData?.userId?._id || freeData?.userId;

                let userResData = null;
                if (fUserId) {
                  const uRes = await API.get(`/users/${fUserId}`);
                  userResData = uRes.data?.data || uRes.data;
                }

                freelancerInfo = {
                  name: userResData
                    ? `${userResData.firstName || ''} ${userResData.lastName || ''}`.trim() ||
                      userResData.username
                    : 'Active Freelancer',
                  headline: freeData?.headline || 'Professional Freelancer',
                  rating: freeData?.dashboardStats?.averageRating || 5.0,
                  jobSuccessRate: freeData?.jobSuccessRate || 100,
                  hourlyRate: freeData?.hourlyRate || 0,
                  profileImage: userResData?.profileImage || freeData?.profileImage || '',
                };
              } catch { /* ignore */ }
            }

            return {
              applicationId: app.applicationId || app._id,
              projectId: projId,
              projectTitle,
              freelancerId: fid,
              freelancer: freelancerInfo,
              coverLetter: app.coverLetter || '',
              proposedBudget: app.proposedBudget || 0,
              budgetType: app.budgetType || 'fixed',
              estimatedDuration: app.estimatedDuration || 1,
              durationUnit: app.durationUnit || 'weeks',
              appliedAt: app.appliedAt || app.createdAt,
              status: app.status || 'pending',
            };
          })
        );

        setApplications(resolvedApps);
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError('Failed to load applications. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationsData();
  }, [user]);

  /* ---------- Project List for Filter ---------- */
  const projectsList = useMemo(() => {
    const map = new Map();
    applications.forEach((a) => map.set(a.projectId, a.projectTitle));
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [applications]);

  /* ---------- Filtered & Sorted ---------- */
  const filteredApps = useMemo(() => {
    return applications
      .filter((app) => {
        if (search.trim()) {
          const q = search.toLowerCase();
          if (
            !app.freelancer.name.toLowerCase().includes(q) &&
            !app.projectTitle.toLowerCase().includes(q) &&
            !app.coverLetter.toLowerCase().includes(q)
          ) return false;
        }
        if (projectFilter !== 'all' && app.projectId !== projectFilter) return false;
        if (statusFilter !== 'all' && app.status !== statusFilter) return false;
        if (minBudget && app.proposedBudget < Number(minBudget)) return false;
        if (maxBudget && app.proposedBudget > Number(maxBudget)) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.appliedAt) - new Date(a.appliedAt);
        if (sortBy === 'oldest') return new Date(a.appliedAt) - new Date(b.appliedAt);
        if (sortBy === 'budget-high') return b.proposedBudget - a.proposedBudget;
        if (sortBy === 'budget-low') return a.proposedBudget - b.proposedBudget;
        return 0;
      });
  }, [applications, search, projectFilter, statusFilter, minBudget, maxBudget, sortBy]);

  /* ---------- Accept / Reject ---------- */
  const handleStatusChange = async (appId, newStatus) => {
    setActionSubmitting(true);
    setError('');

    const targetApp = applications.find((a) => a.applicationId === appId);
    if (!targetApp) { setActionSubmitting(false); return; }

    try {
      if (newStatus === 'rejected') {
        await API.put(`/applications/${appId}`, {
          status: 'rejected',
          clientMessage: rejectReason.trim(),
          respondedAt: new Date(),
        });
      } else if (newStatus === 'accepted') {
        await API.put(`/applications/${appId}`, {
          status: 'accepted',
          respondedAt: new Date(),
        });
        await API.put(`/projects/${targetApp.projectId}`, {
          status: 'active',
          freelancerId: targetApp.freelancerId,
          startDate: new Date(),
        });
      }

      setApplications((prev) =>
        prev.map((app) =>
          app.applicationId === appId ? { ...app, status: newStatus } : app
        )
      );

      setConfirmAction(null);
      setSelectedApp(null);
      setRejectReason('');
    } catch (err) {
      console.error(`Failed to update status:`, err);
      setError(err.response?.data?.message || 'Failed to update proposal status.');
    } finally {
      setActionSubmitting(false);
    }
  };

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div className="cl-apps-loading">
        <div className="cl-apps-spinner" />
        <p>Loading incoming applications...</p>
      </div>
    );
  }

  return (
    <div className="cl-apps-page">
      {/* Gradient Page Header */}
      <div className="cl-apps-hero">
        <div className="cl-apps-hero-inner">
          <h1>Applications</h1>
          <p>Review freelancer applications and find the right person for your projects.</p>
        </div>
      </div>

      <div className="cl-apps-wrap">
        {error && <div className="cl-apps-alert">{error}</div>}

        {/* Filter Bar */}
        <div className="cl-filter-bar">
          <div className="cl-filter-row">
            <div className="cl-search-box">
              <input
                type="text"
                placeholder="Search by freelancer name, project, or keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Sort by: Newest First</option>
              <option value="oldest">Sort by: Oldest First</option>
              <option value="budget-high">Budget: High to Low</option>
              <option value="budget-low">Budget: Low to High</option>
            </select>
          </div>

          <div className="cl-filter-row secondary">
            <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
              <option value="all">All Projects</option>
              {projectsList.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>

            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>

            <div className="cl-budget-inputs">
              <input
                type="number"
                placeholder="Min $"
                value={minBudget}
                onChange={(e) => setMinBudget(e.target.value)}
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max $"
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
              />
            </div>

            {(search || projectFilter !== 'all' || statusFilter !== 'all' || minBudget || maxBudget) && (
              <button
                type="button"
                className="cl-btn-sm"
                onClick={() => {
                  setSearch('');
                  setProjectFilter('all');
                  setStatusFilter('all');
                  setMinBudget('');
                  setMaxBudget('');
                }}
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        <div className="cl-count-label">
          Showing <strong>{filteredApps.length}</strong> of{' '}
          <strong>{applications.length}</strong> proposals
        </div>

        {/* Cards Feed */}
        {filteredApps.length === 0 ? (
          <div className="cl-empty-box">
            <div className="cl-empty-emoji">📭</div>
            <h3>No applications match your criteria</h3>
            <p>Try adjusting your search query or removing active filters.</p>
          </div>
        ) : (
          <div className="cl-cards-list">
            {filteredApps.map((app) => (
              <div key={app.applicationId} className="cl-proposal-card">
                <div className="cl-proposal-head">
                  <div className="cl-freelancer-block">
                    <div className="cl-avatar-circle">
                      {app.freelancer.profileImage ? (
                        <img src={app.freelancer.profileImage} alt={app.freelancer.name} />
                      ) : (
                        app.freelancer.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h3 className="cl-freelancer-title">{app.freelancer.name}</h3>
                      <p className="cl-freelancer-tagline">{app.freelancer.headline}</p>
                      <div className="cl-stats-inline">
                        <span>⭐ {app.freelancer.rating.toFixed(1)}</span>
                        <span>•</span>
                        <span>{app.freelancer.jobSuccessRate}% Job Success</span>
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={app.status} />
                </div>

                <div className="cl-project-badge-row">
                  <span className="cl-tag-label">Project:</span>
                  <strong>{app.projectTitle}</strong>
                </div>

                <p className="cl-cover-snippet">{app.coverLetter}</p>

                <div className="cl-proposal-metrics">
                  <div>
                    <span className="metric-title">Proposed Budget</span>
                    <span className="metric-value">{formatCurrency(app.proposedBudget)}</span>
                    <span className="metric-sub">
                      {app.budgetType === 'fixed' ? 'Fixed Price' : 'Hourly'}
                    </span>
                  </div>
                  <div>
                    <span className="metric-title">Estimated Duration</span>
                    <span className="metric-value">
                      {app.estimatedDuration} {app.durationUnit}
                    </span>
                  </div>
                  <div>
                    <span className="metric-title">Applied Date</span>
                    <span className="metric-value">{formatDate(app.appliedAt)}</span>
                  </div>
                </div>

                <div className="cl-proposal-actions">
                  <button
                    type="button"
                    className="cl-btn cl-btn-secondary"
                    onClick={() => setSelectedApp(app)}
                  >
                    View Details
                  </button>

                  {app.status === 'pending' && (
                    <>
                      <button
                        type="button"
                        className="cl-btn cl-btn-danger"
                        onClick={() => setConfirmAction({ type: 'reject', app })}
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        className="cl-btn cl-btn-primary"
                        onClick={() => setConfirmAction({ type: 'accept', app })}
                      >
                        Accept Proposal
                      </button>
                    </>
                  )}

                  {app.status === 'accepted' && (
                    <Link to="/client/my-projects" className="cl-btn cl-btn-primary">
                      View Project
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedApp && (
        <div className="cl-modal-overlay" onClick={() => setSelectedApp(null)}>
          <div className="cl-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="cl-modal-header">
              <h2>Proposal Details</h2>
              <button className="cl-modal-close-btn" onClick={() => setSelectedApp(null)}>×</button>
            </div>

            <div className="cl-modal-content">
              <div className="cl-modal-profile">
                <div className="cl-avatar-circle lg">
                  {selectedApp.freelancer.profileImage ? (
                    <img src={selectedApp.freelancer.profileImage} alt={selectedApp.freelancer.name} />
                  ) : (
                    selectedApp.freelancer.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h3>{selectedApp.freelancer.name}</h3>
                  <p>{selectedApp.freelancer.headline}</p>
                  <div className="cl-stats-inline">
                    <span>⭐ {selectedApp.freelancer.rating.toFixed(1)}</span>
                    <span>•</span>
                    <span>{selectedApp.freelancer.jobSuccessRate}% Job Success</span>
                    <span>•</span>
                    <span>{formatCurrency(selectedApp.freelancer.hourlyRate)}/hr</span>
                  </div>
                </div>
              </div>

              <div className="cl-modal-section">
                <span className="cl-section-tag">Project</span>
                <h4>{selectedApp.projectTitle}</h4>
              </div>

              <div className="cl-modal-section">
                <span className="cl-section-tag">Cover Letter</span>
                <p className="cl-modal-cover">{selectedApp.coverLetter}</p>
              </div>

              <div className="cl-modal-grid">
                <div>
                  <span className="cl-section-tag">Proposed Budget</span>
                  <strong>{formatCurrency(selectedApp.proposedBudget)}</strong>
                </div>
                <div>
                  <span className="cl-section-tag">Duration</span>
                  <strong>{selectedApp.estimatedDuration} {selectedApp.durationUnit}</strong>
                </div>
                <div>
                  <span className="cl-section-tag">Submission Date</span>
                  <strong>{formatDate(selectedApp.appliedAt)}</strong>
                </div>
                <div>
                  <span className="cl-section-tag">Current Status</span>
                  <div><StatusBadge status={selectedApp.status} /></div>
                </div>
              </div>
            </div>

            <div className="cl-modal-footer">
              <button className="cl-btn cl-btn-secondary" onClick={() => setSelectedApp(null)}>
                Close
              </button>
              {selectedApp.status === 'pending' && (
                <>
                  <button
                    className="cl-btn cl-btn-danger"
                    onClick={() => setConfirmAction({ type: 'reject', app: selectedApp })}
                  >
                    Reject
                  </button>
                  <button
                    className="cl-btn cl-btn-primary"
                    onClick={() => setConfirmAction({ type: 'accept', app: selectedApp })}
                  >
                    Accept
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="cl-modal-overlay" onClick={() => !actionSubmitting && setConfirmAction(null)}>
          <div className="cl-modal-card sm" onClick={(e) => e.stopPropagation()}>
            <div className="cl-modal-header">
              <h2>
                {confirmAction.type === 'accept'
                  ? 'Accept Freelancer Proposal?'
                  : 'Reject Application?'}
              </h2>
              <button
                className="cl-modal-close-btn"
                onClick={() => !actionSubmitting && setConfirmAction(null)}
                disabled={actionSubmitting}
              >
                ×
              </button>
            </div>
            <div className="cl-modal-content">
              <p>
                {confirmAction.type === 'accept'
                  ? `Are you sure you want to assign "${confirmAction.app.projectTitle}" to ${confirmAction.app.freelancer.name}?`
                  : `Are you sure you want to decline ${confirmAction.app.freelancer.name}'s proposal?`}
              </p>

              {confirmAction.type === 'reject' && (
                <div className="cl-reject-block">
                  <label htmlFor="reject-reason">Optional Feedback for Freelancer:</label>
                  <textarea
                    id="reject-reason"
                    rows="3"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="We decided to go in a different direction..."
                    disabled={actionSubmitting}
                  />
                </div>
              )}
            </div>
            <div className="cl-modal-footer">
              <button
                className="cl-btn cl-btn-secondary"
                onClick={() => setConfirmAction(null)}
                disabled={actionSubmitting}
              >
                Cancel
              </button>
              <button
                className={`cl-btn ${confirmAction.type === 'accept' ? 'cl-btn-primary' : 'cl-btn-danger'}`}
                disabled={actionSubmitting}
                onClick={() =>
                  handleStatusChange(
                    confirmAction.app.applicationId,
                    confirmAction.type === 'accept' ? 'accepted' : 'rejected'
                  )
                }
              >
                {actionSubmitting
                  ? 'Processing...'
                  : confirmAction.type === 'accept'
                  ? 'Yes, Accept'
                  : 'Yes, Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}