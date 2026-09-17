// JobDetail.jsx — Detailed job specification view
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ClockIcon } from '../components/Icons';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export default function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          </div>
        )}
      </main>
    </div>
  );
}