// src/components/ClientComponents/Freelancers/Freelancers.jsx
import { useState, useEffect, useMemo } from 'react';
import API from '../../../api/axios';
import './Freelancers.css';

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val || 0);

const formatDate = (dateStr) => {
  if (!dateStr) return 'Present';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

export default function Freelancers() {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('top-rated');

  const [selectedFreelancer, setSelectedFreelancer] = useState(null);

  /* ---------- Fetch Freelancers ---------- */
  useEffect(() => {
    const fetchFreelancers = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await API.get('/freelancers');
        const list = res.data?.data || res.data || [];

        const resolved = await Promise.all(
          list.map(async (f) => {
            let userData = null;
            const uid = f.userId?._id || f.userId;
            if (uid) {
              try {
                const uRes = await API.get(`/users/${uid}`);
                userData = uRes.data?.data || uRes.data;
              } catch { userData = null; }
            }

            return {
              freelancerId: f.freelancerId || f._id,
              userId: uid,
              name: userData
                ? `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.username
                : 'Freelancer',
              email: userData?.email,
              profileImage: userData?.profileImage || f.profileImage || '',
              headline: f.headline || 'Freelance Professional',
              location: f.location || userData?.location || 'Remote',
              hourlyRate: f.hourlyRate || 0,
              jobSuccessRate: f.jobSuccessRate || 0,
              isTopRated: f.isTopRated || false,
              isAvailable: f.isAvailable ?? true,
              projectsCompleted: f.projectsCompleted || 0,
              averageRating: f.dashboardStats?.averageRating || 0,
              skills: (f.skills || []).map((s) => s.skillId || s),
              bio: f.bio || userData?.bio || '',
              raw: f,
            };
          })
        );

        setFreelancers(resolved);
      } catch (err) {
        console.error('Failed to load freelancers:', err);
        setError('Failed to load freelancers. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchFreelancers();
  }, []);

  /* ---------- Filter & Sort ---------- */
  const filteredList = useMemo(() => {
    return freelancers
      .filter((f) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          f.name.toLowerCase().includes(q) ||
          f.headline.toLowerCase().includes(q) ||
          f.location.toLowerCase().includes(q) ||
          (f.skills || []).some((s) => String(s).toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        if (sortBy === 'top-rated') return b.averageRating - a.averageRating;
        if (sortBy === 'most-projects') return b.projectsCompleted - a.projectsCompleted;
        if (sortBy === 'rate-low') return a.hourlyRate - b.hourlyRate;
        if (sortBy === 'rate-high') return b.hourlyRate - a.hourlyRate;
        return 0;
      });
  }, [freelancers, search, sortBy]);

  /* ---------- Open Profile ---------- */
  const openProfile = async (freelancer) => {
    setSelectedFreelancer({ ...freelancer, _loading: true });
    document.body.style.overflow = 'hidden';

    try {
      const res = await API.get(`/freelancers/${freelancer.freelancerId}`);
      const full = res.data?.data || res.data;
      setSelectedFreelancer({ ...freelancer, full, _loading: false });
    } catch (err) {
      console.error('Error fetching full profile:', err);
      setSelectedFreelancer({ ...freelancer, full: freelancer.raw, _loading: false });
    }
  };

  const closeProfile = () => {
    setSelectedFreelancer(null);
    document.body.style.overflow = 'auto';
  };

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div className="fl-loading-screen">
        <div className="fl-spinner" />
        <p>Loading Freelancer Directory...</p>
      </div>
    );
  }

  return (
    <div className="fl-page">
      {/* Gradient Page Header */}
      <div className="fl-hero">
        <div className="fl-hero-inner">
          <h1>Find Freelancers</h1>
          <p>Browse vetted professionals across design, development, marketing & more.</p>
        </div>
      </div>

      <div className="fl-wrap">
        {error && <div className="fl-alert">{error}</div>}

        {/* Filter Bar */}
        <div className="fl-filter-bar">
          <input
            type="text"
            placeholder="Search by name, skill, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="fl-search"
          />

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="fl-sort">
            <option value="top-rated">Sort: Top Rated</option>
            <option value="most-projects">Sort: Most Projects</option>
            <option value="rate-low">Rate: Low to High</option>
            <option value="rate-high">Rate: High to Low</option>
          </select>
        </div>

        <div className="fl-count">
          Showing <strong>{filteredList.length}</strong> of{' '}
          <strong>{freelancers.length}</strong> freelancers
        </div>

        {/* Cards Grid */}
        {filteredList.length === 0 ? (
          <div className="fl-empty">
            <div className="fl-empty-emoji">🔍</div>
            <h3>No freelancers found</h3>
            <p>Adjust your search criteria and try again.</p>
          </div>
        ) : (
          <div className="fl-grid">
            {filteredList.map((f) => (
              <div key={f.freelancerId} className="fl-card" onClick={() => openProfile(f)}>
                {f.isTopRated && <span className="fl-top-badge">⭐ Top Rated</span>}
                <div className="fl-card-header">
                  <div className="fl-avatar">
                    {f.profileImage ? (
                      <img src={f.profileImage} alt={f.name} />
                    ) : (
                      f.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className={`fl-status-dot ${f.isAvailable ? 'online' : 'offline'}`} />
                </div>

                <h3 className="fl-name">{f.name}</h3>
                <p className="fl-headline">{f.headline}</p>
                <div className="fl-loc">📍 {f.location}</div>

                <div className="fl-metrics">
                  <div>
                    <span className="fl-metric-label">Rate</span>
                    <strong>{formatCurrency(f.hourlyRate)}/hr</strong>
                  </div>
                  <div>
                    <span className="fl-metric-label">Success</span>
                    <strong>{f.jobSuccessRate}%</strong>
                  </div>
                  <div>
                    <span className="fl-metric-label">Rating</span>
                    <strong>⭐ {f.averageRating.toFixed(1)}</strong>
                  </div>
                </div>

                {f.skills.length > 0 && (
                  <div className="fl-skills-preview">
                    {f.skills.slice(0, 3).map((skill, idx) => (
                      <span key={idx} className="fl-skill-chip">{String(skill).slice(0, 15)}</span>
                    ))}
                    {f.skills.length > 3 && (
                      <span className="fl-skill-chip more">+{f.skills.length - 3}</span>
                    )}
                  </div>
                )}

                <button className="fl-view-btn">View Full Profile →</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full Screen Profile Modal */}
      {selectedFreelancer && (
        <div className="fl-profile-overlay" onClick={closeProfile}>
          <div className="fl-profile-panel" onClick={(e) => e.stopPropagation()}>
            <button className="fl-close-btn" onClick={closeProfile}>
              ← Back to Freelancers
            </button>

            {selectedFreelancer._loading ? (
              <div className="fl-profile-loading">Loading profile...</div>
            ) : (
              <FullProfileView data={selectedFreelancer} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   FULL PROFILE VIEW
============================================================ */
function FullProfileView({ data }) {
  const f = data.full || {};
  const isAvailable = f.isAvailable ?? data.isAvailable;

  return (
    <div className="fl-profile-content">
      <div className="fl-cover-banner" />

      <div className="fl-profile-header">
        <div className="fl-profile-avatar">
          {data.profileImage ? (
            <img src={data.profileImage} alt={data.name} />
          ) : (
            <span>{data.name.charAt(0).toUpperCase()}</span>
          )}
          <div className={`fl-status-dot lg ${isAvailable ? 'online' : 'offline'}`} />
        </div>

        <div className="fl-profile-info">
          <div className="fl-name-row">
            <h1>{data.name}</h1>
            {f.isTopRated && <span className="fl-top-badge inline">⭐ Top Rated</span>}
          </div>
          <p className="fl-profile-headline">{f.headline || data.headline}</p>
          <div className="fl-profile-meta">
            <span>📍 {f.location || data.location}</span>
            <span>•</span>
            <span>{f.availability || 'Available'}</span>
            {f.responseTime && (<><span>•</span><span>Responds in {f.responseTime}</span></>)}
          </div>
        </div>

        <div className="fl-profile-actions">
          <div className="fl-rate-tag">{formatCurrency(f.hourlyRate || data.hourlyRate)}/hr</div>
        </div>
      </div>

      {/* Stats */}
      <div className="fl-stats-row">
        <div className="fl-stat-item">
          <span className="fl-stat-num">{f.projectsCompleted || 0}</span>
          <span className="fl-stat-lbl">Projects Completed</span>
        </div>
        <div className="fl-stat-item">
          <span className="fl-stat-num">{f.jobSuccessRate || 0}%</span>
          <span className="fl-stat-lbl">Success Rate</span>
        </div>
        <div className="fl-stat-item">
          <span className="fl-stat-num">
            ⭐ {f.dashboardStats?.averageRating?.toFixed(1) || '5.0'}
          </span>
          <span className="fl-stat-lbl">Average Rating</span>
        </div>
        <div className="fl-stat-item">
          <span className="fl-stat-num">{formatCurrency(f.totalEarnings || 0)}</span>
          <span className="fl-stat-lbl">Total Earned</span>
        </div>
      </div>

      {/* About */}
      {(f.bio || data.bio) && (
        <section className="fl-section">
          <h2>About</h2>
          <p className="fl-bio">{f.bio || data.bio}</p>
        </section>
      )}

      {/* Services */}
      {f.services?.length > 0 && (
        <section className="fl-section">
          <h2>Services</h2>
          <div className="fl-service-grid">
            {f.services.map((s, idx) => (
              <div key={idx} className="fl-service-card">
                <h4>{s.title}</h4>
                <p>{s.description}</p>
                <div className="fl-service-footer">
                  <span className="fl-service-price">From {formatCurrency(s.startingPrice)}</span>
                  <span className="fl-service-type">{s.serviceType}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Portfolio */}
      {f.portfolio?.length > 0 && (
        <section className="fl-section">
          <h2>Portfolio</h2>
          <div className="fl-portfolio-grid">
            {f.portfolio.map((p, idx) => (
              <div key={idx} className="fl-portfolio-card">
                {p.imageUrl && (
                  <div className="fl-portfolio-img">
                    <img src={p.imageUrl} alt={p.title} />
                  </div>
                )}
                <div className="fl-portfolio-body">
                  <span className="fl-portfolio-category">{p.category}</span>
                  <h4>{p.title}</h4>
                  <p>{p.description}</p>
                  {p.technologies?.length > 0 && (
                    <div className="fl-portfolio-tech">
                      {p.technologies.map((t, i) => (
                        <span key={i} className="fl-tech-chip">{t}</span>
                      ))}
                    </div>
                  )}
                  {p.projectUrl && (
                    <a href={p.projectUrl} target="_blank" rel="noopener noreferrer" className="fl-portfolio-link">
                      View Project →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {f.skills?.length > 0 && (
        <section className="fl-section">
          <h2>Skills & Expertise</h2>
          <div className="fl-skills-grid">
            {f.skills.map((skill, idx) => (
              <div key={idx} className="fl-skill-tag">
                {skill.skillId || skill}
                {skill.endorsementCount > 0 && (
                  <span className="fl-endorsement">{skill.endorsementCount}</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Experience */}
      {f.experience?.length > 0 && (
        <section className="fl-section">
          <h2>Work Experience</h2>
          <div className="fl-timeline">
            {f.experience.map((exp, idx) => (
              <div key={idx} className="fl-timeline-item">
                <div className="fl-timeline-dot" />
                <div className="fl-timeline-content">
                  <h4>{exp.position}</h4>
                  <div className="fl-timeline-meta">
                    <strong>{exp.company}</strong>
                    <span>•</span>
                    <span>{exp.employmentType}</span>
                  </div>
                  <div className="fl-timeline-date">
                    {formatDate(exp.startDate)} — {formatDate(exp.endDate)}
                    {exp.location && ` · ${exp.location}`}
                  </div>
                  {exp.description && <p>{exp.description}</p>}
                  {exp.technologies?.length > 0 && (
                    <div className="fl-portfolio-tech">
                      {exp.technologies.map((t, i) => (
                        <span key={i} className="fl-tech-chip">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {f.education?.length > 0 && (
        <section className="fl-section">
          <h2>Education</h2>
          <div className="fl-edu-list">
            {f.education.map((edu, idx) => (
              <div key={idx} className="fl-edu-item">
                <div className="fl-edu-icon">🎓</div>
                <div>
                  <h4>{edu.institution}</h4>
                  <p>{edu.degree} in {edu.field}</p>
                  <span className="fl-edu-year">
                    {edu.startYear} — {edu.endYear || 'Present'}
                  </span>
                  {edu.description && <p className="fl-edu-desc">{edu.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {f.certifications?.length > 0 && (
        <section className="fl-section">
          <h2>Certifications</h2>
          <div className="fl-cert-grid">
            {f.certifications.map((cert, idx) => (
              <div key={idx} className="fl-cert-card">
                <div className="fl-cert-icon">📜</div>
                <div>
                  <h4>{cert.name}</h4>
                  <p>{cert.issuer}</p>
                  <span className="fl-cert-date">
                    Issued {formatDate(cert.issueDate)}
                    {cert.expiryDate && ` · Expires ${formatDate(cert.expiryDate)}`}
                  </span>
                  {cert.credentialUrl && (
                    <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="fl-cert-link">
                      Show Credential
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}