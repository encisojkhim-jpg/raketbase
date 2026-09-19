import { useState } from 'react';
import { Link } from 'react-router-dom';
import { StarDisplay } from './StarRating';
import { CRITERIA, formatAverage, reviewCountLabel } from '../utils/ratings';

// "About the client" card for job pages, so freelancers can see how previous
// freelancers rated this client before they apply.
// Expects the job from GET /jobs/:id (uses job.client_id, job.users, job.client_rating).
export default function ClientRatingCard({ job, className = '' }) {
  const [broken, setBroken] = useState(false);
  const client = job.users || {};
  const rating = job.client_rating;
  const name = [client.first_name, client.last_name].filter(Boolean).join(' ') || 'Client';
  const initial = (client.first_name?.[0] || client.email?.[0] || 'C').toUpperCase();
  const hasRatings = rating && rating.count > 0;

  return (
    <div className={`rounded-lg border border-border bg-surface/40 p-5 ${className}`}>
      <div className="flex items-start gap-3.5">
        {client.client_avatar_url && !broken ? (
          <img
            src={client.client_avatar_url}
            alt=""
            onError={() => setBroken(true)}
            className="h-12 w-12 shrink-0 rounded-full border border-border object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent font-display text-lg font-semibold text-[#1A1305]"
          >
            {initial}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <p className="text-[12px] text-text-secondary">About the client</p>
          <p className="truncate font-display text-base font-semibold">{name}</p>

          {hasRatings ? (
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <StarDisplay value={rating.average} className="h-4 w-4" />
              <span className="text-sm font-semibold">{formatAverage(rating.average)}</span>
              <span className="text-[12px] text-text-secondary">({reviewCountLabel(rating.count)})</span>
            </div>
          ) : (
            <p className="mt-1 text-[13px] text-text-secondary">No ratings yet — this client is new or hasn't been rated.</p>
          )}
        </div>
      </div>

      {hasRatings && (
        <dl className="mt-4 grid gap-x-6 gap-y-1.5 text-[13px] sm:grid-cols-3">
          {CRITERIA.customer.map((c) => (
            <div key={c.key} className="flex items-baseline justify-between gap-2 sm:block">
              <dt className="text-text-secondary">{c.label}</dt>
              <dd className="font-semibold">{formatAverage(rating.breakdown?.[c.key])}</dd>
            </div>
          ))}
        </dl>
      )}

      {job.client_id && (
        <Link
          to={`/users/${job.client_id}?role=customer`}
          className="mt-4 inline-block text-[13px] font-medium text-accent hover:underline cursor-pointer"
        >
          View client profile{hasRatings ? ' and reviews' : ''}
        </Link>
      )}
    </div>
  );
}
