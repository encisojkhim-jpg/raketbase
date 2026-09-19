// Explore.jsx — Job & Marketplace Discovery with Dynamic Filters
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { CloseIcon, ClockIcon } from '../components/Icons';
import { useCurrentUser } from '../utils/currentUser';
import { getMyProposals } from '../services/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Badge shown on a job card for a job the freelancer has already proposed on
// (withdrawn proposals are excluded — see proposalStatusByJobId below).
const PROPOSAL_STATUS_BADGE = {
  pending: {
    label: '✓ Applied',
    className: 'rounded-full border border-accent/40 bg-accent/15 px-2.5 py-1 text-[12px] font-semibold text-accent',
  },
  accepted: {
    label: 'Accepted',
    className: 'rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[12px] font-semibold text-emerald-400',
  },
  rejected: {
    label: 'Rejected',
    className: 'rounded-full border border-error/40 bg-error/10 px-2.5 py-1 text-[12px] font-semibold text-error',
  },
};

export default function Explore() {
  const navigate = useNavigate();

  const currentUser = useCurrentUser();
  const isClientMode = currentUser.active_role === 'customer';

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [activeCategory, setActiveCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [budget, setBudget] = useState(null);
  const [hideTaken, setHideTaken] = useState(false);

  // The freelancer's own proposals, used to badge job cards as Applied /
  // Accepted / Rejected. Fetched once — mode-awareness re-derives from this
  // plus the live currentUser, so switching modes needs no refetch.
  const [myProposals, setMyProposals] = useState([]);

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

  useEffect(() => {
    let cancelled = false;
    async function loadProposals() {
      try {
        const res = await getMyProposals();
        if (!cancelled) setMyProposals(res.data || []);
      } catch {
        // Silently ignore — job cards just won't show an applied badge.
      }
    }
    loadProposals();
    return () => {
      cancelled = true;
    };
  }, []);

  // job_id -> proposal status, excluding withdrawn proposals (a withdrawn
  // proposal shouldn't show as "Applied" — see FreelancerProfile.jsx, which
  // gives withdrawn its own separate notice instead).
  const proposalStatusByJobId = useMemo(() => {
    const map = {};
    for (const p of myProposals) {
      if (p.status === 'withdrawn') continue;
      map[String(p.job_id)] = p.status;
    }
    return map;
  }, [myProposals]);

  const budgetBounds = useMemo(() => {
    if (!jobs.length) return { min: 0, max: 0 };
    const amounts = jobs.map((j) => Number(j.budget) || 0);
    return { min: Math.min(...amounts), max: Math.max(...amounts) };
  }, [jobs]);

  // Jobs in play after the "Hide taken jobs" option is applied
  const pool = useMemo(
    () => (hideTaken ? jobs.filter((j) => j.status === 'open') : jobs),
    [jobs, hideTaken]
  );

  const categories = useMemo(() => {
    const counts = {};
    for (const j of pool) {
      const name = j.categories?.category_name || 'Other';
      counts[name] = (counts[name] || 0) + 1;
    }
    const list = Object.entries(counts).map(([name, count]) => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      label: name,
      count,
    }));
    return [{ id: 'all', name: 'All', label: 'All', count: pool.length }, ...list];
  }, [pool]);

  const visibleJobs = useMemo(() => {
    return pool.filter((j) => {
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
  }, [pool, activeCategory, query, budget]);

  function resetFilters() {
    setActiveCategory('all');
    setQuery('');
    setBudget(budgetBounds);
    setHideTaken(false);
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <Navbar
        showSearch
        searchQuery={query}
        setSearchQuery={setQuery}
        showFilters
        filtersOpen={filtersOpen}
        setFiltersOpen={setFiltersOpen}
      />

      <div className="mx-auto flex max-w-[1400px] gap-6 px-5 py-6 md:px-8">
        {filtersOpen && budget && (
          <FiltersSidebar
            budget={budget}
            setBudget={setBudget}
            budgetBounds={budgetBounds}
            resetFilters={resetFilters}
            resultCount={visibleJobs.length}
            hideTaken={hideTaken}
            setHideTaken={setHideTaken}
            onClose={() => setFiltersOpen(false)}
          />
        )}

        <main className="min-w-0 flex-1">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="font-display text-3xl font-semibold tracking-tight">Explore jobs</h1>
            {isClientMode && (
              <button
                onClick={() => navigate('/jobs/create')}
                className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-[#1A1305] transition-colors hover:bg-accent-hover cursor-pointer"
              >
                + Post a Job
              </button>
            )}
          </div>

          <nav className="mb-6 flex gap-6 overflow-x-auto border-b border-border pb-3 text-[15px]">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`shrink-0 whitespace-nowrap transition-colors cursor-pointer ${
                  activeCategory === c.id ? 'font-semibold text-text' : 'text-text-secondary hover:text-text'
                }`}
              >
                {c.label} <span className="text-text-secondary">({c.count})</span>
              </button>
            ))}
          </nav>

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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visibleJobs.map((job) => (
                <JobCard
                  key={job.job_id}
                  job={job}
                  onOpen={() => navigate(`/explore/${job.job_id}`)}
                  isClientMode={isClientMode}
                  currentUserId={currentUser.user_id}
                  proposalStatus={proposalStatusByJobId[String(job.job_id)]}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function FiltersSidebar({ budget, setBudget, budgetBounds, resetFilters, resultCount, hideTaken, setHideTaken, onClose }) {
  return (
    <aside className="hidden w-[280px] shrink-0 md:block">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">Filters</h2>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-text-secondary hover:text-text cursor-pointer"
          aria-label="Hide filters"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 space-y-5">
        <RangeField
          label="Budget"
          unit="₱"
          value={budget}
          onChange={setBudget}
          bounds={budgetBounds}
          onReset={() => setBudget(budgetBounds)}
        />

        <label className="flex cursor-pointer items-center gap-2.5 text-[13px] font-medium text-text-secondary">
          <input
            type="checkbox"
            checked={hideTaken}
            onChange={(e) => setHideTaken(e.target.checked)}
            className="h-4 w-4 cursor-pointer accent-[color:var(--color-accent)]"
          />
          Hide taken jobs
        </label>

        <div className="space-y-2 pt-2">
          <button className="w-full rounded-md bg-accent py-3 text-sm font-semibold text-[#1A1305] transition-colors hover:bg-accent-hover cursor-pointer">
            Show {resultCount} results
          </button>
          <button
            onClick={resetFilters}
            className="w-full rounded-md border border-border py-3 text-sm font-medium text-text-secondary transition-colors hover:border-accent/40 hover:text-text cursor-pointer"
          >
            Reset all
          </button>
        </div>
      </div>
    </aside>
  );
}

function RangeField({ label, unit, value, onChange, bounds, onReset }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[13px] font-medium text-text-secondary">{label}</span>
        <button onClick={onReset} className="text-[13px] font-medium text-accent hover:underline cursor-pointer">
          Reset
        </button>
      </div>
      <input
        type="range"
        min={bounds.min}
        max={bounds.max}
        value={value.max}
        onChange={(e) => onChange({ ...value, max: Number(e.target.value) })}
        className="mb-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border accent-[color:var(--color-accent)]"
      />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <span className="mb-1 block text-[11px] text-text-secondary">From{unit ? `, ${unit}` : ''}</span>
          <input
            type="number"
            value={value.min}
            onChange={(e) => onChange({ ...value, min: Number(e.target.value) })}
            className="w-full rounded-md border border-border bg-surface px-2.5 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
        <div>
          <span className="mb-1 block text-[11px] text-text-secondary">To{unit ? `, ${unit}` : ''}</span>
          <input
            type="number"
            value={value.max}
            onChange={(e) => onChange({ ...value, max: Number(e.target.value) })}
            className="w-full rounded-md border border-border bg-surface px-2.5 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
      </div>
    </div>
  );
}

function JobCard({ job, onOpen, isClientMode, currentUserId, proposalStatus }) {
  const categoryName = job.categories?.category_name || 'Uncategorized';
  const posted = formatDate(job.created_at);
  const isTaken = job.status && job.status !== 'open';
  const isOwnJob = isClientMode && Boolean(currentUserId) && job.client_id === currentUserId;
  const appliedBadge = !isClientMode && proposalStatus ? PROPOSAL_STATUS_BADGE[proposalStatus] : null;

  let buttonLabel = 'View & apply';
  if (isOwnJob || isTaken) {
    buttonLabel = 'View details';
  } else if (appliedBadge) {
    buttonLabel = 'Already Applied';
  }

  return (
    <div
      className={`flex flex-col rounded-lg border p-5 transition-colors ${
        isTaken
          ? 'border-dashed border-border bg-surface/60 hover:border-text-secondary/50'
          : 'border-border bg-panel hover:border-accent/40'
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <span className="rounded-full border border-border px-2.5 py-1 text-[12px] text-text-secondary">
          {categoryName}
        </span>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          {isOwnJob && (
            <span className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-[12px] font-semibold text-accent">
              Your posting
            </span>
          )}
          {isTaken && (
            <span className="rounded-full border border-error/40 bg-error/10 px-2.5 py-1 text-[12px] font-semibold text-error">
              Job taken
            </span>
          )}
          {appliedBadge && <span className={appliedBadge.className}>{appliedBadge.label}</span>}
          {posted && (
            <span className="flex items-center gap-1.5 text-[12px] text-text-secondary">
              <ClockIcon className="h-3.5 w-3.5" />
              {posted}
            </span>
          )}
        </div>
      </div>

      <button onClick={onOpen} className="mb-2 text-left cursor-pointer">
        <span
          className={`font-display text-lg font-medium leading-snug transition-colors ${
            isTaken ? 'text-text-secondary hover:text-text' : 'hover:text-accent'
          }`}
        >
          {job.title || 'Untitled job'}
        </span>
      </button>

      <p className="mb-4 text-[13px] font-medium text-text-secondary">
        Budget:{' '}
        <span className={`font-sans text-base font-semibold ${isTaken ? 'text-text-secondary' : 'text-text'}`}>
          ₱{job.budget ? Number(job.budget).toLocaleString() : '—'}
        </span>
      </p>

      <p className="mb-4 line-clamp-3 text-[13px] leading-relaxed text-text-secondary">
        {job.description || 'No description provided.'}
      </p>

      <button
        onClick={onOpen}
        className="mt-auto rounded-md border border-border py-2.5 text-[13px] font-medium transition-colors hover:border-accent/40 hover:text-accent cursor-pointer"
      >
        {buttonLabel}
      </button>
    </div>
  );
}

function StateCard({ title, body, action }) {
  return (
    <div className="rounded-lg border border-border bg-panel p-10 text-center">
      <p className="font-display text-lg font-medium">{title}</p>
      {body && <p className="mt-1 text-sm text-text-secondary">{body}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 rounded-md border border-border px-4 py-2 text-sm font-medium hover:border-accent/40 cursor-pointer"
        >
          {action.label}
        </button>
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