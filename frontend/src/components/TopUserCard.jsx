import { useState } from 'react';
import { Link } from 'react-router-dom';
import { StarDisplay } from './StarRating';
import { formatAverage, formatPeso, reviewCountLabel } from '../utils/ratings';

// One row of the Top Users list. The whole card links to that person's public profile,
// opened in the right role (freelancer or client).
//   user - an item from GET /top-users
//   role - 'freelancer' | 'customer'
//   rank - their position in the list currently shown (1 = first)
export default function TopUserCard({ user, role, rank }) {
  const [broken, setBroken] = useState(false);
  const isFreelancer = role === 'freelancer';
  const comment = user.latest_comment;
  const podium = rank <= 3;

  return (
    <Link
      to={`/users/${user.user_id}?role=${role}`}
      className="group flex h-full flex-col rounded-lg border border-border bg-panel p-5 transition-colors hover:border-accent/50 cursor-pointer"
    >
      <div className="flex items-start gap-3.5">
        {user.avatar_url && !broken ? (
          <img
            src={user.avatar_url}
            alt=""
            onError={() => setBroken(true)}
            className="h-14 w-14 shrink-0 rounded-full border border-border object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent font-display text-xl font-semibold text-[#1A1305]"
          >
            {(user.name?.[0] || 'U').toUpperCase()}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                podium ? 'bg-accent text-[#1A1305]' : 'border border-border text-text-secondary'
              }`}
            >
              #{rank}
            </span>
            <p className="truncate font-display text-lg font-semibold transition-colors group-hover:text-accent">
              {user.name}
            </p>
          </div>

          {isFreelancer && user.skills?.length > 0 && (
            <p className="mt-0.5 truncate text-[12px] text-text-secondary">{user.skills.join(' · ')}</p>
          )}
          {!isFreelancer && user.company_name && (
            <p className="mt-0.5 truncate text-[12px] text-text-secondary">{user.company_name}</p>
          )}

          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            <StarDisplay value={user.average} className="h-4 w-4" />
            <span className="text-sm font-semibold">{formatAverage(user.average)}</span>
            <span className="text-[12px] text-text-secondary">({reviewCountLabel(user.count)})</span>
          </div>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 rounded-md bg-surface px-3.5 py-2.5 text-[12px]">
        <div>
          <dt className="text-text-secondary">{isFreelancer ? 'Average rate' : 'Average budget'}</dt>
          <dd className="mt-0.5 font-sans text-[15px] font-semibold text-text">{formatPeso(user.avg_price)}</dd>
        </div>
        <div>
          <dt className="text-text-secondary">Completed contracts</dt>
          <dd className="mt-0.5 font-sans text-[15px] font-semibold text-text">{user.completed_contracts}</dd>
        </div>
      </dl>

      {comment ? (
        <blockquote className="mt-4 border-l-2 border-accent/50 pl-3">
          <p className="line-clamp-3 whitespace-pre-line text-[13px] leading-relaxed text-text-secondary">
            “{comment.comment}”
          </p>
          <footer className="mt-1.5 text-[12px] text-text-secondary/80">
            {comment.reviewer_name}, {formatDate(comment.created_at)}
          </footer>
        </blockquote>
      ) : (
        <p className="mt-4 text-[13px] text-text-secondary">No written review yet.</p>
      )}
    </Link>
  );
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
