// JobDetail — Detailed job specification view with inline proposal
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ClockIcon } from '../components/Icons';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export default function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    async function loadJob() {
      setLoading(true); setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/jobs/${id}`);
        const body = await res.json();
        if (!res.ok || !body.success) throw new Error(body.error || `Failed to fetch job (${res.status})`);
        setJob(body.data);
      } catch (err) { setError(err.message || 'Could not load job details.'); }
      finally { setLoading(false); }
    }
    loadJob();
  }, [id]);

  useEffect(() => {
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
  }, [id, token]);

  async function handleProposalSubmit(e) {
    e.preventDefault();
    setSubmitError(''); setSubmitSuccess('');
    const amount = Number(bidAmount);
    if (!bidAmount || Number.isNaN(amount) || amount <= 0) return setSubmitError('Please enter a valid bid amount greater than ₱0.');
    if (!coverLetter.trim()) return setSubmitError('A cover letter is required.');

    setSubmitting(true);
    try {
      if (!token) throw new Error('You must be logged in to submit a proposal.');
      const res = await fetch(`${API_BASE_URL}/proposals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ job_id: id, bid_amount: amount, cover_letter: coverLetter.trim() }),
      });
      const body = await res.json();
      if (res.status === 409 || body.error?.includes('already submitted')) {
        setAlreadyApplied(true); setShowApplyForm(false);
        setSubmitError('You have already submitted a proposal for this job.');
        return;
      }
      if (!res.ok || !body.success) throw new Error(body.error || 'Failed to submit proposal.');
      setAlreadyApplied(true); setShowApplyForm(false);
      setSubmitSuccess('Proposal submitted successfully! The client will review it soon.');
      setBidAmount(''); setCoverLetter('');
    } catch (err) { setSubmitError(err.message || 'Something went wrong.'); }
    finally { setSubmitting(false); }
  }

  return (
    <div className="p-5 sm:p-8 max-w-4xl mx-auto" style={{ animation: 'fade-in-up 0.4s ease-out' }}>
      <Link to="/explore" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent hover:text-accent-hover mb-6 transition-colors">
        ← Back to Explore
      </Link>

      {loading && (
        <div className="rounded-2xl border border-border/50 bg-panel/60 p-12 text-center text-text-secondary backdrop-blur-sm" style={{ animation: 'pulse-soft 1.2s ease-in-out infinite' }}>
          Loading job details...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-border/50 bg-panel/60 p-12 text-center backdrop-blur-sm">
          <p className="font-heading text-lg font-bold text-error">Error</p>
          <p className="mt-1 text-sm text-text-secondary">{error}</p>
        </div>
      )}

      {!loading && !error && job && (
        <div className="rounded-2xl border border-border/50 bg-panel/60 p-6 md:p-8 backdrop-blur-sm">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="mb-2 inline-block rounded-full bg-surface/60 border border-border/40 px-3 py-1 text-[11px] font-semibold text-text-secondary">
                {job.categories?.category_name || 'Uncategorized'}
              </span>
              <h1 className="font-heading text-2xl md:text-3xl font-bold leading-tight">{job.title}</h1>
            </div>
            <div className="text-right">
              <div className="text-accent font-bold text-2xl">₱{job.budget ? Number(job.budget).toLocaleString() : '—'}</div>
              <span className="text-[11px] text-text-secondary uppercase tracking-wider font-semibold">{job.budget_type || 'Fixed'}</span>
            </div>
          </div>

          <div className="border-t border-border/30 pt-6 mt-6">
            <h2 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wider">Project Description</h2>
            <p className="text-text text-sm md:text-base leading-relaxed whitespace-pre-line">{job.description || 'No detailed description provided.'}</p>
          </div>

          <div className="border-t border-border/30 pt-6 mt-6 flex flex-wrap gap-6 text-[12px] text-text-secondary">
            {job.deadline && (
              <div className="flex items-center gap-1.5">
                <ClockIcon className="h-4 w-4" />
                <span>Deadline: <strong className="text-text font-semibold">{new Date(job.deadline).toLocaleDateString()}</strong></span>
              </div>
            )}
            <div>Posted on: <strong className="text-text font-semibold">{new Date(job.created_at).toLocaleDateString()}</strong></div>
          </div>

          {/* Proposal Section */}
          {alreadyApplied ? (
            <div className="mt-6 border-t border-border/30 pt-6">
              <div className="flex items-center gap-2.5 rounded-xl bg-accent/10 border border-accent/20 p-3.5 text-sm font-bold text-accent">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-white text-xs font-bold">✓</span>
                <span>You have already submitted a proposal for this job.</span>
              </div>
            </div>
          ) : submitSuccess ? (
            <div className="mt-6 border-t border-border/30 pt-6">
              <div className="rounded-xl bg-success/10 border border-success/20 p-3.5 text-sm font-semibold text-success">{submitSuccess}</div>
            </div>
          ) : !showApplyForm ? (
            <div className="mt-6 border-t border-border/30 pt-6 flex flex-wrap items-center justify-between gap-4">
              <p className="text-[13px] text-text-secondary">Interested? Submit your proposal directly.</p>
              <button onClick={() => setShowApplyForm(true)}
                className="rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-accent/15 hover:bg-accent-hover transition-all hover:-translate-y-0.5 cursor-pointer">
                Apply for this Job
              </button>
            </div>
          ) : (
            <div className="mt-6 border-t border-border/30 pt-6">
              <h3 className="font-heading text-lg font-bold mb-3">Submit Your Proposal</h3>
              {submitError && <div className="mb-4 rounded-xl border border-error/25 bg-error/10 p-3 text-[13px] text-error">{submitError}</div>}
              <form onSubmit={handleProposalSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold text-text-secondary" htmlFor="bid">Your Bid (₱)</label>
                  <input id="bid" type="number" min="1" step="0.01" required placeholder="e.g. 15000" value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface/60 px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold text-text-secondary" htmlFor="cover">Cover Letter</label>
                  <textarea id="cover" rows={5} required placeholder="Explain your relevant experience..." value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    className="w-full resize-none rounded-xl border border-border bg-surface/60 px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all" />
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <button type="submit" disabled={submitting}
                    className="rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-accent/15 hover:bg-accent-hover disabled:opacity-50 cursor-pointer transition-all">
                    {submitting ? 'Submitting...' : 'Submit Proposal'}
                  </button>
                  <button type="button" onClick={() => setShowApplyForm(false)}
                    className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-text-secondary hover:text-text cursor-pointer transition-colors">Cancel</button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}