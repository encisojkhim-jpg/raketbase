import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export default function FreelancerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  // User session
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  })();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [bidAmount, setBidAmount] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  const [touched, setTouched] = useState({ bidAmount: false, coverLetter: false });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadJob() {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/jobs/${id}`);
        const body = await res.json();
        if (!res.ok || !body.success) {
          throw new Error(body.error || 'Job not found.');
        }
        if (!cancelled) setJob(body.data);
      } catch (err) {
        if (!cancelled) setLoadError(err.message || 'Could not load this job.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadJob();
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !id) return;
    let cancelled = false;
    async function checkExistingProposal() {
      try {
        const res = await fetch(`${API_BASE_URL}/proposals/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await res.json();
        if (!cancelled && res.ok && body.success && Array.isArray(body.data)) {
          const hasApplied = body.data.some((p) => String(p.job_id) === String(id));
          if (hasApplied) setAlreadyApplied(true);
        }
      } catch {}
    }
    checkExistingProposal();
    return () => { cancelled = true; };
  }, [id]);

  function getValidationErrors() {
    const errors = {};
    const amount = Number(bidAmount);
    if (!String(bidAmount).trim() || Number.isNaN(amount) || amount <= 0) {
      errors.bidAmount = 'Enter a bid amount greater than 0.';
    }
    if (!coverLetter.trim()) {
      errors.coverLetter = 'A cover letter is required.';
    } else if (coverLetter.trim().length < 20) {
      errors.coverLetter = `Write a bit more — ${20 - coverLetter.trim().length} characters to go.`;
    }
    return errors;
  }

  const errors = getValidationErrors();
  const showBidError = (touched.bidAmount || submitted) && errors.bidAmount;
  const showCoverLetterError = (touched.coverLetter || submitted) && errors.coverLetter;

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitResult(null);
    setSubmitted(true);
    setTouched({ bidAmount: true, coverLetter: true });
    if (Object.keys(errors).length > 0 || alreadyApplied) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('You need to be logged in to submit a proposal.');

      const res = await fetch(`${API_BASE_URL}/proposals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          job_id: job.job_id,
          bid_amount: Number(bidAmount),
          cover_letter: coverLetter.trim(),
        }),
      });
      const body = await res.json();
      if (res.status === 409 || body.error?.includes('already submitted')) {
        setAlreadyApplied(true);
        setSubmitResult({ type: 'error', message: body.error || 'You have already submitted a proposal for this job.' });
        return;
      }
      if (!res.ok || !body.success) {
        throw new Error(body.error || body.message || 'Could not submit your proposal.');
      }
      setAlreadyApplied(true);
      setSubmitResult({ type: 'success', message: 'Proposal sent! The client will review it soon.' });
      setBidAmount('');
      setCoverLetter('');
    } catch (err) {
      setSubmitResult({ type: 'error', message: err.message || 'Something went wrong while submitting.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="sidebar-wrapper" id="sidebar">
        <Link to="/" className="sidebar-brand text-decoration-none d-flex align-items-center gap-1" style={{ padding: '10px 0' }}>
          <img src="/racketbaseSVG.svg" alt="RaketBase Logo" style={{ height: '50px', objectFit: 'contain', marginTop: '-8px' }} />
          <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '24px', color: '#fff', letterSpacing: '0.5px', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontWeight: 800 }}>RAKET</span>
            <span style={{ fontWeight: 400 }}>BASE</span>
          </div>
        </Link>
        <div className="flex-grow-1 overflow-y-auto mt-4">
          <div className="sidebar-menu-section">
            <div className="sidebar-menu-title">Menu</div>
            <ul className="sidebar-menu-list">
              <li className="sidebar-menu-item">
                <Link to="/dashboard" className="sidebar-menu-link">
                  <i className="bi bi-grid-fill"></i>
                  <span>Dashboard</span>
                </Link>
              </li>
              <li className="sidebar-menu-item">
                <Link to={`/freelancer/${user.user_id || user.id}`} className="sidebar-menu-link">
                  <i className="bi bi-person"></i>
                  <span>My Account</span>
                </Link>
              </li>
            </ul>
          </div>
          <div className="sidebar-menu-section">
            <div className="sidebar-menu-title">Jobs</div>
            <ul className="sidebar-menu-list">
              <li className="sidebar-menu-item">
                <Link to="/explore" className="sidebar-menu-link">
                  <i className="bi bi-search"></i>
                  <span>Explore Jobs</span>
                </Link>
              </li>
              {user.active_role === 'customer' && (
                <>
                  <li className="sidebar-menu-item">
                    <Link to="/my-jobs" className="sidebar-menu-link">
                      <i className="bi bi-briefcase"></i>
                      <span>My Postings</span>
                    </Link>
                  </li>
                  <li className="sidebar-menu-item">
                    <Link to="/jobs/create" className="sidebar-menu-link">
                      <i className="bi bi-plus-circle"></i>
                      <span>Post a Job</span>
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
        <div className="sidebar-profile">
          <img src={user.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop"} alt="Profile" className="sidebar-profile-img" />
          <div className="sidebar-profile-info">
            <div className="sidebar-profile-name">{user.first_name || 'User'} {user.last_name || ''}</div>
            <div className="sidebar-profile-email">{user.email || 'user@example.com'}</div>
          </div>
        </div>
      </div>

      <div className="main-wrapper">
        <header className="navbar-custom">
          <div className="navbar-left">
            <button className="sidebar-toggle-btn me-2" id="sidebar-toggle">
              <i className="bi bi-list"></i>
            </button>
            <button className="btn btn-light rounded-pill px-3 ms-2 d-none d-md-flex align-items-center" onClick={() => navigate('/explore')}>
              <i className="bi bi-arrow-left me-1"></i> Back to Explore
            </button>
          </div>
          <div className="navbar-search-wrapper"></div>
          <div className="navbar-actions">
            <div className="dropdown ms-2">
              <button className="navbar-profile-btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                <img src={user.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop"} alt="Profile" className="navbar-profile-img" />
                <span className="navbar-profile-name d-none d-md-inline">{user.first_name || 'User'}</span>
                <i className="bi bi-chevron-down navbar-profile-caret"></i>
              </button>
              <ul className="dropdown-menu dropdown-menu-end dropdown-menu-profile">
                <li className="dropdown-header">Welcome !</li>
                <li><Link className="dropdown-item" to="#"><i className="bi bi-person"></i> My Account</Link></li>
                <li><Link className="dropdown-item" to="#"><i className="bi bi-gear"></i> Settings</Link></li>
                <li><hr className="dropdown-divider" /></li>
                <li><Link className="dropdown-item text-danger" to="/login" onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); }}><i className="bi bi-box-arrow-right"></i> Logout</Link></li>
              </ul>
            </div>
          </div>
        </header>

        <div className="page-header d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">Job Details</h1>
            <p className="page-subtitle">Review the requirements and submit your proposal.</p>
          </div>
          <button className="btn btn-outline-dark rounded-pill px-3 d-md-none" onClick={() => navigate('/explore')}>
            <i className="bi bi-arrow-left me-1"></i> Back
          </button>
        </div>

        <div className="px-3 mb-4">
          {loading && (
            <div className="card text-center py-5 border">
              <div className="card-body">
                <h5 className="card-title fw-medium text-dark">Loading job...</h5>
              </div>
            </div>
          )}

          {!loading && loadError && (
            <div className="card text-center py-5 border">
              <div className="card-body">
                <h5 className="card-title fw-medium text-dark">Couldn't load this job</h5>
                <p className="card-text text-muted">{loadError}</p>
                <button className="btn btn-outline-dark mt-3 rounded-pill px-4" onClick={() => window.location.reload()}>Try again</button>
              </div>
            </div>
          )}

          {!loading && !loadError && job && (
            <div className="row g-4">
              <div className="col-xl-8 col-lg-7">
                <div className="card h-100 border">
                  <div className="card-body p-4 p-md-5">
                    <div className="d-flex flex-wrap items-center gap-2 mb-3">
                      <span className="badge bg-light border text-dark fw-semibold px-3 py-2 rounded-pill" style={{ fontSize: '0.85rem' }}>
                        {job.categories?.category_name || 'Uncategorized'}
                      </span>
                      {alreadyApplied && (
                        <span className="badge bg-success-subtle text-success border border-success fw-medium px-3 py-2 rounded-pill">
                          <i className="bi bi-check-circle me-1"></i> Applied
                        </span>
                      )}
                    </div>
                    
                    <h2 className="fw-bold text-dark mb-3" style={{ fontSize: '2rem' }}>
                      {job.title || 'Untitled job'}
                    </h2>
                    
                    <p className="text-muted d-flex align-items-center mb-4">
                      <i className="bi bi-clock me-2"></i>
                      Posted {formatDate(job.created_at)}
                      {job.users && ` by ${job.users.first_name} ${job.users.last_name}`}
                    </p>
                    
                    <hr className="my-4" />
                    
                    <h5 className="fw-bold text-dark mb-3">Description</h5>
                    <p className="text-muted" style={{ whiteSpace: 'pre-line', lineHeight: '1.8' }}>
                      {job.description || 'No description provided.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-xl-4 col-lg-5">
                <div className="card border sticky-top" style={{ top: '90px' }}>
                  <div className="card-body p-4">
                    <p className="text-muted small fw-medium text-uppercase mb-1">Budget</p>
                    <h3 className="fw-bold text-success mb-4">
                      ₱{job.budget ? Number(job.budget).toLocaleString() : '—'}
                    </h3>
                    
                    {alreadyApplied && (
                      <div className="alert alert-success d-flex align-items-center mb-4" role="alert">
                        <i className="bi bi-check-circle-fill me-2 fs-5"></i>
                        <div>
                          <strong>Already Applied</strong>
                          <div className="small">You have already submitted a proposal for this job.</div>
                        </div>
                      </div>
                    )}
                    
                    <hr className="my-4" />
                    
                    <h5 className="fw-bold text-dark mb-3">Submit a Proposal</h5>
                    
                    <form onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label className="form-label fw-medium small text-dark">Your bid (₱)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          disabled={submitting || alreadyApplied}
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          onBlur={() => setTouched((t) => ({ ...t, bidAmount: true }))}
                          className={`form-control bg-light ${showBidError ? 'is-invalid' : ''}`}
                          placeholder="e.g. 15000"
                        />
                        {showBidError && (
                          <div className="invalid-feedback">{errors.bidAmount}</div>
                        )}
                      </div>
                      
                      <div className="mb-4">
                        <label className="form-label fw-medium small text-dark">Cover letter</label>
                        <textarea
                          rows="6"
                          disabled={submitting || alreadyApplied}
                          value={coverLetter}
                          onChange={(e) => setCoverLetter(e.target.value)}
                          onBlur={() => setTouched((t) => ({ ...t, coverLetter: true }))}
                          className={`form-control bg-light ${showCoverLetterError ? 'is-invalid' : ''}`}
                          placeholder="Explain why you're a good fit for this job."
                          style={{ resize: 'none' }}
                        ></textarea>
                        {showCoverLetterError && (
                          <div className="invalid-feedback">{errors.coverLetter}</div>
                        )}
                      </div>
                      
                      <button
                        type="submit"
                        disabled={submitting || alreadyApplied}
                        className="btn btn-dark w-100 rounded-pill fw-medium py-2"
                      >
                        {alreadyApplied ? 'Already Applied' : submitting ? 'Submitting...' : 'Submit proposal'}
                      </button>
                      
                      {submitResult && (
                        <div className={`alert ${submitResult.type === 'success' ? 'alert-success' : 'alert-danger'} mt-3 mb-0 small py-2`} role="alert">
                          {submitResult.message}
                        </div>
                      )}
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function formatDate(value) {
  if (!value) return 'recently';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'recently';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
