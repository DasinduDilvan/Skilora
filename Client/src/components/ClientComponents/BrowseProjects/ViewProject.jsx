// src/components/ClientComponents/BrowseProjects/ViewProject.jsx
import { useState, useEffect } from 'react';
import API from '../../../api/axios';
import './ViewProject.css';

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val || 0);

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
};

const daysLeft = (deadline) => {
  if (!deadline) return null;
  return Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
};

const StatusPill = ({ status }) => {
  const map = {
    draft: 'vp-pill-gray',
    open: 'vp-pill-green',
    active: 'vp-pill-blue',
    'in-progress': 'vp-pill-blue',
    completed: 'vp-pill-purple',
    cancelled: 'vp-pill-red',
    pending: 'vp-pill-amber',
    accepted: 'vp-pill-green',
    rejected: 'vp-pill-red',
  };
  return <span className={`vp-pill ${map[status] || 'vp-pill-gray'}`}>{status}</span>;
};

/* Locked panel shown to non-owners */
const LockedPanel = ({ title, message }) => (
  <section className="vp-card vp-locked-card">
    <div className="vp-lock-icon">🔒</div>
    <h3>{title}</h3>
    <p>{message}</p>
    <span className="vp-lock-note">Only the client who posted this project can view this data.</span>
  </section>
);

