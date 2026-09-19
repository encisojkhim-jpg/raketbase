// MyProposals.jsx — Freelancer's own proposals, filterable by status.
// Lets a freelancer withdraw a pending proposal, and later restore
// (unwithdraw) it — either as-is or with an edited bid/cover letter.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ClockIcon } from '../components/Icons';
import { getMyProposals, withdrawProposal, unwithdrawProposal } from '../services/api';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' },
];

const STATUS_STYLES = {
  pending: 'bg-surface text-text-secondary border-border',
  accepted: 'bg-accent/10 text-accent border-accent/30',
  rejected: 'bg-error/10 text-error border-error/30',
  withdrawn: 'bg-surface text-text-secondary border-border',
};

export default function MyProposals() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [actioningId, setActioningId] = useState(null);
  const [actionError, setActionError] = useState('');

  async function load() {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await getMyProposals();
      setProposals(res.data || []);
    } catch (err) {
      setLoadError(err.message || 'Could not load your proposals.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleWithdraw(proposalId) {
    if (!window.confirm('Withdraw this proposal? You can restore it later from this page.')) return;
    setActionError('');
    setActioningId(proposalId);
    try {
      await withdrawProposal(proposalId);
      await load();
    } catch (err) {
      setActionError(err.message || 'Could not withdraw this proposal.');
    } finally {
      setActioningId(null);
    }
  }

  async function handleUnwithdraw(proposalId, payload) {
    setActionError('');
    setActioningId(proposalId);
    try {
      await unwithdrawProposal(proposalId, payload);
      await load();
    } catch (err) {
      setActionError(err.message || 'Could not restore this proposal.');
    } finally {
      setActioningId(null);
    }
  }

  const counts = FILTERS.reduce((acc, f) => {
    acc[f.value] = f.value === 'all' ? proposals.length : proposals.filter((p) => p.status === f.value).length;
    return acc;
  }, {});

  const visibleProposals = filter === 'all' ? proposals : proposals.filter((p) => p.status === filter);

  return (
    <div className="min-h-screen bg-bg text-text">
      <Navbar />
      <div className="mx-auto max-w-4xl px-5 py-8 md:px-8">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-semibold tracking-tight">My Proposals</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Track every bid you've sent, and manage the ones still in play.
          </p>
        </div>

        {/* Status filter tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors cursor-pointer ${
                filter === f.value
                  ? 'border-accent/40 bg-accent/15 text-accent'
                  : 'border-border text-text-secondary hover:text-text'
              }`}
            >
              {f.label}
              <span className="ml-1.5 text-[11px] opacity-70">{counts[f.value]}</span>
            </button>
          ))}
        </div>

        {actionError && (
          <div className="mb-4 rounded-md border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
            {actionError}
          </div>
        )}

        {loading && <StateCard title="Loading your proposals..." />}

        {!loading && loadError && (
          <StateCard title="Couldn't load your proposals" body={loadError} action={{ label: 'Try again', onClick: load }} />
        )}

        {!loading && !loadError && visibleProposals.length === 0 && (
          <StateCard
            title={filter === 'all' ? 'No proposals yet' : `No ${filter} proposals`}
            body={filter === 'all' ? 'Browse open jobs and submit your first proposal.' : 'Nothing here right now.'}
          />
        )}

        {!loading && !loadError && visibleProposals.length > 0 && (
          <div className="space-y-3">
            {visibleProposals.map((p) => (
              <ProposalRow
                key={p.proposal_id}
                proposal={p}
                busy={actioningId === p.proposal_id}
                onWithdraw={() => handleWithdraw(p.proposal_id)}
                onUnwithdraw={(payload) => handleUnwithdraw(p.proposal_id, payload)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProposalRow({ proposal, busy, onWithdraw, onUnwithdraw }) {
  const [editing, setEditing] = useState(false);
  const [bidAmount, setBidAmount] = useState(proposal.bid_amount);
  const [coverLetter, setCoverLetter] = useState(proposal.cover_letter);
  const [editError, setEditError] = useState('');

  const jobIsOpen = proposal.jobs?.status === 'open';

  function startEdit() {
    setBidAmount(proposal.bid_amount);
    setCoverLetter(proposal.cover_letter);
    setEditError('');
    setEditing(true);
  }

  function handleResubmit() {
    const amount = Number(bidAmount);
    if (!bidAmount || Number.isNaN(amount) || amount <= 0) {
      setEditError('Enter a bid amount greater than 0.');
      return;
    }
    if (!coverLetter.trim() || coverLetter.trim().length < 20) {
      setEditError('Cover letter should be at least 20 characters.');
      return;
    }
    setEditError('');
    onUnwithdraw({ bid_amount: amount, cover_letter: coverLetter.trim() });
    setEditing(false);
  }

  return (
    <div className="rounded-lg border border-border bg-panel p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Link
              to={`/explore/${proposal.job_id}`}
              className="font-display text-base font-medium hover:text-accent transition-colors"
            >
              {proposal.jobs?.title || 'Job Posting'}
            </Link>
            <StatusPill status={proposal.status} />
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-[12px] text-text-secondary">
            <ClockIcon className="h-3.5 w-3.5" />
            Submitted {formatDate(proposal.submitted_at)}
          </p>
        </div>
        <p className="shrink-0 font-sans text-xl font-semibold text-accent">
          ₱{Number(proposal.bid_amount || 0).toLocaleString()}
        </p>
      </div>

      {!editing && (
        <p className="mt-4 whitespace-pre-line text-[14px] leading-relaxed text-text-secondary">
          {proposal.cover_letter}
        </p>
      )}

      {/* Pending: can withdraw */}
      {proposal.status === 'pending' && (
        <div className="mt-4 flex gap-2.5 border-t border-border pt-4">
          <button
            onClick={onWithdraw}
            disabled={busy}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-error/40 hover:text-error disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {busy ? 'Working...' : 'Withdraw'}
          </button>
        </div>
      )}

      {/* Withdrawn: can restore as-is, or edit and resubmit */}
      {proposal.status === 'withdrawn' && !jobIsOpen && (
        <div className="mt-4 rounded-md border border-border bg-surface p-3 text-[13px] text-text-secondary">
          This job is no longer open, so this proposal can't be restored.
        </div>
      )}

      {proposal.status === 'withdrawn' && jobIsOpen && !editing && (
        <div className="mt-4 flex gap-2.5 border-t border-border pt-4">
          <button
            onClick={() => onUnwithdraw()}
            disabled={busy}
            className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-[#1A1305] transition-colors hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {busy ? 'Working...' : 'Restore proposal'}
          </button>
          <button
            onClick={startEdit}
            disabled={busy}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-text transition-colors hover:border-accent/40 hover:text-accent disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Edit &amp; resubmit
          </button>
        </div>
      )}

      {proposal.status === 'withdrawn' && jobIsOpen && editing && (
        <div className="mt-4 space-y-3 border-t border-border pt-4">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-text-secondary">
              Your bid (₱)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-text-secondary">
              Cover letter
            </label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={5}
              className="w-full resize-none rounded-md border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent"
            />
          </div>
          {editError && <p className="text-[12px] text-error">{editError}</p>}
          <div className="flex gap-2.5">
            <button
              onClick={handleResubmit}
              disabled={busy}
              className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-[#1A1305] transition-colors hover:bg-accent-hover disabled:opacity-50 cursor-pointer"
            >
              {busy ? 'Working...' : 'Resubmit'}
            </button>
            <button
              onClick={() => setEditing(false)}
              disabled={busy}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium text-text-secondary hover:text-text disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }) {
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLES[status] || STATUS_STYLES.pending}`}
    >
      {status}
    </span>
  );
}

function StateCard({ title, body, action }) {
  return (
    <div className="rounded-lg border border-border bg-panel p-10 text-center">
      <p className="font-display text-lg font-medium">{title}</p>
      {body && <p className="mt-1 text-sm text-text-secondary">{body}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 rounded-md border border-border px-4 py-2 text-sm font-medium hover:border-accent/40 cursor-pointer"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

function formatDate(value) {
  if (!value) return 'recently';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'recently';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
