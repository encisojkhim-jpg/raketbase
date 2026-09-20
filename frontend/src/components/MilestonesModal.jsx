// MilestonesModal.jsx — stage-by-stage view/actions for a milestone-based contract.
// Mirrors the plain-contract Submit Work / Approve & Release Funds actions on
// Dashboard.jsx, but scoped to one milestone at a time (milestones are sequential:
// only the 'active' one can be submitted, only a 'submitted' one can be approved).
import { useEffect, useState } from 'react';
import { CloseIcon } from './Icons';
import { submitMilestone, approveMilestone } from '../services/api';

const STATUS_LABEL = {
  pending: 'Locked',
  active: 'In Progress',
  submitted: 'Awaiting Approval',
  completed: 'Released',
};

const STATUS_STYLE = {
  pending: 'bg-surface text-text-secondary border-border',
  active: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  submitted: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
};

// contract        - the contract row (with .milestones, sorted by sequence)
// isClient        - true when the current user is this contract's client
// onClose()       - dismiss the modal
// onUpdated()     - called after any milestone action, so the parent can refetch
// onContractCompleted(contract) - called when the final milestone's approval closes the contract
export default function MilestonesModal({ contract, isClient, onClose, onUpdated, onContractCompleted }) {
  const [milestones, setMilestones] = useState(contract.milestones || []);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setMilestones(contract.milestones || []);
  }, [contract.milestones]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const completedCount = milestones.filter((m) => m.status === 'completed').length;

  async function handleSubmit(milestone) {
    setError('');
    setBusyId(milestone.milestone_id);
    try {
      await submitMilestone(contract.contract_id, milestone.milestone_id);
      setMilestones((prev) =>
        prev.map((m) => (m.milestone_id === milestone.milestone_id ? { ...m, status: 'submitted' } : m))
      );
      onUpdated?.();
    } catch (err) {
      setError(err.message || 'Failed to submit this milestone.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleApprove(milestone) {
    const amount = Number(milestone.amount).toLocaleString();
    if (!window.confirm(`Approve "${milestone.title}" and release ₱${amount} to the freelancer?`)) return;

    setError('');
    setBusyId(milestone.milestone_id);
    try {
      const res = await approveMilestone(contract.contract_id, milestone.milestone_id);
      setMilestones((prev) =>
        prev.map((m) => (m.milestone_id === milestone.milestone_id ? { ...m, status: 'completed' } : m))
      );
      onUpdated?.();
      if (res.data?.contract_completed) {
        onContractCompleted?.(contract);
      }
    } catch (err) {
      setError(err.message || 'Failed to approve this milestone.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="my-8 w-full max-w-lg rounded-lg border border-border bg-panel p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold tracking-tight">Milestones</h2>
            <p className="mt-1 text-[13px] text-text-secondary">
              {contract.jobs?.title || 'Job Posting'} &middot; {completedCount} of {milestones.length} completed
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 text-text-secondary hover:text-text cursor-pointer"
            aria-label="Close"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <p role="alert" className="mt-4 text-[13px] text-error">
            {error}
          </p>
        )}

        <ul className="mt-5 space-y-2.5">
          {milestones.map((m, i) => {
            const busy = busyId === m.milestone_id;
            return (
              <li key={m.milestone_id} className="rounded-md border border-border bg-surface/50 p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text">
                      {i + 1}. {m.title}
                    </p>
                    <p className="mt-0.5 text-[13px] font-semibold text-accent">
                      ₱{Number(m.amount).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                      STATUS_STYLE[m.status] || STATUS_STYLE.pending
                    }`}
                  >
                    {STATUS_LABEL[m.status] || m.status}
                  </span>
                </div>

                {!isClient && m.status === 'active' && (
                  <button
                    onClick={() => handleSubmit(m)}
                    disabled={busy}
                    className="mt-3 w-full rounded-md bg-accent px-3 py-2 text-xs font-semibold text-[#1A1305] hover:bg-accent-hover disabled:opacity-50 cursor-pointer transition-colors"
                  >
                    {busy ? 'Submitting...' : 'Submit This Milestone'}
                  </button>
                )}

                {isClient && m.status === 'submitted' && (
                  <button
                    onClick={() => handleApprove(m)}
                    disabled={busy}
                    className="mt-3 w-full rounded-md bg-emerald-500 px-3 py-2 text-xs font-semibold text-black hover:bg-emerald-400 disabled:opacity-50 cursor-pointer transition-colors"
                  >
                    {busy ? 'Releasing...' : `Approve & Release ₱${Number(m.amount).toLocaleString()}`}
                  </button>
                )}
              </li>
            );
          })}
        </ul>

        {contract.status === 'completed' && (
          <p className="mt-4 text-[13px] text-emerald-400">All milestones released. This contract is complete.</p>
        )}
      </div>
    </div>
  );
}
