import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import BackToTop from '../components/BackToTop';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export default function Explore() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [activeCategory, setActiveCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [budget, setBudget] = useState(null);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  })();

  useEffect(() => {
    let cancelled = false;

    async function loadJobs() {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/jobs`);
        const body = await res.json();
        if (!res.ok || !body.success) {
          throw new Error(body.error || `Request failed (${res.status})`);
        }
        if (cancelled) return;

        const data = body.data || [];
        setJobs(data);

        if (data.length) {
          const amounts = data.map((j) => Number(j.budget) || 0);
          setBudget({ min: Math.min(...amounts), max: Math.max(...amounts) });
        } else {
          setBudget({ min: 0, max: 0 });
        }
      } catch (err) {
        if (!cancelled) setLoadError(err.message || 'Could not load jobs.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadJobs();
    return () => {
      cancelled = true;
    };
  }, []);

  const budgetBounds = useMemo(() => {
    if (!jobs.length) return { min: 0, max: 0 };
    const amounts = jobs.map((j) => Number(j.budget) || 0);
    return { min: Math.min(...amounts), max: Math.max(...amounts) };
  }, [jobs]);

  const categories = useMemo(() => {
    const counts = {};
    for (const j of jobs) {
      const name = j.categories?.category_name || 'Other';
      counts[name] = (counts[name] || 0) + 1;
    }
    const list = Object.entries(counts).map(([name, count]) => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      label: name,
      count,
    }));
    return [{ id: 'all', name: 'All', label: 'All', count: jobs.length }, ...list];
  }, [jobs]);

  const visibleJobs = useMemo(() => {
    return jobs.filter((j) => {
      if (activeCategory !== 'all') {
        const catName = (j.categories?.category_name || 'Other').toLowerCase().replace(/\s+/g, '-');
        if (catName !== activeCategory) return false;
      }
      if (query.trim()) {
        const q = query.toLowerCase();
        const inTitle = j.title?.toLowerCase().includes(q);
        const inDesc = j.description?.toLowerCase().includes(q);
        if (!inTitle && !inDesc) return false;
      }
      if (budget) {
        const amount = Number(j.budget) || 0;
        if (amount < budget.min || amount > budget.max) return false;
      }
      return true;
    });
  }, [jobs, activeCategory, query, budget]);

  function resetFilters() {
    setActiveCategory('all');
    setQuery('');
    setBudget(budgetBounds);
  }

  return (
    <>


        <div className="page-header d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">Explore Jobs</h1>
            <p className="page-subtitle">Find the right project or talent for your needs.</p>
          </div>
          {user.active_role === 'customer' && (
            <Link to="/jobs/create" className="btn btn-dark fw-bold rounded-pill px-4">
              <i className="bi bi-plus-lg me-1"></i> Post a Job
            </Link>
          )}
        </div>

        <div className="row g-4 mb-4">
          <div className="col-xl-9 col-lg-8 order-2">
            <div className="d-flex flex-wrap gap-2 mb-4 pb-2">
              {categories.map((c) => {
                const isActive = activeCategory === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveCategory(c.id)}
                    className={`btn rounded-pill px-4 py-2 flex-shrink-0 fw-medium ${isActive ? 'text-white' : 'btn-outline-secondary bg-white'}`}
                    style={isActive ? { backgroundColor: '#FF5A1E', borderColor: '#FF5A1E' } : {}}
                  >
                    {c.label} <span className="small opacity-75">({c.count})</span>
                  </button>
                );
              })}
            </div>

            {loading && <StateCard title="Loading jobs..." />}

            {!loading && loadError && (
              <StateCard
                title="Couldn't load jobs"
                body={loadError}
                action={{ label: 'Try again', onClick: () => window.location.reload() }}
              />
            )}

            {!loading && !loadError && visibleJobs.length === 0 && (
              <StateCard
                title="No jobs match those filters"
                body="Try widening the budget range or clearing your search."
                action={{ label: 'Reset filters', onClick: resetFilters }}
              />
            )}

            {!loading && !loadError && visibleJobs.length > 0 && (
              <div className="row g-4">
                {visibleJobs.map((job) => (
                  <div className="col-md-6 col-xl-4" key={job.job_id}>
                    <JobCard job={job} onOpen={() => navigate(`/jobs/${job.job_id}`)} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={`col-xl-3 col-lg-4 order-1 sticky-filter ${!filtersOpen ? 'd-none' : ''}`}>
            {budget && (
              <FiltersSidebar
                budget={budget}
                setBudget={setBudget}
                budgetBounds={budgetBounds}
                resetFilters={resetFilters}
                resultCount={visibleJobs.length}
                onClose={() => setFiltersOpen(false)}
              />
            )}
                  </div>
      </div>
      <BackToTop />
    </>
  );
}

function FiltersSidebar({ budget, setBudget, budgetBounds, resetFilters, resultCount, onClose }) {
  return (
    <div className="card h-100">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">Filters</h5>
        <button onClick={onClose} className="btn-close d-lg-none" aria-label="Close"></button>
      </div>
      <div className="card-body">
        <RangeField
          label="Budget"
          unit="₱"
          value={budget}
          onChange={setBudget}
          bounds={budgetBounds}
          onReset={() => setBudget(budgetBounds)}
        />
        <hr className="my-4" />
        <button className="btn btn-dark w-100 mb-2 fw-medium rounded-pill">Show {resultCount} results</button>
        <button onClick={resetFilters} className="btn btn-outline-secondary w-100 fw-medium rounded-pill">Reset all</button>
      </div>
    </div>
  );
}

function RangeField({ label, unit, value, onChange, bounds, onReset }) {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="fw-medium small text-dark">{label}</span>
        <button onClick={onReset} className="btn btn-link p-0 text-decoration-none small text-success">Reset</button>
      </div>
      <input
        type="range"
        className="form-range mb-3"
        min={bounds.min}
        max={bounds.max}
        value={value.max}
        onChange={(e) => onChange({ ...value, max: Number(e.target.value) })}
      />
      <div className="row g-2">
        <div className="col-6">
          <label className="form-label small text-muted mb-1">From{unit ? `, ${unit}` : ''}</label>
          <input
            type="number"
            className="form-control form-control-sm bg-light"
            value={value.min}
            onChange={(e) => onChange({ ...value, min: Number(e.target.value) })}
          />
        </div>
        <div className="col-6">
          <label className="form-label small text-muted mb-1">To{unit ? `, ${unit}` : ''}</label>
          <input
            type="number"
            className="form-control form-control-sm bg-light"
            value={value.max}
            onChange={(e) => onChange({ ...value, max: Number(e.target.value) })}
          />
        </div>
      </div>
    </div>
  );
}

function JobCard({ job, onOpen }) {
  const categoryName = job.categories?.category_name || 'Uncategorized';
  const posted = formatDate(job.created_at);

  return (
    <div className="card h-100 border transition-all" style={{ cursor: 'pointer' }} onClick={onOpen}>
      <div className="card-body d-flex flex-column p-0">
        <div className="mb-3">
          <span className="badge bg-light border text-dark fw-semibold px-3 py-2 rounded-pill" style={{ fontSize: '0.85rem' }}>
            {categoryName}
          </span>
          {posted && (
            <div className="small text-muted mt-2 d-flex align-items-center">
              <i className="bi bi-clock me-1"></i>
              <span>Posted {posted}</span>
            </div>
          )}
        </div>
        <h5 className="card-title text-dark fw-bold mb-3 fs-5">
          {job.title || 'Untitled job'}
        </h5>
        <div className="mb-3">
          <span className="small text-muted">Budget: </span>
          <span className="fw-bold text-success fs-6">₱{job.budget ? Number(job.budget).toLocaleString() : '—'}</span>
        </div>
        <p className="card-text small text-muted flex-grow-1" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {job.description || 'No description provided.'}
        </p>
        <button onClick={(e) => { e.stopPropagation(); onOpen(); }} className="btn btn-outline-dark w-100 mt-3 rounded-pill fw-medium">View & Apply</button>
      </div>
    </div>
  );
}

function StateCard({ title, body, action }) {
  return (
    <div className="card text-center py-5 border">
      <div className="card-body">
        <h5 className="card-title fw-medium text-dark">{title}</h5>
        {body && <p className="card-text text-muted">{body}</p>}
        {action && (
          <button onClick={action.onClick} className="btn btn-outline-dark mt-3 rounded-pill px-4">
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
