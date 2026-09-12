// FreelancerProfile.jsx — Job Details & Proposal Submission View (Paula + Kyle)
// Features:
// 1. Shared Navbar with navigable logo, back button, and user profile dropdown
// 2. Native Unicode U+20B1 (₱) rendering with Inter (font-sans) and locale thousands formatting
// 3. Duplicate proposal guard: checks existing submissions, disables re-application, and shows 'Already Applied'
// 4. Deferred form validation: errors only show after onBlur (touched) or on submit click, never on initial load
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ClockIcon } from '../components/Icons';

// Configurable API base URL, defaulting to local backend port 5000
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export default function FreelancerProfile() {
  // Extract job ID parameter from the route URL (/explore/:id)
  const { id } = useParams();

  // Job data loading state
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Proposal form state
  const [bidAmount, setBidAmount] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  // Duplicate proposal tracking
  const [alreadyApplied, setAlreadyApplied] = useState(false);

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
          const hasApplied = body.data.some(
            (p) => String(p.job_id) === String(id)
          );
          if (hasApplied) {
            setAlreadyApplied(true);
          }
        }
      } catch (err) {
        // Silently continue if check fails
      }
    }

    checkExistingProposal();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Compute field validation rules
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
  // Only display errors if field was focused and blurred (touched) or submit was clicked
  const showBidError = (touched.bidAmount || submitted) && errors.bidAmount;
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
        throw new Error(body.error || 'Could not submit your proposal.');
      }

      setAlreadyApplied(true);
      setSubmitResult({
        type: 'success',
        message: 'Proposal sent! The client will review it soon.',
      });
      setBidAmount('');
      setCoverLetter('');
    } catch (err) {
      setSubmitResult({
        type: 'error',
        message: err.message || 'Something went wrong while submitting.',
      });
    } finally {
      setSubmitting(false);
    }
  }

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

              <p className="mt-2 flex items-center gap-1.5 text-[13px] text-text-secondary">
                <ClockIcon className="h-3.5 w-3.5" />
                Posted {formatDate(job.created_at)}
                {job.users && ` by ${job.users.first_name} ${job.users.last_name}`}
              </p>

              <p className="mt-6 whitespace-pre-line text-[15px] leading-relaxed text-text-secondary">
                {job.description || 'No description provided.'}
              </p>
            </div>

            {/* Right Column: Budget and Proposal Form */}
            <aside className="h-fit rounded-lg border border-border bg-panel p-5">
              <p className="text-[13px] font-medium text-text-secondary">Budget</p>
              {/* Uses font-sans (Inter) for native Unicode U+20B1 (₱) support and locale thousands formatting */}
              <p className="font-sans text-2xl font-semibold text-text">
                ₱{job.budget ? Number(job.budget).toLocaleString() : '—'}
              </p>

              {/* Duplicate Proposal Guard Banner */}
              {alreadyApplied && (
                <div className="mt-4 flex items-center gap-2.5 rounded-md bg-accent/10 border border-accent/30 p-3 text-sm font-medium text-accent">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-[#1A1305] text-xs font-bold">
                    ✓
                  </span>
                  <span>Already Applied — You have already submitted a proposal for this job.</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                {/* Bid Amount Input */}
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
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

// Date formatter helper
function formatDate(value) {
  if (!value) return 'recently';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'recently';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