export default function ViewProject({ projectId, isOwner = false, onBack }) {
  const [project, setProject] = useState(null);
  const [category, setCategory] = useState(null);
  const [client, setClient] = useState(null);
  const [freelancer, setFreelancer] = useState(null);
  const [applications, setApplications] = useState([]);
  const [payments, setPayments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError('');
        window.scrollTo({ top: 0, behavior: 'smooth' });

        const pRes = await API.get(`/projects/${projectId}`);
        const p = pRes.data?.data || pRes.data;
        setProject(p);

        const catId = p.categoryId?._id || p.categoryId;
        const cliId = p.clientId?._id || p.clientId;
        const freId = p.freelancerId?._id || p.freelancerId;

        const tasks = [];

        if (catId) {
          tasks.push(
            API.get(`/categories/${catId}`)
              .then((r) => setCategory(r.data?.data || r.data))
              .catch(() => setCategory(null))
          );
        }

        if (cliId) {
          tasks.push(
            API.get(`/clients/${cliId}`)
              .then(async (r) => {
                const cData = r.data?.data || r.data;
                const uid = cData?.userId?._id || cData?.userId;
                let uData = null;
                if (uid) {
                  try {
                    const uRes = await API.get(`/users/${uid}`);
                    uData = uRes.data?.data || uRes.data;
                  } catch { /* ignore */ }
                }
                setClient({ ...cData, user: uData });
              })
              .catch(() => setClient(null))
          );
        }

        if (freId) {
          tasks.push(
            API.get(`/freelancers/${freId}`)
              .then(async (r) => {
                const fData = r.data?.data || r.data;
                const uid = fData?.userId?._id || fData?.userId;
                let uData = null;
                if (uid) {
                  try {
                    const uRes = await API.get(`/users/${uid}`);
                    uData = uRes.data?.data || uRes.data;
                  } catch { /* ignore */ }
                }
                setFreelancer({ ...fData, user: uData });
              })
              .catch(() => setFreelancer(null))
          );
        }

        // 🔐 Private data only fetched for the owner
        if (isOwner) {
          tasks.push(
            API.get(`/applications?projectId=${projectId}`)
              .then((r) => setApplications(r.data?.data || r.data || []))
              .catch(() => setApplications([]))
          );
          tasks.push(
            API.get(`/payments?projectId=${projectId}`)
              .then((r) => setPayments(r.data?.data || r.data || []))
              .catch(() => setPayments([]))
          );
        }

        // Reviews are public
        tasks.push(
          API.get(`/reviews?projectId=${projectId}`)
            .then((r) => setReviews(r.data?.data || r.data || []))
            .catch(() => setReviews([]))
        );

        await Promise.all(tasks);
      } catch (err) {
        console.error('Failed to load project:', err);
        setError('Failed to load project details.');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) fetchProject();
  }, [projectId, isOwner]);

  if (loading) {
    return (
      <div className="vp-loading">
        <div className="vp-spinner" />
        <p>Loading project details...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="vp-error">
        <div className="vp-error-icon">⚠️</div>
        <h3>{error || 'Project not found'}</h3>
        <button className="vp-btn vp-btn-primary" onClick={onBack}>
          ← Back to Browse Projects
        </button>
      </div>
    );
  }

  const dLeft = daysLeft(project.deadline);
  const tasksArr = project.tasks || [];
  const clientName =
    client?.companyName ||
    (client?.user ? `${client.user.firstName || ''} ${client.user.lastName || ''}`.trim() : 'Client');
  const freelancerName = freelancer?.user
    ? `${freelancer.user.firstName || ''} ${freelancer.user.lastName || ''}`.trim()
    : null;

  const totalPaid = payments
    .filter((p) => p.status === 'completed')
    .reduce((s, p) => s + (p.amount || 0), 0);

  const meta = project.metadata || {};

  return (
    <div className="vp-page">
      {/* Back Bar */}
      <div className="vp-back-bar">
        <button className="vp-back-btn" onClick={onBack}>← Back to Browse Projects</button>
        {isOwner ? (
          <span className="vp-access-tag owner">✓ You own this project — Full Access</span>
        ) : (
          <span className="vp-access-tag limited">🔒 Public View — Limited Access</span>
        )}
      </div>

      {/* Hero */}
      <div className="vp-hero">
        <div className="vp-hero-inner">
          <div className="vp-hero-badges">
            <span className="vp-badge-cat">{category?.name || 'General'}</span>
            <StatusPill status={project.status} />
            {dLeft !== null && dLeft >= 0 && dLeft <= 7 && (
              <span className="vp-pill vp-pill-red">Urgent</span>
            )}
          </div>
          <h1>{project.title}</h1>
          <div className="vp-hero-meta">
            <span>📅 Posted {formatDate(project.createdAt)}</span>
            {isOwner && (<><span>•</span><span>🆔 {project.projectId || project._id}</span></>)}
          </div>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="vp-stats-strip">
        <div className="vp-stat">
          <span className="vp-stat-label">Budget</span>
          <span className="vp-stat-value green">{formatCurrency(project.budget)}</span>
        </div>
        <div className="vp-stat">
          <span className="vp-stat-label">Deadline</span>
          <span className="vp-stat-value">{formatDate(project.deadline)}</span>
        </div>
        <div className="vp-stat">
          <span className="vp-stat-label">Time Left</span>
          <span className="vp-stat-value">
            {dLeft === null ? '—' : dLeft < 0 ? 'Expired' : `${dLeft} days`}
          </span>
        </div>
        <div className="vp-stat">
          <span className="vp-stat-label">Applicants</span>
          <span className="vp-stat-value">
            {isOwner ? applications.length : <span className="vp-hidden-val">🔒</span>}
          </span>
        </div>
        <div className="vp-stat">
          <span className="vp-stat-label">Progress</span>
          <span className="vp-stat-value">
            {isOwner ? `${project.progress || 0}%` : <span className="vp-hidden-val">🔒</span>}
          </span>
        </div>
      </div>

      {/* Client cannot apply notice */}
      <div className="vp-cannot-apply">
        <span className="vp-ca-icon">🚫</span>
        <div>
          <strong>Proposals are freelancer-only.</strong> As a Client account you cannot apply to
          projects. Switch to a freelancer account to submit proposals.
        </div>
        <button className="vp-btn vp-btn-disabled" disabled title="Clients cannot apply">
          Apply Not Available
        </button>
      </div>

      {/* Tabs */}
      <div className="vp-tabs">
        <button
          className={`vp-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`vp-tab ${activeTab === 'tasks' ? 'active' : ''} ${!isOwner ? 'locked' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          {isOwner ? `Tasks (${tasksArr.length})` : '🔒 Tasks'}
        </button>
        <button
          className={`vp-tab ${activeTab === 'applications' ? 'active' : ''} ${!isOwner ? 'locked' : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          {isOwner ? `Applications (${applications.length})` : '🔒 Applications'}
        </button>
        <button
          className={`vp-tab ${activeTab === 'payments' ? 'active' : ''} ${!isOwner ? 'locked' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          {isOwner ? `Payments (${payments.length})` : '🔒 Payments'}
        </button>
        <button
          className={`vp-tab ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          Reviews ({reviews.length})
        </button>
      </div>

      <div className="vp-layout">
        {/* MAIN */}
        <div className="vp-main">
          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <>
              <section className="vp-card">
                <h2>Project Description</h2>
                <p className="vp-description">{project.description}</p>
              </section>

              {isOwner ? (
                <section className="vp-card">
                  <h2>Progress Tracker</h2>
                  <div className="vp-progress-wrap">
                    <div className="vp-progress-bar">
                      <div className="vp-progress-fill" style={{ width: `${project.progress || 0}%` }} />
                    </div>
                    <span className="vp-progress-text">{project.progress || 0}% Complete</span>
                  </div>
                  <div className="vp-timeline-dates">
                    <div>
                      <span className="vp-tl-label">Start Date</span>
                      <strong>{formatDate(project.startDate)}</strong>
                    </div>
                    <div className="vp-tl-arrow">→</div>
                    <div>
                      <span className="vp-tl-label">Deadline</span>
                      <strong>{formatDate(project.deadline)}</strong>
                    </div>
                  </div>
                </section>
              ) : (
                <LockedPanel
                  title="Progress Tracker Hidden"
                  message="Internal progress tracking and milestone timelines are private to the project owner."
                />
              )}

              {/* Public specifications */}
              {(meta.projectType || meta.requiredSkills?.length > 0 || meta.workRequirements) && (
                <section className="vp-card">
                  <h2>Specifications</h2>

                  {meta.projectType && (
                    <div className="vp-spec-row">
                      <span className="vp-spec-label">Payment Model</span>
                      <strong className="vp-spec-value">{meta.projectType}</strong>
                    </div>
                  )}

                  {meta.requiredSkills?.length > 0 && (
                    <div className="vp-spec-block">
                      <span className="vp-spec-label">Required Skills</span>
                      <div className="vp-chips">
                        {meta.requiredSkills.map((s, i) => (
                          <span key={i} className="vp-chip">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {meta.workRequirements && (
                    <div className="vp-spec-block">
                      <span className="vp-spec-label">Deliverables & Requirements</span>
                      <p className="vp-spec-text">{meta.workRequirements}</p>
                    </div>
                  )}

                  {/* Private notes — owner only */}
                  {isOwner && meta.additionalNotes && (
                    <div className="vp-spec-block">
                      <span className="vp-spec-label">Additional Notes (Private)</span>
                      <p className="vp-spec-text">{meta.additionalNotes}</p>
                    </div>
                  )}
                </section>
              )}
            </>
          )}

          {/* TASKS */}
          {activeTab === 'tasks' && (
            !isOwner ? (
              <LockedPanel
                title="Tasks Are Private"
                message="Task breakdowns, sections, internal notes and priorities are only visible to the project owner."
              />
            ) : (
              <section className="vp-card">
                <h2>Project Tasks</h2>
                {tasksArr.length === 0 ? (
                  <div className="vp-empty-inline">
                    <span>📋</span>
                    <p>No tasks have been created for this project yet.</p>
                  </div>
                ) : (
                  <div className="vp-task-list">
                    {tasksArr.map((task, idx) => (
                      <div key={task.taskId || idx} className="vp-task-item">
                        <div className="vp-task-head">
                          <div>
                            <h4>{task.title}</h4>
                            <p className="vp-task-desc">{task.description}</p>
                          </div>
                          <div className="vp-task-badges">
                            <StatusPill status={task.status} />
                            {task.priority && (
                              <span className={`vp-priority vp-prio-${task.priority}`}>
                                {task.priority}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="vp-task-metrics">
                          {task.budget > 0 && (
                            <div>
                              <span>Budget</span>
                              <strong>
                                {formatCurrency(task.budget)}
                                {task.budgetType && ` (${task.budgetType})`}
                              </strong>
                            </div>
                          )}
                          {task.workRange && (
                            <div><span>Work Range</span><strong>{task.workRange}</strong></div>
                          )}
                          {task.deadline && (
                            <div><span>Deadline</span><strong>{formatDate(task.deadline)}</strong></div>
                          )}
                        </div>

                        <div className="vp-progress-wrap sm">
                          <div className="vp-progress-bar">
                            <div className="vp-progress-fill" style={{ width: `${task.progress || 0}%` }} />
                          </div>
                          <span className="vp-progress-text">{task.progress || 0}%</span>
                        </div>

                        {task.clientNote && (
                          <div className="vp-note vp-note-client">
                            <strong>Client Note:</strong> {task.clientNote}
                          </div>
                        )}
                        {task.freelancerNote && (
                          <div className="vp-note vp-note-freelancer">
                            <strong>Freelancer Note:</strong> {task.freelancerNote}
                          </div>
                        )}
                        {task.rejectionReason && (
                          <div className="vp-note vp-note-reject">
                            <strong>Rejection Reason:</strong> {task.rejectionReason}
                          </div>
                        )}

                        {task.sections?.length > 0 && (
                          <div className="vp-sections">
                            <span className="vp-sections-title">
                              Sections ({task.sections.length})
                            </span>
                            {task.sections
                              .slice()
                              .sort((a, b) => (a.order || 0) - (b.order || 0))
                              .map((sec, si) => (
                                <div key={sec.sectionId || si} className="vp-section-item">
                                  <div className="vp-section-head">
                                    <span className="vp-section-order">{sec.order || si + 1}</span>
                                    <div className="vp-section-info">
                                      <h5>{sec.title}</h5>
                                      {sec.description && <p>{sec.description}</p>}
                                    </div>
                                    <StatusPill status={sec.status} />
                                  </div>
                                  <div className="vp-section-foot">
                                    <div className="vp-progress-bar tiny">
                                      <div className="vp-progress-fill" style={{ width: `${sec.progress || 0}%` }} />
                                    </div>
                                    <span className="vp-section-meta">
                                      {sec.progress || 0}% · Due {formatDate(sec.dueDate)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}

                        <div className="vp-task-timestamps">
                          {task.requestedAt && <span>Requested: {formatDate(task.requestedAt)}</span>}
                          {task.acceptedAt && <span>Accepted: {formatDate(task.acceptedAt)}</span>}
                          {task.completedAt && <span>Completed: {formatDate(task.completedAt)}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )
          )}

          {/* APPLICATIONS */}
          {activeTab === 'applications' && (
            !isOwner ? (
              <LockedPanel
                title="Applications Are Private"
                message="Freelancer proposals, cover letters and bid amounts are confidential to the project owner."
              />
            ) : (
              <section className="vp-card">
                <h2>Applications Received</h2>
                {applications.length === 0 ? (
                  <div className="vp-empty-inline">
                    <span>📭</span>
                    <p>No applications have been submitted for this project.</p>
                  </div>
                ) : (
                  <div className="vp-app-list">
                    {applications.map((app, idx) => (
                      <div key={app.applicationId || app._id || idx} className="vp-app-item">
                        <div className="vp-app-head">
                          <div className="vp-app-avatar">
                            {String(app.freelancerId).slice(0, 2).toUpperCase()}
                          </div>
                          <div className="vp-app-info">
                            <h4>Freelancer #{String(app.freelancerId).slice(-6)}</h4>
                            <span className="vp-app-date">
                              Applied {formatDate(app.appliedAt || app.createdAt)}
                            </span>
                          </div>
                          <StatusPill status={app.status} />
                        </div>

                        {app.coverLetter && <p className="vp-app-cover">{app.coverLetter}</p>}

                        <div className="vp-app-metrics">
                          <div>
                            <span>Proposed Budget</span>
                            <strong>{formatCurrency(app.proposedBudget)}</strong>
                          </div>
                          <div>
                            <span>Budget Type</span>
                            <strong>{app.budgetType || 'fixed'}</strong>
                          </div>
                          <div>
                            <span>Duration</span>
                            <strong>{app.estimatedDuration} {app.durationUnit}</strong>
                          </div>
                        </div>

                        {app.clientMessage && (
                          <div className="vp-note vp-note-client">
                            <strong>Client Response:</strong> {app.clientMessage}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )
          )}

          {/* PAYMENTS */}
          {activeTab === 'payments' && (
            !isOwner ? (
              <LockedPanel
                title="Payment Records Are Private"
                message="Transactions, invoices and payment history are strictly visible to the project owner only."
              />
            ) : (
              <section className="vp-card">
                <h2>Payment History</h2>
                {payments.length === 0 ? (
                  <div className="vp-empty-inline">
                    <span>💳</span>
                    <p>No payments have been recorded for this project.</p>
                  </div>
                ) : (
                  <>
                    <div className="vp-pay-summary">
                      <span>Total Paid</span>
                      <strong>{formatCurrency(totalPaid)}</strong>
                    </div>
                    <div className="vp-table-wrap">
                      <table className="vp-table">
                        <thead>
                          <tr>
                            <th>Transaction</th>
                            <th>Type</th>
                            <th>Method</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payments.map((pay, idx) => (
                            <tr key={pay.paymentId || pay._id || idx}>
                              <td className="vp-mono">{pay.transactionId || '—'}</td>
                              <td>{pay.paymentType || '—'}</td>
                              <td>{pay.paymentMethod || '—'}</td>
                              <td><strong>{formatCurrency(pay.amount)}</strong></td>
                              <td><StatusPill status={pay.status} /></td>
                              <td>{formatDate(pay.paidAt || pay.createdAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </section>
            )
          )}

          {/* REVIEWS (public) */}
          {activeTab === 'reviews' && (
            <section className="vp-card">
              <h2>Reviews</h2>
              {reviews.length === 0 ? (
                <div className="vp-empty-inline">
                  <span>⭐</span>
                  <p>No reviews have been submitted for this project yet.</p>
                </div>
              ) : (
                <div className="vp-review-list">
                  {reviews.map((rev, idx) => (
                    <div key={rev.reviewId || rev._id || idx} className="vp-review-item">
                      <div className="vp-review-head">
                        <div>
                          <span className="vp-review-role">{rev.reviewerRole}</span>
                          <div className="vp-review-stars">
                            {'⭐'.repeat(Math.round(rev.rating || 0))}
                            <span className="vp-review-num">{rev.rating?.toFixed(1)}</span>
                          </div>
                        </div>
                        <span className="vp-review-date">{formatDate(rev.createdAt)}</span>
                      </div>

                      {rev.comment && <p className="vp-review-comment">{rev.comment}</p>}

                      <div className="vp-review-breakdown">
                        <div><span>Communication</span><strong>{rev.communicationRating || '—'}/5</strong></div>
                        <div><span>Quality</span><strong>{rev.qualityRating || '—'}/5</strong></div>
                        <div><span>Deadline</span><strong>{rev.deadlineRating || '—'}/5</strong></div>
                        <div><span>Recommend</span><strong>{rev.wouldRecommend ? '👍 Yes' : '👎 No'}</strong></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>

        {/* SIDEBAR */}
        <aside className="vp-sidebar">
          {/* Client Card */}
          <div className="vp-card vp-side-card">
            <h3>{isOwner ? 'Your Company' : 'About the Client'}</h3>
            <div className="vp-party">
              <div className="vp-party-avatar">
                {client?.companyLogo || client?.user?.profileImage ? (
                  <img src={client.companyLogo || client.user.profileImage} alt={clientName} />
                ) : (
                  clientName.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h4>{clientName}</h4>
                {client?.jobTitle && <p>{client.jobTitle}</p>}
                {client?.isVerified && <span className="vp-verified">✓ Verified</span>}
              </div>
            </div>

            <div className="vp-side-list">
              {client?.industry && (<div><span>Industry</span><strong>{client.industry}</strong></div>)}
              {client?.location && (<div><span>Location</span><strong>{client.location}</strong></div>)}
              {client?.companySize && (<div><span>Company Size</span><strong>{client.companySize}</strong></div>)}
              <div><span>Projects Posted</span><strong>{client?.totalProjectsPosted ?? 0}</strong></div>
              <div><span>Projects Completed</span><strong>{client?.totalProjectsCompleted ?? 0}</strong></div>

              {/* 🔐 Financials are owner-only */}
              {isOwner ? (
                <div><span>Total Spent</span><strong>{formatCurrency(client?.totalSpent)}</strong></div>
              ) : (
                <div><span>Total Spent</span><strong className="vp-hidden-val">🔒 Private</strong></div>
              )}

              {client?.averageRatingGiven > 0 && (
                <div><span>Avg Rating Given</span><strong>⭐ {client.averageRatingGiven.toFixed(1)}</strong></div>
              )}
              {client?.website && (
                <div>
                  <span>Website</span>
                  <a href={client.website} target="_blank" rel="noopener noreferrer">Visit →</a>
                </div>
              )}
            </div>

            {client?.companyDescription && (
              <p className="vp-company-desc">{client.companyDescription}</p>
            )}
          </div>

          {/* Freelancer — owner only */}
          {freelancer && (
            isOwner ? (
              <div className="vp-card vp-side-card">
                <h3>Assigned Freelancer</h3>
                <div className="vp-party">
                  <div className="vp-party-avatar">
                    {freelancer.user?.profileImage ? (
                      <img src={freelancer.user.profileImage} alt={freelancerName} />
                    ) : (
                      (freelancerName || 'F').charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h4>{freelancerName || 'Freelancer'}</h4>
                    {freelancer.headline && <p>{freelancer.headline}</p>}
                    {freelancer.isTopRated && <span className="vp-top-rated">⭐ Top Rated</span>}
                  </div>
                </div>

                <div className="vp-side-list">
                  <div><span>Hourly Rate</span><strong>{formatCurrency(freelancer.hourlyRate)}/hr</strong></div>
                  <div><span>Job Success</span><strong>{freelancer.jobSuccessRate || 0}%</strong></div>
                  <div><span>Projects Done</span><strong>{freelancer.projectsCompleted || 0}</strong></div>
                  {freelancer.location && (<div><span>Location</span><strong>{freelancer.location}</strong></div>)}
                  {freelancer.responseTime && (<div><span>Response Time</span><strong>{freelancer.responseTime}</strong></div>)}
                </div>
              </div>
            ) : (
              <div className="vp-card vp-side-card vp-side-locked">
                <h3>Assigned Freelancer</h3>
                <div className="vp-side-lock-body">
                  <span>🔒</span>
                  <p>Hidden — visible to project owner only.</p>
                </div>
              </div>
            )
          )}

          {/* Category */}
          {category && (
            <div className="vp-card vp-side-card">
              <h3>Category</h3>
              <div className="vp-cat-box">
                <div className="vp-cat-icon">{category.icon || '📁'}</div>
                <div>
                  <h4>{category.name}</h4>
                  {category.description && <p>{category.description}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="vp-card vp-side-card">
            <h3>Project Summary</h3>
            <div className="vp-side-list">
              <div><span>Status</span><StatusPill status={project.status} /></div>
              <div><span>Budget</span><strong>{formatCurrency(project.budget)}</strong></div>
              <div>
                <span>Total Tasks</span>
                <strong>{isOwner ? tasksArr.length : <span className="vp-hidden-val">🔒</span>}</strong>
              </div>
              <div>
                <span>Applications</span>
                <strong>{isOwner ? applications.length : <span className="vp-hidden-val">🔒</span>}</strong>
              </div>
              <div><span>Created</span><strong>{formatDate(project.createdAt)}</strong></div>
              <div><span>Last Updated</span><strong>{formatDate(project.updatedAt)}</strong></div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}