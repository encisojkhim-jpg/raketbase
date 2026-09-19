import { useEffect, useState } from 'react';
import { getUserReviews } from '../services/api';
import { StarDisplay } from './StarRating';
import { CRITERIA, formatAverage, reviewCountLabel } from '../utils/ratings';

// Average + breakdown + written reviews for one person in one role.
//
// Pass `data` (the getUserReviews response's `data`) when the page already fetched it,
// otherwise pass `userId` + `role` and the panel fetches it itself.
export default function RatingsPanel({ userId, role, data: preloaded = null, className = '' }) {
  const [fetched, setFetched] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (preloaded || !userId) return;
    let cancelled = false;
    getUserReviews(userId, role)
      .then((res) => !cancelled && setFetched(res.data))
      .catch((err) => !cancelled && setError(err.message || 'Could not load ratings.'));
    return () => {
      cancelled = true;
    };
  }, [preloaded, userId, role]);

  const data = preloaded || fetched;
  const isFreelancer = role === 'freelancer';
  const heading = isFreelancer ? 'Ratings as a freelancer' : 'Ratings as a client';

  return (
    <section className={className} aria-label={heading}>
      <h2 className="font-display text-xl font-semibold tracking-tight">{heading}</h2>

      {error && <p className="mt-3 text-sm text-error">{error}</p>}
      {!error && !data && <p className="mt-3 text-sm text-text-secondary">Loading ratings...</p>}

      {data && data.summary.count === 0 && (
        <div className="mt-4 rounded-lg border border-border bg-panel p-8 text-center">
          <p className="font-display text-base font-medium">No ratings yet</p>
          <p className="mt-1 text-sm text-text-secondary">
            {isFreelancer
              ? 'Ratings appear here after a client completes a contract with this freelancer.'
              : 'Ratings appear here after a freelancer completes a contract with this client.'}
          </p>
        </div>
      )}

      {data && data.summary.count > 0 && (
        <>
          <SummaryCard summary={data.summary} role={role} />
          <ul className="mt-4 space-y-3">
            {data.reviews.map((r) => (
              <ReviewItem key={r.review_id} review={r} role={role} />
            ))}
          </ul>
          {data.has_more && (
            <p className="mt-3 text-[12px] text-text-secondary">Showing the {data.reviews.length} most recent reviews.</p>
          )}
        </>
      )}
    </section>
  );
}

function SummaryCard({ summary, role }) {
  const criteria = CRITERIA[role];
  return (
    <div className="mt-4 grid gap-6 rounded-lg border border-border bg-panel p-5 sm:grid-cols-[180px_1fr]">
      <div>
        <p className="font-display text-5xl font-semibold leading-none text-accent">{formatAverage(summary.average)}</p>
        <div className="mt-2">
          <StarDisplay value={summary.average} className="h-4 w-4" />
        </div>
        <p className="mt-1.5 text-[13px] text-text-secondary">{reviewCountLabel(summary.count)}</p>
      </div>

      <div className="space-y-2.5">
        {criteria.map((c) => (
          <CriterionBar key={c.key} label={c.label} value={summary.breakdown?.[c.key]} />
        ))}
      </div>
    </div>
  );
}

function CriterionBar({ label, value }) {
  const pct = value == null ? 0 : (Number(value) / 5) * 100;
  return (
    <div className="grid grid-cols-[130px_1fr_32px] items-center gap-3 text-[13px]">
      <span className="text-text-secondary">{label}</span>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface">
        <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-right font-medium text-text">{formatAverage(value)}</span>
    </div>
  );
}

function ReviewItem({ review, role }) {
  const criteria = CRITERIA[role];
  return (
    <li className="rounded-lg border border-border bg-panel p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <ReviewerAvatar reviewer={review.reviewer} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{review.reviewer.name}</p>
            <p className="truncate text-[12px] text-text-secondary">
              {review.job_title ? `${review.job_title} · ` : ''}
              {formatDate(review.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StarDisplay value={review.rating} className="h-4 w-4" />
          <span className="text-sm font-semibold">{review.rating}.0</span>
        </div>
      </div>

      <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-text-secondary">
        {criteria.map((c) => (
          <span key={c.key}>
            {c.label}: <strong className="font-medium text-text">{review[c.key]}/5</strong>
          </span>
        ))}
      </p>

      {review.comment && (
        <p className="mt-3 whitespace-pre-line text-[14px] leading-relaxed text-text-secondary">{review.comment}</p>
      )}
    </li>
  );
}

function ReviewerAvatar({ reviewer }) {
  const [broken, setBroken] = useState(false);
  const initial = (reviewer.name?.[0] || 'U').toUpperCase();
  if (reviewer.avatar_url && !broken) {
    return (
      <img
        src={reviewer.avatar_url}
        alt=""
        onError={() => setBroken(true)}
        className="h-9 w-9 shrink-0 rounded-full border border-border object-cover"
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent font-display text-sm font-semibold text-[#1A1305]"
    >
      {initial}
    </span>
  );
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
