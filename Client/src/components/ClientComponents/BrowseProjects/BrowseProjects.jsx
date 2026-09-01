// src/components/ClientComponents/BrowseProjects/BrowseProjects.jsx
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import API from '../../../api/axios';
import ViewProject from './ViewProject';
import './BrowseProjects.css';

const PER_PAGE = 6;
const CLIENT_COLORS = ['#4F46E5', '#7C3AED', '#059669', '#DB2777', '#F59E0B', '#0EA5E9'];

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val || 0);

const daysLeft = (deadline) => {
  if (!deadline) return null;
  return Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
};

export default function BrowseProjects() {
  const { user } = useAuth();

  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [myClientId, setMyClientId] = useState(null);

  // Selected project
  const [selected, setSelected] = useState(null); // { projectId, isOwner }

  // Filters
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('');
  const [checkedCats, setCheckedCats] = useState([]);
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [statusFilters, setStatusFilters] = useState([]);
  const [deadlineFilter, setDeadlineFilter] = useState('');
  const [ownershipFilter, setOwnershipFilter] = useState('all'); // all | mine | others
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);

  /* ---------------- Fetch Data ---------------- */
  useEffect(() => {
    const fetchAll = async () => {
      if (!user) return;
      const currentUserId = user.userId || user._id;

      try {
        setLoading(true);
        setError('');

        // Resolve current user's clientId
        let clientId = currentUserId;
        try {
          const cRes = await API.get(`/clients?userId=${currentUserId}`);
          const cData = Array.isArray(cRes.data)
            ? cRes.data[0]
            : cRes.data?.data?.[0] || cRes.data?.data || cRes.data;
          clientId = cData?.clientId || cData?._id || currentUserId;
        } catch { clientId = currentUserId; }
        setMyClientId(String(clientId));

        const [projRes, catRes, appRes] = await Promise.all([
          API.get('/projects'),
          API.get('/categories'),
          API.get('/applications'),
        ]);

        const projList = projRes.data?.data || projRes.data || [];
        const catList = catRes.data?.data || catRes.data || [];
        const appList = appRes.data?.data || appRes.data || [];

        setCategories(Array.isArray(catList) ? catList.filter((c) => c.isActive !== false) : []);

        const catMap = new Map(catList.map((c) => [c.categoryId || c._id, c]));

        const appCount = {};
        appList.forEach((a) => {
          const pid = a.projectId?._id || a.projectId;
          appCount[pid] = (appCount[pid] || 0) + 1;
        });

        const clientCache = new Map();
        const resolved = await Promise.all(
          projList.map(async (p) => {
            const pid = p.projectId || p._id;
            const cid = String(p.clientId?._id || p.clientId || '');
            const isOwner = cid && cid === String(clientId);

            let clientName = 'Client';
            if (cid) {
              if (clientCache.has(cid)) {
                clientName = clientCache.get(cid);
              } else {
                try {
                  const cRes = await API.get(`/clients/${cid}`);
                  const cData = cRes.data?.data || cRes.data;
                  const uid = cData?.userId?._id || cData?.userId;

                  if (cData?.companyName) {
                    clientName = cData.companyName;
                  } else if (uid) {
                    const uRes = await API.get(`/users/${uid}`);
                    const uData = uRes.data?.data || uRes.data;
                    clientName =
                      `${uData?.firstName || ''} ${uData?.lastName?.charAt(0) || ''}.`.trim() ||
                      uData?.username || 'Client';
                  }
                  clientCache.set(cid, clientName);
                } catch { clientName = 'Client'; }
              }
            }

            const catObj = catMap.get(p.categoryId?._id || p.categoryId);
            const dLeft = daysLeft(p.deadline);

            return {
              projectId: pid,
              clientId: cid,
              isOwner,
              title: p.title || 'Untitled Project',
              description: p.description || '',
              categoryId: p.categoryId?._id || p.categoryId || '',
              categoryName: catObj?.name || p.categoryId?.name || 'General',
              budget: p.budget || 0,
              status: p.status || 'open',
              startDate: p.startDate,
              deadline: p.deadline,
              daysLeft: dLeft,
              isUrgent: dLeft !== null && dLeft <= 7 && dLeft >= 0,
              progress: p.progress || 0,
              applicants: appCount[pid] || 0,
              clientName: isOwner ? 'You' : clientName,
              createdAt: p.createdAt,
            };
          })
        );

        // Hide other clients' drafts (private)
        const visible = resolved.filter((p) => p.isOwner || p.status !== 'draft');
        setProjects(visible);
      } catch (err) {
        console.error('Failed to load projects:', err);
        setError('Failed to load projects. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [user]);

  /* ---------------- Counts ---------------- */
  const categoryCounts = useMemo(() => {
    const counts = {};
    projects.forEach((p) => { counts[p.categoryId] = (counts[p.categoryId] || 0) + 1; });
    return counts;
  }, [projects]);

  const statusCounts = useMemo(() => ({
    open: projects.filter((p) => p.status === 'open').length,
    urgent: projects.filter((p) => p.isUrgent).length,
    active: projects.filter((p) => p.status === 'active').length,
    completed: projects.filter((p) => p.status === 'completed').length,
  }), [projects]);

  const myCount = useMemo(() => projects.filter((p) => p.isOwner).length, [projects]);

  /* ---------------- Filter + Sort ---------------- */
  const filtered = useMemo(() => {
    let list = projects.filter((p) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !p.title.toLowerCase().includes(q) &&
          !p.description.toLowerCase().includes(q) &&
          !p.categoryName.toLowerCase().includes(q)
        ) return false;
      }

      if (ownershipFilter === 'mine' && !p.isOwner) return false;
      if (ownershipFilter === 'others' && p.isOwner) return false;

      if (catFilter && p.categoryId !== catFilter) return false;
      if (checkedCats.length > 0 && !checkedCats.includes(p.categoryId)) return false;

      if (budgetFilter === 'low' && p.budget >= 100) return false;
      if (budgetFilter === 'mid' && (p.budget < 100 || p.budget > 500)) return false;
      if (budgetFilter === 'high' && p.budget <= 500) return false;

      if (minBudget && p.budget < Number(minBudget)) return false;
      if (maxBudget && p.budget > Number(maxBudget)) return false;

      if (statusFilters.length > 0) {
        const matched = statusFilters.some((s) =>
          s === 'urgent' ? p.isUrgent : p.status === s
        );
        if (!matched) return false;
      }

      if (deadlineFilter) {
        const limit = Number(deadlineFilter);
        if (p.daysLeft === null || p.daysLeft < 0 || p.daysLeft > limit) return false;
      }

      return true;
    });

    list.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'budget-high') return b.budget - a.budget;
      if (sortBy === 'budget-low') return a.budget - b.budget;
      if (sortBy === 'deadline') {
        if (a.daysLeft === null) return 1;
        if (b.daysLeft === null) return -1;
        return a.daysLeft - b.daysLeft;
      }
      return 0;
    });

    return list;
  }, [projects, search, ownershipFilter, catFilter, checkedCats, budgetFilter,
      minBudget, maxBudget, statusFilters, deadlineFilter, sortBy]);

  /* ---------------- Pagination ---------------- */
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  useEffect(() => { setPage(1); }, [
    search, ownershipFilter, catFilter, checkedCats, budgetFilter,
    minBudget, maxBudget, statusFilters, deadlineFilter, sortBy,
  ]);

  const toggleCat = (id) =>
    setCheckedCats((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);

  const toggleStatus = (s) =>
    setStatusFilters((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  const clearFilters = () => {
    setSearch(''); setCatFilter(''); setBudgetFilter('');
    setCheckedCats([]); setMinBudget(''); setMaxBudget('');
    setStatusFilters([]); setDeadlineFilter('');
    setOwnershipFilter('all'); setSortBy('newest');
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  /* ---------------- ViewProject ---------------- */
  if (selected) {
    return (
      <ViewProject
        projectId={selected.projectId}
        isOwner={selected.isOwner}
        onBack={() => setSelected(null)}
      />
    );
  }

  if (loading) {
    return (
      <div className="bp-loading-screen">
        <div className="bp-spinner" />
        <p>Loading available projects...</p>
      </div>
    );
  }

  return (
    <div className="bp-page">
      {/* Gradient Page Header */}
      <div className="bp-page-header">
        <h1>Browse Projects</h1>
        <p>Explore all projects available on the Skillora marketplace.</p>
      </div>

      {/* Search Section */}
      <div className="bp-search-section">
        <div className="bp-search-bar">
          <div className="bp-search-input-wrap">
            <span className="bp-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search projects by title or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.categoryId || c._id} value={c.categoryId || c._id}>{c.name}</option>
            ))}
          </select>

          <select value={budgetFilter} onChange={(e) => setBudgetFilter(e.target.value)}>
            <option value="">Any Budget</option>
            <option value="low">Under $100</option>
            <option value="mid">$100 – $500</option>
            <option value="high">$500+</option>
          </select>

          <button type="button" onClick={() => setPage(1)}>Search</button>
        </div>
      </div>

      {error && <div className="bp-alert">{error}</div>}

      {/* Client Notice */}
      <div className="bp-notice-strip">
        <span className="bp-notice-icon">ℹ️</span>
        <div>
          <strong>You are browsing as a Client.</strong> You can only open full details of projects
          you posted. Clients cannot submit proposals — only freelancers can apply.
        </div>
      </div>

      {/* Main Layout */}
      <div className="bp-main-layout">
        {/* SIDEBAR */}
        <aside className="bp-sidebar">
          <div className="bp-filter-card">
            <h3>Ownership</h3>
            {[
              { v: 'all', l: 'All Projects', c: projects.length },
              { v: 'mine', l: 'My Projects', c: myCount },
              { v: 'others', l: 'Other Clients', c: projects.length - myCount },
            ].map((o) => (
              <div className="bp-filter-option" key={o.v}>
                <input
                  type="radio"
                  name="ownership"
                  id={`own-${o.v}`}
                  checked={ownershipFilter === o.v}
                  onChange={() => setOwnershipFilter(o.v)}
                />
                <label htmlFor={`own-${o.v}`}>{o.l}</label>
                <span className="bp-count">{o.c}</span>
              </div>
            ))}
          </div>

          <div className="bp-filter-card">
            <h3>Category</h3>
            {categories.length === 0 ? (
              <p className="bp-no-filter">No categories</p>
            ) : (
              categories.map((c) => {
                const cid = c.categoryId || c._id;
                return (
                  <div className="bp-filter-option" key={cid}>
                    <input
                      type="checkbox"
                      id={`cat-${cid}`}
                      checked={checkedCats.includes(cid)}
                      onChange={() => toggleCat(cid)}
                    />
                    <label htmlFor={`cat-${cid}`}>{c.name}</label>
                    <span className="bp-count">{categoryCounts[cid] || 0}</span>
                  </div>
                );
              })
            )}
          </div>

          <div className="bp-filter-card">
            <h3>Budget Range</h3>
            <div className="bp-budget-inputs">
              <input type="number" placeholder="Min $" value={minBudget}
                onChange={(e) => setMinBudget(e.target.value)} />
              <input type="number" placeholder="Max $" value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)} />
            </div>
            <button className="bp-clear-filter-btn" onClick={clearFilters}>
              Clear All Filters
            </button>
          </div>

          <div className="bp-filter-card">
            <h3>Status</h3>
            {[
              { v: 'open', l: 'Open', c: statusCounts.open },
              { v: 'urgent', l: 'Urgent', c: statusCounts.urgent },
              { v: 'active', l: 'In Progress', c: statusCounts.active },
              { v: 'completed', l: 'Completed', c: statusCounts.completed },
            ].map((s) => (
              <div className="bp-filter-option" key={s.v}>
                <input
                  type="checkbox"
                  id={`st-${s.v}`}
                  checked={statusFilters.includes(s.v)}
                  onChange={() => toggleStatus(s.v)}
                />
                <label htmlFor={`st-${s.v}`}>{s.l}</label>
                <span className="bp-count">{s.c}</span>
              </div>
            ))}
          </div>

          <div className="bp-filter-card">
            <h3>Deadline</h3>
            {[
              { v: '7', l: 'Within 7 days' },
              { v: '14', l: 'Within 14 days' },
              { v: '30', l: 'Within 30 days' },
            ].map((d) => (
              <div className="bp-filter-option" key={d.v}>
                <input
                  type="radio"
                  name="deadline"
                  id={`dl-${d.v}`}
                  checked={deadlineFilter === d.v}
                  onChange={() => setDeadlineFilter(d.v)}
                />
                <label htmlFor={`dl-${d.v}`}>{d.l}</label>
              </div>
            ))}
            {deadlineFilter && (
              <button className="bp-clear-filter-btn" onClick={() => setDeadlineFilter('')}>
                Reset Deadline
              </button>
            )}
          </div>
        </aside>

        {/* PROJECTS */}
        <div className="bp-projects-area">
          <div className="bp-results-header">
            <h2>Showing <span>{filtered.length}</span> projects</h2>
            <select className="bp-sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="budget-high">Budget: High to Low</option>
              <option value="budget-low">Budget: Low to High</option>
              <option value="deadline">Deadline: Soonest</option>
            </select>
          </div>

          {paginated.length === 0 ? (
            <div className="bp-empty-state">
              <div className="bp-empty-icon">🔍</div>
              <h3>No projects found</h3>
              <p>Try adjusting your search or filters.</p>
            </div>
          ) : (
            <>
              {paginated.map((p, i) => (
                <div
                  key={p.projectId}
                  className={`bp-proj-card ${p.isOwner ? 'owned' : 'locked'}`}
                  onClick={() => setSelected({ projectId: p.projectId, isOwner: p.isOwner })}
                >
                  {p.isOwner && <span className="bp-owner-ribbon">Your Project</span>}

                  <div className="bp-proj-card-header">
                    <div className="bp-proj-badges">
                      <span className="bp-badge bp-badge-cat">{p.categoryName}</span>
                      <span className={`bp-badge bp-badge-${p.status}`}>
                        {p.status === 'open' ? 'Open' :
                         p.status === 'active' ? 'In Progress' :
                         p.status === 'completed' ? 'Completed' :
                         p.status === 'draft' ? 'Draft' : p.status}
                      </span>
                      {p.isUrgent && <span className="bp-badge bp-badge-urgent">Urgent</span>}
                    </div>
                    <div className="bp-meta-item bp-budget">
                      <strong>{formatCurrency(p.budget)}</strong>
                    </div>
                  </div>

                  <h3>{p.title}</h3>
                  <p>
                    {p.description.length > 180
                      ? `${p.description.slice(0, 180)}...`
                      : p.description}
                  </p>

                  <div className="bp-proj-meta-row">
                    <div className="bp-meta-item">
                      ⏰ <strong>
                        {p.daysLeft === null ? 'No deadline'
                          : p.daysLeft < 0 ? 'Expired'
                          : `${p.daysLeft} days left`}
                      </strong>
                    </div>

                    {/* Applicant count is private to owner */}
                    {p.isOwner ? (
                      <div className="bp-meta-item">
                        👥 <strong>{p.applicants} applicants</strong>
                      </div>
                    ) : (
                      <div className="bp-meta-item muted">🔒 <span>Applicants hidden</span></div>
                    )}

                    {p.isOwner && p.progress > 0 && (
                      <div className="bp-meta-item">📊 <strong>{p.progress}% done</strong></div>
                    )}

                    <div className="bp-proj-client">
                      <div
                        className="bp-client-avatar"
                        style={{ background: p.isOwner ? '#22C55E' : CLIENT_COLORS[i % CLIENT_COLORS.length] }}
                      >
                        {p.clientName.slice(0, 2).toUpperCase()}
                      </div>
                      <span>{p.clientName}</span>
                    </div>
                  </div>

                  {/* Footer CTA */}
                  <div className="bp-card-cta">
                    {p.isOwner ? (
                      <span className="bp-cta-full">Open Full Details →</span>
                    ) : (
                      <span className="bp-cta-locked">🔒 Limited preview — owner access only</span>
                    )}
                  </div>
                </div>
              ))}

              {totalPages > 1 && (
                <div className="bp-pagination">
                  <button className="bp-page-btn" disabled={currentPage === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}>‹</button>
                  {getPageNumbers().map((num, idx) =>
                    num === '...' ? (
                      <button key={`dots-${idx}`} className="bp-page-btn dots">...</button>
                    ) : (
                      <button key={num}
                        className={`bp-page-btn ${num === currentPage ? 'active' : ''}`}
                        onClick={() => setPage(num)}>{num}</button>
                    )
                  )}
                  <button className="bp-page-btn" disabled={currentPage === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>›</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}