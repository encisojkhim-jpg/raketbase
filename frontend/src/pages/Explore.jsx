// Explore — Job Marketplace Discovery with Dynamic Filters
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClockIcon, CloseIcon, SearchIcon } from '../components/Icons';

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

  useEffect(() => {
    let cancelled = false;
    async function loadJobs() {
      setLoading(true); setLoadError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/jobs`);
        const body = await res.json();
        if (!res.ok || !body.success) throw new Error(body.error || `Request failed (${res.status})`);
        if (cancelled) return;
        const data = body.data || [];
        setJobs(data);
        if (data.length) {
          const amounts = data.map((j) => Number(j.budget) || 0);
          setBudget({ min: Math.min(...amounts), max: Math.max(...amounts) });
        } else setBudget({ min: 0, max: 0 });
      } catch (err) { if (!cancelled) setLoadError(err.message || 'Could not load jobs.'); }
      finally { if (!cancelled) setLoading(false); }
    }
    loadJobs();
    return () => { cancelled = true; };
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
      id: name.toLowerCase().replace(/\s+/g, '-'), name, label: name, count,
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
        if (!j.title?.toLowerCase().includes(q) && !j.description?.toLowerCase().includes(q)) return false;
      }
      if (budget) {
        const amount = Number(j.budget) || 0;
        if (amount < budget.min || amount > budget.max) return false;
      }
      return true;
    });
  }, [jobs, activeCategory, query, budget]);

  function resetFilters() { setActiveCategory('all'); setQuery(''); setBudget(budgetBounds); }

  return (
    <div className="p-5 sm:p-8 max-w-[1400px] mx-auto" style={{ animation: 'fade-in-up 0.4s ease-out' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text">Explore Jobs</h1>
          <p className="text-text-secondary text-sm mt-1">Find your next project from the marketplace</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative w-64 hidden md:block">
            <SearchIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary/50" />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search jobs..."
              className="w-full rounded-xl border border-border bg-surface/60 py-2.5 pl-10 pr-4 text-sm text-text placeholder-text-secondary/50 outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all" />
          </div>
          <button onClick={() => navigate('/jobs/create')}
            className="rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-accent/15 hover:bg-accent-hover transition-all hover:-translate-y-0.5 cursor-pointer">
            + Post a Job
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        {filtersOpen && budget && (
          <aside className="hidden md:block w-[260px] shrink-0">
            <div className="sticky top-[80px] space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-lg font-bold">Filters</h2>
                <button onClick={() => setFiltersOpen(false)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-text-secondary hover:text-text cursor-pointer">
                  <CloseIcon className="h-3.5 w-3.5" />
                </button>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-text-secondary">Budget Range</span>
                  <button onClick={() => setBudget(budgetBounds)} className="text-[12px] font-semibold text-accent hover:text-accent-hover cursor-pointer">Reset</button>
                </div>
                <input type="range" min={budgetBounds.min} max={budgetBounds.max} value={budget.max}
                  onChange={(e) => setBudget({ ...budget, max: Number(e.target.value) })}
                  className="mb-3 w-full cursor-pointer" />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="mb-1 block text-[10px] font-semibold text-text-secondary uppercase tracking-wider">Min ₱</span>
                    <input type="number" value={budget.min} onChange={(e) => setBudget({ ...budget, min: Number(e.target.value) })}
                      className="w-full rounded-lg border border-border bg-surface/60 px-3 py-2 text-sm outline-none focus:border-accent transition-colors" />
                  </div>
                  <div>
                    <span className="mb-1 block text-[10px] font-semibold text-text-secondary uppercase tracking-wider">Max ₱</span>
                    <input type="number" value={budget.max} onChange={(e) => setBudget({ ...budget, max: Number(e.target.value) })}
                      className="w-full rounded-lg border border-border bg-surface/60 px-3 py-2 text-sm outline-none focus:border-accent transition-colors" />
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button className="w-full rounded-xl bg-accent py-3 text-sm font-bold text-white hover:bg-accent-hover transition-colors cursor-pointer">
                  Show {visibleJobs.length} results
                </button>
                <button onClick={resetFilters}
                  className="w-full rounded-xl border border-border py-3 text-sm font-medium text-text-secondary hover:border-accent/40 hover:text-text transition-colors cursor-pointer">
                  Reset all
                </button>
              </div>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="min-w-0 flex-1">
          {/* Category Pills */}
          <nav className="mb-6 flex gap-2 overflow-x-auto pb-2">
            {categories.map((c) => (
              <button key={c.id} onClick={() => setActiveCategory(c.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold transition-all cursor-pointer ${
                  activeCategory === c.id
                    ? 'bg-accent text-white shadow-sm shadow-accent/20'
                    : 'bg-surface/50 text-text-secondary border border-border/50 hover:border-accent/30 hover:text-text'
                }`}>
                {c.label} <span className="opacity-60 ml-0.5">({c.count})</span>
              </button>
            ))}
          </nav>

          {/* Mobile search */}
          <div className="relative mb-5 md:hidden">
            <SearchIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary/50" />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search jobs..."
              className="w-full rounded-xl border border-border bg-surface/60 py-2.5 pl-10 pr-4 text-sm text-text placeholder-text-secondary/50 outline-none focus:border-accent transition-all" />
          </div>

          {loading && <StateCard title="Loading jobs..." />}
          {!loading && loadError && <StateCard title="Couldn't load jobs" body={loadError} action={{ label: 'Try again', onClick: () => window.location.reload() }} />}
          {!loading && !loadError && visibleJobs.length === 0 && <StateCard title="No jobs match those filters" body="Try widening the budget range or clearing your search." action={{ label: 'Reset filters', onClick: resetFilters }} />}
          {!loading && !loadError && visibleJobs.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visibleJobs.map((job) => <JobCard key={job.job_id} job={job} onOpen={() => navigate(`/explore/${job.job_id}`)} />)}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function JobCard({ job, onOpen }) {
  const categoryName = job.categories?.category_name || 'Uncategorized';
  const posted = formatDate(job.created_at);

  return (
    <div className="group flex flex-col rounded-2xl border border-border/50 bg-panel/60 p-5 transition-all hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-0.5 backdrop-blur-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <span className="rounded-full bg-surface/60 border border-border/40 px-3 py-1 text-[11px] font-semibold text-text-secondary">{categoryName}</span>
        {posted && (
          <span className="flex shrink-0 items-center gap-1.5 text-[11px] text-text-secondary">
            <ClockIcon className="h-3 w-3" />{posted}
          </span>
        )}
      </div>
      <button onClick={onOpen} className="mb-2 text-left cursor-pointer">
        <span className="font-heading text-[16px] font-bold leading-snug text-text group-hover:text-accent transition-colors">
          {job.title || 'Untitled job'}
        </span>
      </button>
      <p className="mb-3 text-[13px] font-semibold text-text-secondary">
        Budget: <span className="font-sans text-base font-bold text-accent">₱{job.budget ? Number(job.budget).toLocaleString() : '—'}</span>
      </p>
      <p className="mb-4 line-clamp-3 text-[13px] leading-relaxed text-text-secondary">{job.description || 'No description provided.'}</p>
      <button onClick={onOpen}
        className="mt-auto rounded-xl border border-border/60 py-2.5 text-[13px] font-semibold text-text-secondary transition-all hover:border-accent/40 hover:text-accent hover:bg-accent/5 cursor-pointer">
        View & Apply
      </button>
    </div>
  );
}

function StateCard({ title, body, action }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-panel/60 p-12 text-center backdrop-blur-sm">
      <p className="font-heading text-lg font-bold">{title}</p>
      {body && <p className="mt-1 text-sm text-text-secondary">{body}</p>}
      {action && (
        <button onClick={action.onClick} className="mt-4 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold hover:border-accent/40 hover:text-accent cursor-pointer transition-colors">{action.label}</button>
      )}
    </div>
  );
}

function formatDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}