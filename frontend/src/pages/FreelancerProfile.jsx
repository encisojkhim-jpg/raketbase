// FreelancerProfile.jsx — Job Details & Proposal Submission View (Paula + Kyle)
// Features:
// 1. Shared Navbar with navigable logo, back button, and user profile dropdown
// 2. Native Unicode U+20B1 (₱) rendering with Inter (font-sans) and locale thousands formatting
// 3. Duplicate proposal guard: checks existing submissions, disables re-application, and shows 'Already Applied'
// 4. Deferred form validation: errors only show after onBlur (touched) or on submit click, never on initial load
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ClockIcon, PlusIcon, CloseIcon } from '../components/Icons';
import ClientRatingCard from '../components/ClientRatingCard';
import ProposalBlockedNotice from '../components/ProposalBlockedNotice';
import { getProposalBlockReason } from '../utils/proposalEligibility';
import { isProfileComplete } from '../utils/profileCompleteness';
import { useCurrentUser } from '../utils/currentUser';

// Configurable API base URL, defaulting to local backend port 5000
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export default function FreelancerProfile() {
  // Extract job ID parameter from the route URL (/explore/:id)
  const { id } = useParams();
  const currentUser = useCurrentUser();

  // Job data loading state
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Proposal form state
  const [bidAmount, setBidAmount] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  // Milestone-based jobs (budget_type === 'milestone') replace the single bid
  // amount with a stage breakdown. Each row: { title, amount }.
  const [milestoneRows, setMilestoneRows] = useState([{ title: '', amount: '' }]);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  // Duplicate proposal tracking
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  // If the freelancer previously withdrew their proposal for this job, they need
  // to go restore it (My Proposals) rather than submit a fresh one — a duplicate
  // job_id + freelancer_id row isn't allowed at the database level.
  const [withdrawnNotice, setWithdrawnNotice] = useState(false);

  // Field interaction tracking to prevent premature validation on initial load
  const [touched, setTouched] = useState({ bidAmount: false, coverLetter: false });
  const [submitted, setSubmitted] = useState(false);

  // Fetch job details by ID when route parameter changes
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
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Check if logged-in freelancer has already submitted a proposal for this job
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !id) return;

    let cancelled = false;

    async function checkExistingProposal() {
      try {
        const res = await fetch(`${API_BASE_URL}/proposals/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const body = await res.json();
        if (!cancelled && res.ok && body.success && Array.isArray(body.data)) {
          const existing = body.data.find((p) => String(p.job_id) === String(id));
          if (existing?.status === 'withdrawn') {
            setWithdrawnNotice(true);
          } else if (existing) {
            setAlreadyApplied(true);
          }
        }
      } catch {
        // Silently continue if check fails
      }
    }

    checkExistingProposal();
    return () => {
      cancelled = true;
    };
  }, [id]);

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

  // Compute field validation rules
  function getValidationErrors() {
    const errors = {};

    if (isMilestoneJob) {
      const invalid = milestoneRows.some(
        (m) => !m.title.trim() || !Number.isFinite(Number(m.amount)) || Number(m.amount) <= 0
      );
      if (invalid) {
        errors.milestones = 'Every milestone needs a title and an amount greater than ₱0.';
      }
    } else {
      const amount = Number(bidAmount);
      if (!String(bidAmount).trim() || Number.isNaN(amount) || amount <= 0) {
        errors.bidAmount = 'Enter a bid amount greater than 0.';
      }
    }

    if (!coverLetter.trim()) {
      errors.coverLetter = 'A cover letter is required.';
    } else if (coverLetter.trim().length < 20) {
      errors.coverLetter = `Write a bit more — ${20 - coverLetter.trim().length} characters to go.`;
    }

    return errors;
  }

  const errors = getValidationErrors();
  // Only display errors if field was focused and blurred (touched) or submit was clicked
  const showBidError = (touched.bidAmount || submitted) && errors.bidAmount;
  const showMilestonesError = submitted && errors.milestones;
  const showCoverLetterError = (touched.coverLetter || submitted) && errors.coverLetter;

  // Handle proposal submission
  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitResult(null);
    setSubmitted(true);
    setTouched({ bidAmount: true, coverLetter: true });

    if (Object.keys(errors).length > 0 || alreadyApplied) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You need to be logged in to submit a proposal.');
      }

      const payload = isMilestoneJob
        ? {
            job_id: job.job_id,
            cover_letter: coverLetter.trim(),
            milestones: milestoneRows.map((m) => ({ title: m.title.trim(), amount: Number(m.amount) })),
          }
        : {
            job_id: job.job_id,
            bid_amount: Number(bidAmount),
            cover_letter: coverLetter.trim(),
          };

      const res = await fetch(`${API_BASE_URL}/proposals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const body = await res.json();

      // Handle 409 Conflict duplicate proposal error gracefully
      if (res.status === 409 || body.error?.includes('already submitted')) {
        setAlreadyApplied(true);
        setSubmitResult({
          type: 'error',
          message: body.error || 'You have already submitted a proposal for this job.',
        });
        return;
      }

      if (!res.ok || !body.success) {
        throw new Error(body.error || body.message || 'Could not submit your proposal.');
      }

      setAlreadyApplied(true);
      setSubmitResult({
        type: 'success',
        message: 'Proposal sent! The client will review it soon.',
      });
      setBidAmount('');
      setCoverLetter('');
      setMilestoneRows([{ title: '', amount: '' }]);
    } catch (err) {
      setSubmitResult({
        type: 'error',
        message: err.message || 'Something went wrong while submitting.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  const blockReason = getProposalBlockReason(job, currentUser);

  return (
    <div className="min-h-screen bg-bg text-text">
      {/* Shared Navbar with navigable RaketBase logo, Back button, and Profile dropdown */}
      <Navbar showBack backTo="/explore" />

      {/* Main Container */}
      <div className="mx-auto max-w-5xl px-5 py-8 md:px-8">
        {loading && <p className="text-text-secondary">Loading job...</p>}

        {!loading && loadError && (
          <div className="rounded-lg border border-border bg-panel p-10 text-center">
            <p className="font-display text-lg font-medium">Couldn't load this job</p>
            <p className="mt-1 text-sm text-text-secondary">{loadError}</p>
          </div>
        )}

        {!loading && !loadError && job && (
          <div className="grid gap-6 md:grid-cols-[1fr_340px]">
            {/* Left Column: Job Details */}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-border px-2.5 py-1 text-[12px] text-text-secondary">
                  {job.categories?.category_name || 'Uncategorized'}
                </span>
                {alreadyApplied && (
                  <span className="rounded-full bg-accent/15 border border-accent/40 px-2.5 py-1 text-[12px] font-medium text-accent">
                    ✓ Applied
                  </span>
                )}
              </div>

              <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">
                {job.title || 'Untitled job'}
              </h1>

              <p className="mt-2 flex flex-wrap items-center gap-1.5 text-[13px] text-text-secondary">
                <ClockIcon className="h-3.5 w-3.5" />
                <span>Posted {formatDate(job.created_at)}</span>
                {job.users && (
                  <>
                    <span>by</span>
                    <PosterAvatar user={job.users} />
                    <span>
                      {job.users.first_name} {job.users.last_name}
                    </span>
                  </>
                )}
              </p>

              <p className="mt-6 whitespace-pre-line text-[15px] leading-relaxed text-text-secondary">
                {job.description || 'No description provided.'}
              </p>

              <ClientRatingCard job={job} className="mt-8" />
            </div>

            {/* Right Column: Budget and Proposal Form */}
            <aside className="h-fit rounded-lg border border-border bg-panel p-5">
              <p className="text-[13px] font-medium text-text-secondary">Budget</p>
              {/* Uses font-sans (Inter) for native Unicode U+20B1 (₱) support and locale thousands formatting */}
              <p className="font-sans text-2xl font-semibold text-text">
                ₱{job.budget ? Number(job.budget).toLocaleString() : '—'}
              </p>

              {/* Duplicate Proposal Guard Banner */}
              {blockReason ? (
                <ProposalBlockedNotice reason={blockReason} className="mt-4" />
              ) : withdrawnNotice ? (
                <div className="mt-4 rounded-md border border-border bg-surface p-4 text-sm">
                  <p className="font-semibold text-text">You withdrew your proposal for this job</p>
                  <p className="mt-1 text-text-secondary">
                    You can restore it — as-is or with changes — from My Proposals.
                  </p>
                  <Link
                    to="/my-proposals"
                    className="mt-3 inline-block rounded-md bg-accent px-4 py-2 text-sm font-semibold text-[#1A1305] transition-colors hover:bg-accent-hover cursor-pointer"
                  >
                    Go to My Proposals
                  </Link>
                </div>
              ) : (
              <>
              {alreadyApplied && (
                <div className="mt-4 flex items-center gap-2.5 rounded-md bg-accent/10 border border-accent/30 p-3 text-sm font-medium text-accent">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-[#1A1305] text-xs font-bold">
                    ✓
                  </span>
                  <span>Already Applied — You have already submitted a proposal for this job.</span>
                </div>
              )}

              {!alreadyApplied && !isProfileComplete(currentUser) && (
                <div className="mt-4 rounded-md border border-border bg-surface p-3 text-[13px]">
                  <p className="font-medium text-text">Complete your profile</p>
                  <p className="mt-1 text-text-secondary">
                    Add a bio and skills so clients have more to go on when they review your proposal.
                  </p>
                  <Link to="/profile" className="mt-2 inline-block font-medium text-accent hover:underline cursor-pointer">
                    Complete profile &rarr;
                  </Link>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
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
                            disabled={submitting || alreadyApplied}
                            placeholder={`Milestone ${index + 1} (e.g. Wireframes)`}
                            value={row.title}
                            onChange={(e) => updateMilestoneRow(index, 'title', e.target.value)}
                            className="min-w-0 flex-1 rounded-md border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent disabled:opacity-60 disabled:cursor-not-allowed"
                          />
                          <input
                            type="number"
                            min="1"
                            step="0.01"
                            disabled={submitting || alreadyApplied}
                            placeholder="₱ Amount"
                            value={row.amount}
                            onChange={(e) => updateMilestoneRow(index, 'amount', e.target.value)}
                            className="w-28 shrink-0 rounded-md border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent disabled:opacity-60 disabled:cursor-not-allowed"
                          />
                          <button
                            type="button"
                            onClick={() => removeMilestoneRow(index)}
                            disabled={submitting || alreadyApplied || milestoneRows.length === 1}
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
                      disabled={submitting || alreadyApplied}
                      className="mt-2.5 flex items-center gap-1.5 text-[13px] font-medium text-accent hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <PlusIcon className="h-3.5 w-3.5" />
                      Add another milestone
                    </button>
                    {showMilestonesError && (
                      <p className="mt-1.5 text-[12px] text-red-400">{errors.milestones}</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-text-secondary">
                      Your bid (₱)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      disabled={submitting || alreadyApplied}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, bidAmount: true }))}
                      className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent disabled:opacity-60 disabled:cursor-not-allowed"
                      placeholder="e.g. 15000"
                    />
                    {showBidError && (
                      <p className="mt-1 text-[12px] text-red-400">{errors.bidAmount}</p>
                    )}
                  </div>
                )}

                {/* Cover Letter Textarea */}
                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-text-secondary">
                    Cover letter
                  </label>
                  <textarea
                    value={coverLetter}
                    disabled={submitting || alreadyApplied}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, coverLetter: true }))}
                    rows={6}
                    className="w-full resize-none rounded-md border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent disabled:opacity-60 disabled:cursor-not-allowed"
                    placeholder="Explain why you're a good fit for this job."
                  />
                  {showCoverLetterError && (
                    <p className="mt-1 text-[12px] text-red-400">{errors.coverLetter}</p>
                  )}
                </div>

                {/* Submit / Already Applied Button */}
                <button
                  type="submit"
                  disabled={submitting || alreadyApplied}
                  className="w-full rounded-md bg-accent py-3 text-sm font-semibold text-[#1A1305] transition-colors hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {alreadyApplied
                    ? 'Already Applied'
                    : submitting
                    ? 'Submitting...'
                    : 'Submit proposal'}
                </button>

                {/* Submission Feedback Message */}
                {submitResult && (
                  <p
                    className={`text-[13px] ${
                      submitResult.type === 'success' ? 'text-accent' : 'text-red-400'
                    }`}
                  >
                    {submitResult.message}
                  </p>
                )}
              </form>
              </>
              )}
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

// Small round photo of the client who posted the job. Falls back to their initial
// when they have no photo (or it fails to load).
function PosterAvatar({ user }) {
  const [broken, setBroken] = useState(false);
  const src = user.client_avatar_url;
  const initial = (user.first_name?.[0] || user.email?.[0] || 'C').toUpperCase();

  if (src && !broken) {
    return (
      <img
        src={src}
        alt=""
        onError={() => setBroken(true)}
        className="h-6 w-6 shrink-0 rounded-full border border-border object-cover"
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent font-display text-[11px] font-semibold text-[#1A1305]"
    >
      {initial}
    </span>
  );
}

// Date formatter helper
function formatDate(value) {
  if (!value) return 'recently';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'recently';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
