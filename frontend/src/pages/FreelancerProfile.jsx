import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
// TODO: adjust this path to wherever your Supabase client lives
// (the same one Login.jsx uses for supabase.auth.signInWithPassword).
import { supabase } from '../config/supabaseClient';
import { ArrowLeftIcon, ClockIcon } from '../components/Icons';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export default function FreelancerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [bidAmount, setBidAmount] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null); // { type: 'success' | 'error', message }

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

  function validate() {
    const errors = {};
    const amount = Number(bidAmount);

    if (!bidAmount.trim() || Number.isNaN(amount) || amount <= 0) {
      errors.bidAmount = 'Enter a bid amount greater than 0.';
    }
    if (!coverLetter.trim()) {
      errors.coverLetter = 'A cover letter is required.';
    } else if (coverLetter.trim().length < 20) {
      errors.coverLetter = `Write a bit more — ${20 - coverLetter.trim().length} characters to go.`;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitResult(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (sessionError || !token) {
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
      if (!res.ok || !body.success) {
        throw new Error(body.error || 'Could not submit your proposal.');
      }

      setSubmitResult({ type: 'success', message: 'Proposal sent. The client will review it soon.' });
      setBidAmount('');
      setCoverLetter('');
    } catch (err) {
      setSubmitResult({ type: 'error', message: err.message || 'Something went wrong.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-border bg-bg/95 px-5 py-4 backdrop-blur md:px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[13px] font-medium text-text-secondary hover:text-text"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back
        </button>
        <Link to="/dashboard" className="ml-auto font-display text-xl font-semibold tracking-tight">
          RaketBase
        </Link>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-8 md:px-8">
        {loading && <p className="text-text-secondary">Loading job…</p>}

        {!loading && loadError && (
          <div className="rounded-lg border border-border bg-panel p-10 text-center">
            <p className="font-display text-lg font-medium">Couldn't load this job</p>
            <p className="mt-1 text-sm text-text-secondary">{loadError}</p>
          </div>
        )}

        {!loading && !loadError && job && (
          <div className="grid gap-6 md:grid-cols-[1fr_340px]">
            <div>
              <span className="rounded-full border border-border px-2.5 py-1 text-[12px] text-text-secondary">
                {job.categories?.category_name || 'Uncategorized'}
              </span>

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

            <aside className="h-fit rounded-lg border border-border bg-panel p-5">
              <p className="text-[13px] font-medium text-text-secondary">Budget</p>
              <p className="font-display text-2xl font-semibold">${job.budget ?? '—'}</p>

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-text-secondary">
                    Your bid ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent"
                    placeholder="e.g. 120"
                  />
                  {formErrors.bidAmount && (
                    <p className="mt-1 text-[12px] text-red-400">{formErrors.bidAmount}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-text-secondary">
                    Cover letter
                  </label>
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    rows={6}
                    className="w-full resize-none rounded-md border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent"
                    placeholder="Explain why you're a good fit for this job."
                  />
                  {formErrors.coverLetter && (
                    <p className="mt-1 text-[12px] text-red-400">{formErrors.coverLetter}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-md bg-accent py-3 text-sm font-semibold text-[#1A1305] transition-colors hover:bg-accent-hover disabled:opacity-60"
                >
                  {submitting ? 'Submitting…' : 'Submit proposal'}
                </button>

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

function formatDate(value) {
  if (!value) return 'recently';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'recently';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
