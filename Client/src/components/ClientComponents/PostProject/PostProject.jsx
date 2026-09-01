// src/components/ClientComponents/PostProject/PostProject.jsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import API from '../../../api/axios';
import './PostProject.css';

const INITIAL_FORM = {
  title: '',
  description: '',
  categoryId: '',
  budget: '',
  startDate: '',
  deadline: '',
  projectType: 'fixed',
  workRequirements: '',
  skills: '',
  additionalNotes: '',
};

const TITLE_MAX = 100;
const DESC_MAX = 2000;
const NOTES_MAX = 500;

const PAYMENT_MODELS = [
  {
    value: 'fixed',
    label: 'Fixed Price',
    icon: '💰',
    tagline: 'Best for defined scope',
    desc: 'Pay a single lump sum for the entire project',
  },
  {
    value: 'hourly',
    label: 'Hourly Rate',
    icon: '⏱️',
    tagline: 'Best for ongoing work',
    desc: 'Pay for time worked with weekly billing',
  },
  {
    value: 'milestone',
    label: 'Milestone Based',
    icon: '🎯',
    tagline: 'Best for large projects',
    desc: 'Release payment on completion of milestones',
  },
];

const BUDGET_TIERS = [
  { label: 'Basic', range: '$100 – $500', min: 100, max: 500, tag: 'Simple task' },
  { label: 'Standard', range: '$500 – $2,000', min: 500, max: 2000, tag: 'Popular' },
  { label: 'Premium', range: '$2,000 – $10k+', min: 2000, max: 10000, tag: 'Complex' },
];

const STEPS = [
  { id: 1, title: 'Project Overview', short: 'Title & Category', icon: '📝' },
  { id: 2, title: 'Describe Your Work', short: 'Description & Skills', icon: '📄' },
  { id: 3, title: 'Budget & Timeline', short: 'Pricing & Dates', icon: '💵' },
  { id: 4, title: 'Additional Details', short: 'Requirements & Notes', icon: '⚙️' },
  { id: 5, title: 'Review & Publish', short: 'Final Check', icon: '🚀' },
];

/* ---------- Emoji Icon Resolver ---------- */
const EMOJI_MAP = {
  // Common category names
  'web': '🌐', 'web-development': '🌐', 'website': '🌐',
  'mobile': '📱', 'mobile-app': '📱', 'app': '📱',
  'design': '🎨', 'graphic-design': '🎨', 'graphics': '🎨',
  'uiux': '✨', 'ui-ux': '✨', 'ui': '✨', 'ux': '✨',
  'writing': '✍️', 'content': '✍️', 'content-writing': '✍️', 'copywriting': '✍️',
  'marketing': '📢', 'digital-marketing': '📢', 'seo': '📈',
  'video': '🎬', 'video-editing': '🎬', 'animation': '🎞️',
  'photography': '📷', 'photo': '📷',
  'music': '🎵', 'audio': '🎧',
  'business': '💼', 'consulting': '💼', 'finance': '💰',
  'data': '📊', 'data-entry': '📊', 'analytics': '📊',
  'translation': '🌍', 'language': '🌍',
  'programming': '💻', 'development': '💻', 'coding': '💻',
  'ai': '🤖', 'machine-learning': '🤖',
  'ecommerce': '🛒', 'e-commerce': '🛒', 'shop': '🛒',
  'game': '🎮', 'gaming': '🎮',
  'education': '🎓', 'tutoring': '🎓', 'teaching': '🎓',
  'health': '🏥', 'fitness': '💪',
  'legal': '⚖️', 'law': '⚖️',
  'social': '📱', 'social-media': '📱',
  'engineering': '⚙️', 'architecture': '🏗️',
  'other': '📁', 'general': '📁', 'misc': '📁',
};

const resolveEmoji = (raw) => {
  if (!raw) return '📁';
  const val = String(raw).trim();

  // If already an actual emoji (contains non-ASCII), return as-is
  // eslint-disable-next-line no-control-regex
  if (/[^\u0000-\u007F]/.test(val)) return val;

  // Strip colons from shortcodes like ":briefcase:"
  const clean = val.replace(/^:|:$/g, '').toLowerCase().trim();

  // Try direct match in map
  if (EMOJI_MAP[clean]) return EMOJI_MAP[clean];

  // Try normalized (spaces/underscores → hyphens)
  const normalized = clean.replace(/[\s_]+/g, '-');
  if (EMOJI_MAP[normalized]) return EMOJI_MAP[normalized];

  // Try Unicode codepoint like "1F4BC" or "U+1F4BC"
  const cp = clean.replace(/^u\+/, '').replace(/^0x/, '');
  if (/^[0-9a-f]{4,6}$/i.test(cp)) {
    try {
      return String.fromCodePoint(parseInt(cp, 16));
    } catch {
      /* ignore */
    }
  }

  // Fallback
  return '📁';
};

