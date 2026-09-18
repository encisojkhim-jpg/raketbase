// FreelancerProfile — Job Details & Proposal Submission View
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ClockIcon } from '../components/Icons';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export default function FreelancerProfile() {
  const { id } = useParams();
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
      setLoading(true); setLoadError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/jobs/${id}`);
        const body = await res.json();
        if (!res.ok || !body.success) throw new Error(body.error || 'Job not found.');
        if (!cancelled) setJob(body.data);
      } catch (err) { if (!cancelled) setLoadError(err.message || 'Could not load this job.'); }
      finally { if (!cancelled) setLoading(false); }
    }
    loadJob();
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !id) return;
    let cancelled = false;
    async function checkExisting() {
      try {
        const res = await fetch(`${API_BASE_URL}/proposals/me`, { headers: { Authorization: `Bearer ${token}` } });
        const body = await res.json();
        if (!cancelled && res.ok && body.success && Array.isArray(body.data)) {
          if (body.data.some((p) => String(p.job_id) === String(id))) setAlreadyApplied(true);
        }
      } catch { /* silent */ }
    }
    checkExisting();
    return () => { cancelled = true; };
  }, [id]);

  function getValidationErrors() {
    const errors = {};
    const amount = Number(bidAmount);
    if (!String(bidAmount).trim() || Number.isNaN(amount) || amount <= 0) errors.bidAmount = 'Enter a bid amount greater than 0.';
    if (!coverLetter.trim()) errors.coverLetter = 'A cover letter is required.';
    else if (coverLetter.trim().length < 20) errors.coverLetter = `Write a bit more — ${20 - coverLetter.trim().length} characters to go.`;
    return errors;
  }

  const errors = getValidationErrors();
  const showBidError = (touched.bidAmount || submitted) && errors.bidAmount;
  const showCoverLetterError = (touched.coverLetter || submitted) && errors.coverLetter;

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitResult(null); setSubmitted(true);
    setTouched({ bidAmount: true, coverLetter: true });
    if (Object.keys(errors).length > 0 || alreadyApplied) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('You need to be logged in to submit a proposal.');

      const res = await fetch(`${API_BASE_URL}/proposals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ job_id: job.job_id, bid_amount: Number(bidAmount), cover_letter: coverLetter.trim() }),
      });
      const body = await res.json();

      if (res.status === 409 || body.error?.includes('already submitted')) {
        setAlreadyApplied(true);
        setSubmitResult({ type: 'error', message: body.error || 'You have already submitted a proposal for this job.' });
        return;
      }
      if (!res.ok || !body.success) throw new Error(body.error || body.message || 'Could not submit your proposal.');

      setAlreadyApplied(true);
      setSubmitResult({ type: 'success', message: 'Proposal sent! The client will review it soon.' });
      setBidAmount(''); setCoverLetter('');
    } catch (err) {
      setSubmitResult({ type: 'error', message: err.message || 'Something went wrong while submitting.' });
    } finally { setSubmitting(false); }
  }

  return (
    <div className="p-5 sm:p-8 max-w-5xl mx-auto" style={{ animation: 'fade-in-up 0.4s ease-out' }}>
      {/* Breadcrumb */}
      <Link to="/explore" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent hover:text-accent-hover transition-colors mb-6">
        ← Back to Explore
      </Link>

      {loading && <p className="text-text-secondary" style={{ animation: 'pulse-soft 1.2s ease-in-out infinite' }}>Loading job...</p>}
      {!loading && loadError && (
        <div className="rounded-2xl border border-border/50 bg-panel/60 p-12 text-center backdrop-blur-sm">
          <p className="font-heading text-lg font-bold">Couldn't load this job</p>
          <p className="mt-1 text-sm text-text-secondary">{loadError}</p>
        </div>
      )}

      {!loading && !loadError && job && (
        <div className="grid gap-6 md:grid-cols-[1fr_340px]">
          {/* Left: Job Details */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-surface/60 border border-border/40 px-3 py-1 text-[11px] font-semibold text-text-secondary">
                {job.categories?.category_name || 'Uncategorized'}
              </span>
              {alreadyApplied && (
                <span className="rounded-full bg-accent/12 border border-accent/25 px-3 py-1 text-[11px] font-bold text-accent">✓ Applied</span>
              )}
            </div>
            <h1 className="mt-3 font-heading text-2xl sm:text-3xl font-bold tracking-tight">{job.title || 'Untitled job'}</h1>
            <p className="mt-2 flex items-center gap-1.5 text-[13px] text-text-secondary">
              <ClockIcon className="h-3.5 w-3.5" />
              Posted {formatDate(job.created_at)}
              {job.users && ` by ${job.users.first_name} ${job.users.last_name}`}
            </p>
            <p className="mt-6 whitespace-pre-line text-[15px] leading-relaxed text-text-secondary">
              {job.description || 'No description provided.'}
            </p>
          </div>

          {/* Right: Budget + Proposal Form */}
          <aside className="h-fit rounded-2xl border border-border/50 bg-panel/60 p-5 backdrop-blur-sm">
            <p className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider">Budget</p>
            <p className="font-sans text-2xl font-bold text-accent mt-1">₱{job.budget ? Number(job.budget).toLocaleString() : '—'}</p>

            {alreadyApplied && (
              <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-accent/10 border border-accent/20 p-3 text-sm font-semibold text-accent">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-white text-xs font-bold">✓</span>
                <span>Already Applied</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-text-secondary">Your bid (₱)</label>
                <input type="number" min="0" step="0.01" disabled={submitting || alreadyApplied} value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, bidAmount: true }))}
                  className="w-full rounded-xl border border-border bg-surface/60 px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  placeholder="e.g. 15000" />
                {showBidError && <p className="mt-1 text-[12px] text-error">{errors.bidAmount}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-text-secondary">Cover letter</label>
                <textarea value={coverLetter} disabled={submitting || alreadyApplied}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, coverLetter: true }))}
                  rows={6}
                  className="w-full resize-none rounded-xl border border-border bg-surface/60 px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  placeholder="Explain why you're a good fit for this job." />
                {showCoverLetterError && <p className="mt-1 text-[12px] text-error">{errors.coverLetter}</p>}
              </div>
              <button type="submit" disabled={submitting || alreadyApplied}
                className="w-full rounded-xl bg-accent py-3 text-sm font-bold text-white shadow-md shadow-accent/15 transition-all hover:bg-accent-hover hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                {alreadyApplied ? 'Already Applied' : submitting ? 'Submitting...' : 'Submit Proposal'}
              </button>
              {submitResult && (
                <p className={`text-[13px] font-medium ${submitResult.type === 'success' ? 'text-success' : 'text-error'}`}>
                  {submitResult.message}
                </p>
              )}
            </form>
          </aside>
        </div>
      )}
    </div>
  );
}

function formatDate(value) {
  if (!value) return 'recently';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'recently';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
