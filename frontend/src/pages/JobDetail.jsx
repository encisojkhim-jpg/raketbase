// JobDetail.jsx — Detailed job specification view
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ClockIcon, PlusIcon, CloseIcon } from '../components/Icons';
import ClientRatingCard from '../components/ClientRatingCard';
import ProposalBlockedNotice from '../components/ProposalBlockedNotice';
import { getProposalBlockReason } from '../utils/proposalEligibility';
import { useCurrentUser } from '../utils/currentUser';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export default function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Proposal submission state
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  // Milestone-based jobs replace the single bid amount with a stage breakdown
  // (see budget_type on the job). Each row: { title, amount }.
  const [milestoneRows, setMilestoneRows] = useState([{ title: '', amount: '' }]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const token = localStorage.getItem('token');
  const currentUser = useCurrentUser();

  useEffect(() => {
    async function loadJob() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/jobs/${id}`);
        const body = await res.json();
        if (!res.ok || !body.success) {
          throw new Error(body.error || `Failed to fetch job details (${res.status})`);
        }
        setJob(body.data);
      } catch (err) {
        setError(err.message || 'Could not load job details.');
      } finally {
        setLoading(false);
      }
    }

    loadJob();
  }, [id]);

  // Check if current user has already submitted a proposal for this job
  useEffect(() => {
    if (!token || !id) return;
    let cancelled = false;

    async function checkExisting() {
      try {
        const res = await fetch(`${API_BASE_URL}/proposals/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await res.json();
        if (!cancelled && res.ok && body.success && Array.isArray(body.data)) {
          if (body.data.some((p) => String(p.job_id) === String(id))) {
            setAlreadyApplied(true);
          }
        }
      } catch {
        // Silently continue if proposal check fails
      }
    }

    checkExisting();
    return () => {
      cancelled = true;
    };
  }, [id, token]);

  const isMilestoneJob = job?.budget_type === 'milestone';
  const milestoneTotal = milestoneRows.reduce((sum, m) => sum + (Number(m.amount) || 0), 0);

  function addMilestoneRow() {
    setMilestoneRows((rows) => [...rows, { title: '', amount: '' }]);
  }
  function removeMilestoneRow(index) {
    setMilestoneRows((rows) => (rows.length > 1 ? rows.filter((_, i) => i !== index) : rows));
  }
  function updateMilestoneRow(index, field, value) {
    setMilestoneRows((rows) => rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  async function handleProposalSubmit(e) {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    let payload;
    if (isMilestoneJob) {
      const cleaned = milestoneRows.map((m) => ({ title: m.title.trim(), amount: Number(m.amount) }));
      if (cleaned.some((m) => !m.title)) {
        return setSubmitError('Every milestone needs a title.');
      }
      const badAmount = cleaned.find((m) => !Number.isFinite(m.amount) || m.amount <= 0);
      if (badAmount) {
        return setSubmitError('Every milestone needs an amount greater than ₱0.');
      }
      payload = { job_id: id, cover_letter: coverLetter.trim(), milestones: cleaned };
    } else {
      const amount = Number(bidAmount);
      if (!bidAmount || Number.isNaN(amount) || amount <= 0) {
        return setSubmitError('Please enter a valid bid amount greater than ₱0.');
      }
      payload = { job_id: id, bid_amount: amount, cover_letter: coverLetter.trim() };
    }
    if (!coverLetter.trim()) {
      return setSubmitError('A cover letter is required.');
    }

    setSubmitting(true);
    try {
      if (!token) throw new Error('You must be logged in to submit a proposal.');

      const res = await fetch(`${API_BASE_URL}/proposals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const body = await res.json();
      if (res.status === 409 || body.error?.includes('already submitted')) {
        setAlreadyApplied(true);
        setShowApplyForm(false);
        setSubmitError('You have already submitted a proposal for this job.');
        return;
      }

      if (!res.ok || !body.success) {
        throw new Error(body.error || 'Failed to submit proposal.');
      }

      setAlreadyApplied(true);
      setShowApplyForm(false);
      setSubmitSuccess('Proposal submitted successfully! The client will review it soon.');
      setBidAmount('');
      setCoverLetter('');
      setMilestoneRows([{ title: '', amount: '' }]);
    } catch (err) {
      setSubmitError(err.message || 'Something went wrong while submitting.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <Navbar />

      <main className="mx-auto max-w-4xl px-5 py-8 md:px-8">
        <Link
          to="/explore"
          className="mb-6 inline-flex items-center text-xs font-medium text-accent hover:underline"
        >
          &larr; Back to Explore
        </Link>

        {loading && (
          <div className="rounded-lg border border-border bg-panel p-10 text-center text-text-secondary">
            Loading job details...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-lg border border-border bg-panel p-10 text-center">
            <p className="font-display text-lg font-medium text-error">Error</p>
            <p className="mt-1 text-sm text-text-secondary">{error}</p>
          </div>
        )}

        {!loading && !error && job && (
          <div className="rounded-lg border border-border bg-panel p-6 md:p-8">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="mb-2 inline-block rounded-full border border-border px-3 py-1 text-xs text-text-secondary">
                  {job.categories?.category_name || 'Uncategorized'}
                </span>
                <h1 className="font-display text-2xl md:text-3xl font-semibold leading-tight">
                  {job.title}
                </h1>
              </div>

              <div className="text-right">
                <div className="text-accent font-semibold text-2xl">
                  ₱{job.budget ? Number(job.budget).toLocaleString() : '—'}
                </div>
                <span className="text-xs text-text-secondary uppercase tracking-wider font-medium">
                  {job.budget_type || 'Fixed'}
                </span>
              </div>
            </div>

            <div className="border-t border-border pt-6 mt-6">
              <h2 className="text-sm font-medium text-text-secondary mb-3">Project Description</h2>
              <p className="text-text text-sm md:text-base leading-relaxed whitespace-pre-line">
                {job.description || 'No detailed description provided.'}
              </p>
            </div>

            <div className="border-t border-border pt-6 mt-6">
              <ClientRatingCard job={job} />
            </div>

            <div className="border-t border-border pt-6 mt-6 flex flex-wrap gap-6 text-xs text-text-secondary">
              {job.deadline && (
                <div className="flex items-center gap-1.5">
                  <ClockIcon className="h-4 w-4" />
                  <span>
                    Deadline: <strong className="text-text font-medium">{new Date(job.deadline).toLocaleDateString()}</strong>
                  </span>
                </div>
              )}
              <div>
                Posted on: <strong className="text-text font-medium">{new Date(job.created_at).toLocaleDateString()}</strong>
              </div>
            </div>

            {/* In-page proposal submission section */}
            {getProposalBlockReason(job, currentUser) ? (
              <div className="mt-6 border-t border-border pt-6">
                <ProposalBlockedNotice reason={getProposalBlockReason(job, currentUser)} />
              </div>
            ) : alreadyApplied ? (
              <div className="mt-6 border-t border-border pt-6">
                <div className="flex items-center gap-2.5 rounded-md bg-accent/10 border border-accent/30 p-3.5 text-sm font-medium text-accent">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-[#1A1305] text-xs font-bold">
                    ✓
                  </span>
                  <span>You have already submitted a proposal for this job.</span>
                </div>
              </div>
            ) : submitSuccess ? (
              <div className="mt-6 border-t border-border pt-6">
                <div className="rounded-md bg-accent/10 border border-accent/30 p-3.5 text-sm font-medium text-accent">
                  {submitSuccess}
                </div>
              </div>
            ) : !showApplyForm ? (
              <div className="mt-6 border-t border-border pt-6 flex flex-wrap items-center justify-between gap-4">
                <p className="text-xs text-text-secondary">Interested in this project? Submit your proposal directly to the client.</p>
                <button
                  onClick={() => setShowApplyForm(true)}
                  className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-[#1A1305] transition-colors hover:bg-accent-hover cursor-pointer"
                >
                  Apply for this Job
                </button>
              </div>
            ) : (
              <div className="mt-6 border-t border-border pt-6">
                <h3 className="font-display text-lg font-semibold mb-3">Submit Your Proposal</h3>

                {submitError && (
                  <div className="mb-4 rounded-md border border-error/30 bg-error/10 p-3 text-xs text-error">
                    {submitError}
                  </div>
                )}

                <form onSubmit={handleProposalSubmit} className="space-y-4">
                  {isMilestoneJob ? (
                    <div>
                      <div className="mb-1.5 flex items-center justify-between">
                        <label className="text-[13px] font-medium text-text-secondary">Milestone Breakdown</label>
                        <span className="text-[13px] font-semibold text-accent">
                          Total: ₱{milestoneTotal.toLocaleString()}
                        </span>
                      </div>
                      <div className="space-y-2.5">
                        {milestoneRows.map((row, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder={`Milestone ${index + 1} (e.g. Wireframes)`}
                              value={row.title}
                              onChange={(e) => updateMilestoneRow(index, 'title', e.target.value)}
                              className="min-w-0 flex-1 rounded-md border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent"
                            />
                            <input
                              type="number"
                              min="1"
                              step="0.01"
                              placeholder="₱ Amount"
                              value={row.amount}
                              onChange={(e) => updateMilestoneRow(index, 'amount', e.target.value)}
                              className="w-32 shrink-0 rounded-md border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent"
                            />
                            <button
                              type="button"
                              onClick={() => removeMilestoneRow(index)}
                              disabled={milestoneRows.length === 1}
                              className="shrink-0 text-text-secondary hover:text-error disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              aria-label="Remove milestone"
                            >
                              <CloseIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={addMilestoneRow}
                        className="mt-2.5 flex items-center gap-1.5 text-[13px] font-medium text-accent hover:underline cursor-pointer"
                      >
                        <PlusIcon className="h-3.5 w-3.5" />
                        Add another milestone
                      </button>
                    </div>
                  ) : (
                    <div>
                      <label className="mb-1.5 block text-[13px] font-medium text-text-secondary" htmlFor="bidAmount">
                        Your Bid (₱)
                      </label>
                      <input
                        id="bidAmount"
                        type="number"
                        min="1"
                        step="0.01"
                        required
                        placeholder="e.g. 15000"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent"
                      />
                    </div>
                  )}

                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-text-secondary" htmlFor="coverLetter">
                      Cover Letter
                    </label>
                    <textarea
                      id="coverLetter"
                      rows={5}
                      required
                      placeholder="Explain your relevant experience and why you are the best fit for this project..."
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      className="w-full resize-none rounded-md border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-[#1A1305] transition-colors hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {submitting ? 'Submitting...' : 'Submit Proposal'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowApplyForm(false)}
                      className="rounded-md border border-border px-4 py-2.5 text-sm font-medium text-text-secondary hover:text-text cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}