export default function PostProject() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(INITIAL_FORM);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);
  const [clientId, setClientId] = useState(null);
  const [loadingInit, setLoadingInit] = useState(true);
  const [visitedSteps, setVisitedSteps] = useState([1]);

  /* ---------- Initialize ---------- */
  useEffect(() => {
    const init = async () => {
      if (!user) return;
      const currentUserId = user.userId || user._id;

      try {
        const catRes = await API.get('/categories');
        const cats = catRes.data?.data || catRes.data || [];
        setCategories(Array.isArray(cats) ? cats.filter((c) => c.isActive !== false) : []);

        try {
          const clientRes = await API.get(`/clients?userId=${currentUserId}`);
          const clientData = Array.isArray(clientRes.data)
            ? clientRes.data[0]
            : clientRes.data?.data?.[0] || clientRes.data?.data || clientRes.data;
          setClientId(clientData?.clientId || clientData?._id || currentUserId);
        } catch {
          setClientId(currentUserId);
        }
      } catch (err) {
        console.error('Failed to initialize form:', err);
        setApiError('Failed to load required data. Please refresh the page.');
      } finally {
        setLoadingInit(false);
      }
    };

    init();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  /* ---------- Per-Step Validation ---------- */
  const validateStep = (currentStep) => {
    const e = {};

    if (currentStep === 1) {
      if (!form.title.trim()) e.title = 'A clear project title is required';
      else if (form.title.trim().length < 10) e.title = 'Please write at least 10 characters';
      else if (form.title.length > TITLE_MAX) e.title = `Title cannot exceed ${TITLE_MAX} characters`;

      if (!form.categoryId) e.categoryId = 'Please choose a category';
    }

    if (currentStep === 2) {
      if (!form.description.trim()) e.description = 'A project description is required';
      else if (form.description.trim().length < 30) e.description = 'Please write at least 30 characters';
      else if (form.description.length > DESC_MAX) e.description = `Description cannot exceed ${DESC_MAX} characters`;
    }

    if (currentStep === 3) {
      const budgetVal = Number(form.budget);
      if (!form.budget) e.budget = 'Please enter a budget';
      else if (isNaN(budgetVal) || budgetVal < 5) e.budget = 'Minimum budget is $5';

      if (!form.startDate) e.startDate = 'Please select a start date';
      if (!form.deadline) e.deadline = 'Please select a deadline';

      if (form.startDate && form.deadline && new Date(form.deadline) < new Date(form.startDate)) {
        e.deadline = 'Deadline cannot be before the start date';
      }
    }

    if (currentStep === 4) {
      if (form.additionalNotes.length > NOTES_MAX) {
        e.additionalNotes = `Notes cannot exceed ${NOTES_MAX} characters`;
      }
    }

    return e;
  };

  const validateAll = () => {
    return {
      ...validateStep(1),
      ...validateStep(2),
      ...validateStep(3),
      ...validateStep(4),
    };
  };

  const handleNext = () => {
    const errs = validateStep(step);
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      const nextStep = step + 1;
      setStep(nextStep);
      setVisitedSteps((prev) => Array.from(new Set([...prev, nextStep])));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const firstErrorKey = Object.keys(errs)[0];
      const el = document.getElementById(firstErrorKey);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const jumpToStep = (target) => {
    if (visitedSteps.includes(target)) {
      setStep(target);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /* ---------- Submit ---------- */
  const handleSubmit = async (publishStatus = 'draft') => {
    const valErrors = validateAll();
    setErrors(valErrors);
    if (Object.keys(valErrors).length > 0) {
      // Jump to first step with errors
      if (valErrors.title || valErrors.categoryId) setStep(1);
      else if (valErrors.description) setStep(2);
      else if (valErrors.budget || valErrors.startDate || valErrors.deadline) setStep(3);
      else if (valErrors.additionalNotes) setStep(4);
      return;
    }

    if (!clientId) {
      setApiError('Client profile not loaded. Please refresh the page.');
      return;
    }

    setSubmitting(true);
    setApiError('');

    const payload = {
      clientId,
      categoryId: form.categoryId,
      title: form.title.trim(),
      description: form.description.trim(),
      budget: Number(form.budget),
      startDate: form.startDate,
      deadline: form.deadline,
      status: publishStatus,
      progress: 0,
      tasks: [],
      metadata: {
        projectType: form.projectType,
        requiredSkills: form.skills
          ? form.skills.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        workRequirements: form.workRequirements.trim(),
        additionalNotes: form.additionalNotes.trim(),
      },
    };

    try {
      await API.post('/projects', payload);
      setSuccess(true);
      setTimeout(() => navigate('/client/my-projects'), 1800);
    } catch (err) {
      console.error('Project submission failed:', err);
      setApiError(err.response?.data?.message || err.message || 'Failed to publish project.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCategory = useMemo(
    () => categories.find((c) => (c.categoryId || c._id) === form.categoryId),
    [categories, form.categoryId]
  );

  const projectDuration = useMemo(() => {
    if (!form.startDate || !form.deadline) return null;
    const days = Math.ceil(
      (new Date(form.deadline) - new Date(form.startDate)) / (1000 * 60 * 60 * 24)
    );
    return days >= 0 ? days : null;
  }, [form.startDate, form.deadline]);

  const overallProgress = useMemo(() => {
    const required = ['title', 'description', 'categoryId', 'budget', 'startDate', 'deadline'];
    const filled = required.filter((k) => String(form[k]).trim().length > 0).length;
    return Math.round((filled / required.length) * 100);
  }, [form]);

  const setBudgetTier = (tier) => {
    setForm((prev) => ({ ...prev, budget: String(tier.min) }));
    if (errors.budget) setErrors((prev) => ({ ...prev, budget: '' }));
  };

  /* ---------- Loading ---------- */
  if (loadingInit) {
    return (
      <div className="pp-loading">
        <div className="pp-spinner" />
        <p>Preparing your workspace...</p>
      </div>
    );
  }

  /* ---------- Success ---------- */
  if (success) {
    return (
      <div className="pp-page">
        <div className="pp-success-wrap">
          <div className="pp-success-card">
            <div className="pp-success-check">
              <svg viewBox="0 0 52 52" className="pp-check-svg">
                <circle className="pp-check-circle" cx="26" cy="26" r="24" fill="none" />
                <path className="pp-check-mark" fill="none" d="M14,27 L22,35 L39,18" />
              </svg>
            </div>
            <h2>Your project is live! 🎉</h2>
            <p>Freelancers will start submitting proposals within minutes. Redirecting you...</p>
            <div className="pp-success-loader">
              <div className="pp-success-loader-fill" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pp-page">
      {/* Hero */}
      <div className="pp-hero">
        <div className="pp-hero-inner">
          <button
            type="button"
            className="pp-back-link"
            onClick={() => navigate('/client/dashboard')}
          >
            ← Back to Dashboard
          </button>
          <h1>Tell us what you need done</h1>
          <p>Answer a few questions to help us match you with the best freelancers.</p>
        </div>
      </div>

      {/* Step Bar */}
      <div className="pp-stepbar-wrap">
        <div className="pp-stepbar">
          {STEPS.map((s, idx) => {
            const isActive = s.id === step;
            const isDone = visitedSteps.includes(s.id) && s.id < step;
            const isClickable = visitedSteps.includes(s.id);
            return (
              <div key={s.id} className="pp-step-node">
                <button
                  type="button"
                  className={`pp-step-btn ${isActive ? 'active' : ''} ${isDone ? 'done' : ''} ${isClickable ? 'clickable' : ''}`}
                  onClick={() => jumpToStep(s.id)}
                  disabled={!isClickable}
                >
                  <div className="pp-step-circle">
                    {isDone ? '✓' : s.id}
                  </div>
                  <div className="pp-step-label">
                    <span className="pp-step-count">Step {s.id}</span>
                    <strong>{s.short}</strong>
                  </div>
                </button>
                {idx < STEPS.length - 1 && (
                  <div className={`pp-step-connector ${isDone ? 'done' : ''}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="pp-container">
        {apiError && (
          <div className="pp-alert error">
            <span className="pp-alert-icon">⚠️</span>
            <div>
              <strong>Something went wrong</strong>
              <p>{apiError}</p>
            </div>
          </div>
        )}

        <div className="pp-layout">
          {/* MAIN CONTENT */}
          <div className="pp-main">
            <div className="pp-step-card">
              {/* ---------- STEP 1: PROJECT OVERVIEW ---------- */}
              {step === 1 && (
                <>
                  <div className="pp-step-head">
                    <span className="pp-step-icon">📝</span>
                    <div>
                      <h2>Let's start with the basics</h2>
                      <p>A clear title and category attract the right freelancers</p>
                    </div>
                  </div>

                  <div className="pp-field">
                    <label htmlFor="title">
                      What's your project called? <span className="pp-req">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="e.g. Logo design for a new tech startup"
                      className={errors.title ? 'pp-invalid' : ''}
                      maxLength={TITLE_MAX}
                      autoFocus
                    />
                    <div className="pp-field-footer">
                      {errors.title ? (
                        <span className="pp-error-msg">{errors.title}</span>
                      ) : (
                        <span className="pp-hint">💡 Great titles are specific and 40-80 characters</span>
                      )}
                      <span className={`pp-counter ${form.title.length > TITLE_MAX * 0.9 ? 'warning' : ''}`}>
                        {form.title.length}/{TITLE_MAX}
                      </span>
                    </div>
                  </div>

                  <div className="pp-field">
                    <label>
                      Which category best fits? <span className="pp-req">*</span>
                    </label>
                    {categories.length === 0 ? (
                      <div className="pp-empty-cat">No categories available.</div>
                    ) : (
                      <div className="pp-cat-grid">
                        {categories.map((cat) => {
                          const cid = cat.categoryId || cat._id;
                          const isSelected = form.categoryId === cid;
                          return (
                            <button
                              type="button"
                              key={cid}
                              className={`pp-cat-tile ${isSelected ? 'active' : ''}`}
                              onClick={() =>
                                setForm((prev) => ({ ...prev, categoryId: cid }))
                              }
                            >
                              <div className="pp-cat-icon">{resolveEmoji(cat.icon)}</div>
                              <div className="pp-cat-name">{cat.name}</div>
                              {isSelected && <div className="pp-cat-check">✓</div>}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {errors.categoryId && <span className="pp-error-msg mt">{errors.categoryId}</span>}
                  </div>
                </>
              )}

              {/* ---------- STEP 2: DESCRIBE YOUR WORK ---------- */}
              {step === 2 && (
                <>
                  <div className="pp-step-head">
                    <span className="pp-step-icon">📄</span>
                    <div>
                      <h2>Describe your project in detail</h2>
                      <p>The more context you provide, the better proposals you'll receive</p>
                    </div>
                  </div>

                  <div className="pp-field">
                    <label htmlFor="description">
                      Project Description <span className="pp-req">*</span>
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows="9"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Explain your goals, target audience, key features, expected outcomes, and any specific requirements..."
                      className={errors.description ? 'pp-invalid' : ''}
                      maxLength={DESC_MAX}
                      autoFocus
                    />
                    <div className="pp-field-footer">
                      {errors.description ? (
                        <span className="pp-error-msg">{errors.description}</span>
                      ) : (
                        <span className="pp-hint">✍️ Aim for 150+ words with clear deliverables</span>
                      )}
                      <span className={`pp-counter ${form.description.length > DESC_MAX * 0.9 ? 'warning' : ''}`}>
                        {form.description.length}/{DESC_MAX}
                      </span>
                    </div>
                  </div>

                  <div className="pp-write-help">
                    <h4>💎 Try covering:</h4>
                    <div className="pp-help-tags">
                      <span>Project goals</span>
                      <span>Target audience</span>
                      <span>Key features</span>
                      <span>Style preferences</span>
                      <span>Tech requirements</span>
                      <span>Reference examples</span>
                    </div>
                  </div>

                  <div className="pp-field">
                    <label htmlFor="skills">
                      Required Skills
                      <span className="pp-opt">Optional but recommended</span>
                    </label>
                    <input
                      type="text"
                      id="skills"
                      name="skills"
                      value={form.skills}
                      onChange={handleChange}
                      placeholder="React, Node.js, MongoDB, TypeScript..."
                    />
                    <span className="pp-hint">💡 Separate multiple skills with commas</span>

                    {form.skills && (
                      <div className="pp-chip-row">
                        {form.skills.split(',').map((s, i) => s.trim() && (
                          <span key={i} className="pp-chip">{s.trim()}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ---------- STEP 3: BUDGET & TIMELINE ---------- */}
              {step === 3 && (
                <>
                  <div className="pp-step-head">
                    <span className="pp-step-icon">💵</span>
                    <div>
                      <h2>Set your budget and timeline</h2>
                      <p>Realistic budgets and timelines attract higher-quality proposals</p>
                    </div>
                  </div>

                  {/* Payment Model */}
                  <div className="pp-field">
                    <label>How would you like to pay?</label>
                    <div className="pp-model-grid">
                      {PAYMENT_MODELS.map((model) => (
                        <button
                          type="button"
                          key={model.value}
                          className={`pp-model-card ${form.projectType === model.value ? 'active' : ''}`}
                          onClick={() => setForm((prev) => ({ ...prev, projectType: model.value }))}
                        >
                          <div className="pp-model-top">
                            <div className="pp-model-icon">{model.icon}</div>
                            {form.projectType === model.value && (
                              <span className="pp-model-selected">Selected</span>
                            )}
                          </div>
                          <strong>{model.label}</strong>
                          <span className="pp-model-tag">{model.tagline}</span>
                          <p>{model.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Budget Tiers */}
                  <div className="pp-field">
                    <label>
                      Choose your budget tier
                      <span className="pp-opt">Or enter a custom amount below</span>
                    </label>
                    <div className="pp-tier-grid">
                      {BUDGET_TIERS.map((tier) => {
                        const isActive = Number(form.budget) >= tier.min && Number(form.budget) <= tier.max;
                        return (
                          <button
                            type="button"
                            key={tier.label}
                            className={`pp-tier-card ${isActive ? 'active' : ''}`}
                            onClick={() => setBudgetTier(tier)}
                          >
                            {tier.tag === 'Popular' && <span className="pp-tier-ribbon">Most Popular</span>}
                            <strong>{tier.label}</strong>
                            <span className="pp-tier-range">{tier.range}</span>
                            <span className="pp-tier-tag">{tier.tag}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Budget */}
                  <div className="pp-field">
                    <label htmlFor="budget">
                      Your Budget (USD) <span className="pp-req">*</span>
                    </label>
                    <div className="pp-budget-wrap">
                      <span className="pp-currency-prefix">$</span>
                      <input
                        type="number"
                        id="budget"
                        name="budget"
                        min="5"
                        step="1"
                        value={form.budget}
                        onChange={handleChange}
                        placeholder="1,500"
                        className={`pp-budget-input ${errors.budget ? 'pp-invalid' : ''}`}
                      />
                      <span className="pp-budget-suffix">
                        {form.projectType === 'hourly' ? '/hour' : 'total'}
                      </span>
                    </div>
                    {errors.budget && <span className="pp-error-msg">{errors.budget}</span>}
                  </div>

                  {/* Timeline */}
                  <div className="pp-field">
                    <label>
                      When do you need this done? <span className="pp-req">*</span>
                    </label>
                    <div className="pp-date-row">
                      <div>
                        <span className="pp-date-label">Start Date</span>
                        <input
                          type="date"
                          id="startDate"
                          name="startDate"
                          value={form.startDate}
                          onChange={handleChange}
                          min={new Date().toISOString().split('T')[0]}
                          className={errors.startDate ? 'pp-invalid' : ''}
                        />
                        {errors.startDate && <span className="pp-error-msg">{errors.startDate}</span>}
                      </div>

                      <div className="pp-date-arrow">→</div>

                      <div>
                        <span className="pp-date-label">Deadline</span>
                        <input
                          type="date"
                          id="deadline"
                          name="deadline"
                          value={form.deadline}
                          onChange={handleChange}
                          min={form.startDate || new Date().toISOString().split('T')[0]}
                          className={errors.deadline ? 'pp-invalid' : ''}
                        />
                        {errors.deadline && <span className="pp-error-msg">{errors.deadline}</span>}
                      </div>
                    </div>

                    {projectDuration !== null && (
                      <div className="pp-duration-tag">
                        <span>⏳</span>
                        <div>
                          <strong>{projectDuration} days</strong>
                          <span>Estimated project duration</span>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ---------- STEP 4: ADDITIONAL DETAILS ---------- */}
              {step === 4 && (
                <>
                  <div className="pp-step-head">
                    <span className="pp-step-icon">⚙️</span>
                    <div>
                      <h2>Add extra details</h2>
                      <p>Help freelancers understand exactly what you expect</p>
                    </div>
                  </div>

                  <div className="pp-field">
                    <label htmlFor="workRequirements">
                      Deliverables & Requirements
                      <span className="pp-opt">Optional</span>
                    </label>
                    <textarea
                      id="workRequirements"
                      name="workRequirements"
                      rows="5"
                      value={form.workRequirements}
                      onChange={handleChange}
                      placeholder="List key milestones, code standards, design specifications, documentation requirements, testing needs..."
                      autoFocus
                    />
                    <span className="pp-hint">📋 Bullet points work great here</span>
                  </div>

                  <div className="pp-field">
                    <label htmlFor="additionalNotes">
                      Additional Notes
                      <span className="pp-opt">Optional</span>
                    </label>
                    <textarea
                      id="additionalNotes"
                      name="additionalNotes"
                      rows="4"
                      value={form.additionalNotes}
                      onChange={handleChange}
                      placeholder="Communication preferences, time zone, meeting availability, working hours..."
                      maxLength={NOTES_MAX}
                    />
                    <div className="pp-field-footer">
                      <span className="pp-error-msg">{errors.additionalNotes}</span>
                      <span className="pp-counter">{form.additionalNotes.length}/{NOTES_MAX}</span>
                    </div>
                  </div>
                </>
              )}

              {/* ---------- STEP 5: REVIEW ---------- */}
              {step === 5 && (
                <>
                  <div className="pp-step-head">
                    <span className="pp-step-icon">🚀</span>
                    <div>
                      <h2>Ready to publish!</h2>
                      <p>Review your project details before it goes live</p>
                    </div>
                  </div>

                  <div className="pp-review-card">
                    <div className="pp-review-hero">
                      <div className="pp-review-badges">
                        <span className="pp-r-badge pp-r-cat">
                          {selectedCategory?.icon || '📁'} {selectedCategory?.name || 'Category'}
                        </span>
                        <span className="pp-r-badge pp-r-budget">
                          💰 ${Number(form.budget).toLocaleString()}
                        </span>
                        <span className="pp-r-badge pp-r-type">
                          {PAYMENT_MODELS.find((m) => m.value === form.projectType)?.icon}{' '}
                          {PAYMENT_MODELS.find((m) => m.value === form.projectType)?.label}
                        </span>
                        {projectDuration !== null && (
                          <span className="pp-r-badge pp-r-time">⏱️ {projectDuration} days</span>
                        )}
                      </div>
                      <h3>{form.title}</h3>
                    </div>

                    <div className="pp-review-section">
                      <h4>Description</h4>
                      <p>{form.description}</p>
                    </div>

                    <div className="pp-review-grid">
                      <div>
                        <span className="pp-r-label">📅 Start Date</span>
                        <strong>
                          {new Date(form.startDate).toLocaleDateString('en-US', {
                            month: 'long', day: 'numeric', year: 'numeric',
                          })}
                        </strong>
                      </div>
                      <div>
                        <span className="pp-r-label">🎯 Deadline</span>
                        <strong>
                          {new Date(form.deadline).toLocaleDateString('en-US', {
                            month: 'long', day: 'numeric', year: 'numeric',
                          })}
                        </strong>
                      </div>
                    </div>

                    {form.skills && (
                      <div className="pp-review-section">
                        <h4>Required Skills</h4>
                        <div className="pp-chip-row">
                          {form.skills.split(',').map((s, i) => s.trim() && (
                            <span key={i} className="pp-chip">{s.trim()}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {form.workRequirements && (
                      <div className="pp-review-section">
                        <h4>Deliverables & Requirements</h4>
                        <p>{form.workRequirements}</p>
                      </div>
                    )}

                    {form.additionalNotes && (
                      <div className="pp-review-section">
                        <h4>Additional Notes</h4>
                        <p>{form.additionalNotes}</p>
                      </div>
                    )}
                  </div>

                  <div className="pp-publish-cta">
                    <div className="pp-cta-text">
                      <h4>Everything looks good?</h4>
                      <p>Choose how you'd like to save your project</p>
                    </div>
                    <div className="pp-cta-actions">
                      <button
                        type="button"
                        className="pp-btn pp-btn-outline"
                        onClick={() => handleSubmit('draft')}
                        disabled={submitting}
                      >
                        💾 Save as Draft
                      </button>
                      <button
                        type="button"
                        className="pp-btn pp-btn-primary large"
                        onClick={() => handleSubmit('open')}
                        disabled={submitting}
                      >
                        {submitting ? 'Publishing...' : '🚀 Publish Now'}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Navigation Footer */}
            {step < 5 && (
              <div className="pp-nav-footer">
                <button
                  type="button"
                  className="pp-btn pp-btn-ghost"
                  onClick={handleBack}
                  disabled={step === 1}
                >
                  ← Back
                </button>

                <div className="pp-progress-mini">
                  Step {step} of {STEPS.length}
                </div>

                <button
                  type="button"
                  className="pp-btn pp-btn-primary"
                  onClick={handleNext}
                >
                  Continue →
                </button>
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <aside className="pp-side">
            {/* Live Preview */}
            <div className="pp-side-card pp-live-preview">
              <div className="pp-side-head">
                <span>👁️</span>
                <h3>Live Preview</h3>
              </div>

              <div className="pp-lp-card">
                {selectedCategory && (
                  <span className="pp-lp-cat">
                    {selectedCategory.icon || '📁'} {selectedCategory.name}
                  </span>
                )}
                <h4>{form.title || <em className="pp-lp-empty">Your title will appear here...</em>}</h4>
                <p>
                  {form.description
                    ? (form.description.length > 120
                        ? `${form.description.slice(0, 120)}...`
                        : form.description)
                    : <em className="pp-lp-empty">Description preview will appear here...</em>
                  }
                </p>
                <div className="pp-lp-meta">
                  {form.budget && (
                    <span className="pp-lp-budget">${Number(form.budget).toLocaleString()}</span>
                  )}
                  {projectDuration !== null && (
                    <span className="pp-lp-time">⏱️ {projectDuration}d</span>
                  )}
                </div>
              </div>

              <div className="pp-lp-progress">
                <div className="pp-lp-progress-head">
                  <span>Project Readiness</span>
                  <strong>{overallProgress}%</strong>
                </div>
                <div className="pp-lp-bar">
                  <div className="pp-lp-fill" style={{ width: `${overallProgress}%` }} />
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="pp-side-card pp-tips">
              <div className="pp-side-head">
                <span>💎</span>
                <h3>
                  {step === 1 && 'Writing a great title'}
                  {step === 2 && 'Description tips'}
                  {step === 3 && 'Budget guidance'}
                  {step === 4 && 'Extra details'}
                  {step === 5 && 'Before you publish'}
                </h3>
              </div>

              <ul className="pp-tips-list">
                {step === 1 && (
                  <>
                    <li>Be specific about deliverables</li>
                    <li>Include key technologies or tools</li>
                    <li>Avoid vague titles like "Need help"</li>
                    <li>Aim for 40-80 characters</li>
                  </>
                )}
                {step === 2 && (
                  <>
                    <li>Explain your business context</li>
                    <li>List must-have features first</li>
                    <li>Attach references or examples</li>
                    <li>Mention integrations needed</li>
                  </>
                )}
                {step === 3 && (
                  <>
                    <li>Research similar project rates</li>
                    <li>Higher budgets attract experts</li>
                    <li>Add 20% buffer for revisions</li>
                    <li>Set realistic deadlines</li>
                  </>
                )}
                {step === 4 && (
                  <>
                    <li>Break down deliverables clearly</li>
                    <li>Specify communication preferences</li>
                    <li>Mention timezone requirements</li>
                    <li>Note any NDA requirements</li>
                  </>
                )}
                {step === 5 && (
                  <>
                    <li>Double-check spelling and grammar</li>
                    <li>Verify budget and dates are correct</li>
                    <li>Publishing sends notifications instantly</li>
                    <li>You can edit anytime after posting</li>
                  </>
                )}
              </ul>
            </div>

            {/* Trust Badge */}
            <div className="pp-side-card pp-trust">
              <div className="pp-trust-icon">🛡️</div>
              <strong>Secure & Protected</strong>
              <p>All payments held in escrow. Money released only when you approve the work.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}