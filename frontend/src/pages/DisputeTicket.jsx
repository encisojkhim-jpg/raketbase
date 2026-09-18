// Validation Specs (per task doc):
//   - Reason / Category: required dropdown (Incomplete Work, Non-Payment, Unresponsive)
//   - Evidence Summary: required, minimum 30 characters
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getContractById, createDispute } from '../services/api';

const REASON_OPTIONS = ['Incomplete Work', 'Non-Payment', 'Unresponsive'];
const MIN_EVIDENCE_LENGTH = 30;

export default function DisputeTicket() {
  const { id: contractId } = useParams();
  const navigate = useNavigate();

  const [contract, setContract] = useState(null);
  const [loadingContract, setLoadingContract] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [reasonCategory, setReasonCategory] = useState('');
  const [evidenceSummary, setEvidenceSummary] = useState('');
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  })();

  useEffect(() => {
    async function loadContract() {
      try {
        const res = await getContractById(contractId);
        setContract(res.data);
      } catch (err) {
        setLoadError(err.message || 'Could not load this contract.');
      } finally {
        setLoadingContract(false);
      }
    }
    loadContract();
  }, [contractId]);

  const evidenceTooShort = evidenceSummary.trim().length < MIN_EVIDENCE_LENGTH;
  const evidenceCharsLeft = MIN_EVIDENCE_LENGTH - evidenceSummary.trim().length;

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched(true);
    setSubmitError('');

    if (!reasonCategory) {
      return setSubmitError('Please select a reason for the dispute.');
    }
    if (evidenceTooShort) {
      return setSubmitError(`Evidence summary must be at least ${MIN_EVIDENCE_LENGTH} characters.`);
    }

    setSubmitting(true);
    try {
      await createDispute({
        contract_id: contractId,
        reason_category: reasonCategory,
        evidence_summary: evidenceSummary.trim(),
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message || 'Failed to file dispute. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingContract) {
    return (
      <div className="flex min-h-screen bg-bg text-text items-center justify-center">
        <p className="text-text-secondary animate-pulse">Loading contract details...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-bg text-text">
        <Navbar showBack backTo="/dashboard" />
        <div className="p-8 flex justify-center">
          <div className="w-full max-w-2xl bg-panel border border-border p-8 rounded-lg text-center">
            <p className="font-display text-lg font-medium mb-2">Couldn't load this contract</p>
            <p className="text-text-secondary text-sm mb-6">{loadError}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-accent text-[#1A1305] rounded-md text-sm font-semibold hover:bg-accent-hover transition-colors cursor-pointer"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-bg text-text">
        <Navbar showBack backTo="/dashboard" />
        <div className="p-8 flex justify-center">
          <div className="w-full max-w-2xl bg-panel border border-border p-8 rounded-lg text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 text-xl text-emerald-400">
              ✓
            </div>
            <p className="font-display text-lg font-medium mb-2">Dispute filed</p>
            <p className="text-text-secondary text-sm mb-6 max-w-sm mx-auto">
              A staff admin will review the evidence and reach a resolution. You'll be able to track
              its status from your dashboard.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-accent text-[#1A1305] rounded-md text-sm font-semibold hover:bg-accent-hover transition-colors cursor-pointer"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const otherParty =
    user.user_id === contract?.client_id ? contract?.freelancer : contract?.client;
  const otherPartyLabel = user.user_id === contract?.client_id ? 'Freelancer' : 'Client';

  return (
    <div className="min-h-screen bg-bg text-text">
      <Navbar showBack backTo="/dashboard" />
      <div className="p-8 flex justify-center">
        <div className="w-full max-w-2xl bg-panel border border-border p-8 rounded-lg shadow-lg">
          <h2 className="font-display text-2xl font-semibold mb-2">File a Dispute</h2>
          <p className="text-text-secondary text-sm mb-6">
            Disputes are reviewed by RaketBase staff, who can refund the client, release funds to
            the freelancer, or split the escrowed amount.
          </p>

          {/* Contract context */}
          <div className="mb-6 p-4 rounded-lg bg-surface border border-border">
            <p className="font-display text-sm font-medium mb-1">
              {contract?.jobs?.title || 'Contract'}
            </p>
            <p className="text-text-secondary text-xs">
              ₱{Number(contract?.agreed_amount || 0).toLocaleString()} in escrow
              {otherParty && (
                <>
                  {' · '}
                  {otherPartyLabel}: {[otherParty.first_name, otherParty.last_name].filter(Boolean).join(' ') || otherParty.email}
                </>
              )}
            </p>
          </div>

          {submitError && (
            <div className="text-sm mb-4 px-3 py-2.5 rounded-md bg-error/10 text-error border border-error/30">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5" htmlFor="reason">
                Reason / Category
              </label>
              <select
                id="reason"
                required
                value={reasonCategory}
                onChange={(e) => setReasonCategory(e.target.value)}
                className="w-full bg-surface border border-border text-text px-3 py-2.5 rounded-md text-sm outline-none focus:border-accent transition-colors"
              >
                <option value="">Select a reason</option>
                {REASON_OPTIONS.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5" htmlFor="evidence">
                Evidence Summary
              </label>
              <textarea
                id="evidence"
                required
                rows={6}
                placeholder="Explain what happened, including relevant dates, messages, or deliverables. Minimum 30 characters."
                value={evidenceSummary}
                onChange={(e) => setEvidenceSummary(e.target.value)}
                onBlur={() => setTouched(true)}
                className="w-full bg-surface border border-border text-text px-3 py-2.5 rounded-md text-sm outline-none focus:border-accent transition-colors"
              />
              <div className="flex justify-between mt-1.5">
                {touched && evidenceTooShort ? (
                  <p className="text-[12px] text-error">
                    {evidenceCharsLeft > 0
                      ? `${evidenceCharsLeft} more character${evidenceCharsLeft === 1 ? '' : 's'} needed`
                      : 'Evidence summary is required'}
                  </p>
                ) : (
                  <span />
                )}
                <p className="text-[12px] text-text-secondary">
                  {evidenceSummary.trim().length}/{MIN_EVIDENCE_LENGTH} min
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-accent hover:bg-accent-hover disabled:bg-border disabled:text-text-secondary text-[#1A1305] font-semibold text-sm py-3 rounded-md mt-2 transition-colors cursor-pointer"
            >
              {submitting ? 'Filing dispute...' : 'File Dispute'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
