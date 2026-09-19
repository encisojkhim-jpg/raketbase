import { Link } from 'react-router-dom';

// Shown in place of the proposal form when the current user cannot bid.
//   reason 'own'         -> the user posted this job
//   reason 'taken'       -> the job is assigned/completed and no longer accepts proposals
//   reason 'client_mode' -> the user is in Client mode (bidding needs Freelancer mode)
export default function ProposalBlockedNotice({ reason, className = '' }) {
  if (!reason) return null;

  return (
    <div className={`rounded-md border border-border bg-surface p-4 text-sm ${className}`}>
      {reason === 'own' ? (
        <>
          <p className="font-semibold text-text">This is your job posting</p>
          <p className="mt-1 text-text-secondary">
            You can&apos;t submit a proposal on a job you posted. Review incoming proposals from your postings.
          </p>
          <Link
            to="/my-jobs"
            className="mt-3 inline-block rounded-md bg-accent px-4 py-2 text-sm font-semibold text-[#1A1305] transition-colors hover:bg-accent-hover cursor-pointer"
          >
            Go to My Postings
          </Link>
        </>
      ) : reason === 'taken' ? (
        <>
          <p className="font-semibold text-text">This job has been taken</p>
          <p className="mt-1 text-text-secondary">
            A freelancer has already been hired, so this job is no longer accepting proposals.
          </p>
          <Link
            to="/explore"
            className="mt-3 inline-block rounded-md border border-border px-4 py-2 text-sm font-medium text-text transition-colors hover:border-accent/40 hover:text-accent cursor-pointer"
          >
            Browse open jobs
          </Link>
        </>
      ) : (
        <>
          <p className="font-semibold text-text">Freelancer mode required</p>
          <p className="mt-1 text-text-secondary">
            You&apos;re currently in Client mode. Use the Client | Freelancer toggle in the navbar to switch, then apply.
          </p>
        </>
      )}
    </div>
  );
}
