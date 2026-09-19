import { useEffect, useState } from 'react';
import { StarInput } from './StarRating';
import { createReview } from '../services/api';
import { CRITERIA, COMMENT_MAX } from '../utils/ratings';

// Rating form for a completed contract.
//   contract       - the contract row from GET /contracts
//   isClient       - true when the current user is the client (so they are rating the freelancer)
//   onClose()      - dismiss without rating
//   onSubmitted()  - called after the review was saved
export default function RateContractModal({ contract, isClient, onClose, onSubmitted }) {
  // The reviewee's role decides which three sub-ratings are asked.
  const role = isClient ? 'freelancer' : 'customer';
  const criteria = CRITERIA[role];
  const partner = isClient ? contract.freelancer : contract.client;
  const partnerName =
    [partner?.first_name, partner?.last_name].filter(Boolean).join(' ') || partner?.email || (isClient ? 'the freelancer' : 'the client');

  const [rating, setRating] = useState(0);
  const [subs, setSubs] = useState({});
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && !submitting) onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, submitting]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!rating) return setError('Choose an overall star rating.');
    const missing = criteria.find((c) => !subs[c.key]);
    if (missing) return setError(`Rate ${missing.label.toLowerCase()} too.`);

    setSubmitting(true);
    try {
      await createReview({
        contract_id: contract.contract_id,
        rating,
        ...subs,
        comment: comment.trim() || undefined,
      });
      onSubmitted();
    } catch (err) {
      setError(err.message || 'Could not submit your rating. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rate-title"
        className="my-8 w-full max-w-lg rounded-lg border border-border bg-panel p-6 shadow-2xl"
      >
        <h2 id="rate-title" className="font-display text-xl font-semibold tracking-tight">
          Rate {partnerName}
        </h2>
        <p className="mt-1 text-[13px] text-text-secondary">
          {contract.jobs?.title ? `For “${contract.jobs.title}”. ` : ''}
          {isClient ? 'Rate how they worked.' : 'Rate how they were to work with.'}
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          <div>
            <p className="mb-1.5 text-[13px] font-medium text-text-secondary">Overall</p>
            <StarInput value={rating} onChange={setRating} label="Overall rating" />
          </div>

          <div className="space-y-3.5 border-t border-border pt-5">
            {criteria.map((c) => (
              <div key={c.key} className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{c.label}</p>
                  <p className="text-[12px] text-text-secondary">{c.hint}</p>
                </div>
                <StarInput
                  value={subs[c.key] || 0}
                  onChange={(v) => setSubs((s) => ({ ...s, [c.key]: v }))}
                  label={c.label}
                  className="h-5 w-5"
                />
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-5">
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="review-comment" className="text-[13px] font-medium text-text-secondary">
                Written review <span className="font-normal">(optional)</span>
              </label>
              <span className={`text-[12px] ${comment.length > COMMENT_MAX ? 'text-error' : 'text-text-secondary'}`}>
                {comment.length}/{COMMENT_MAX}
              </span>
            </div>
            <textarea
              id="review-comment"
              rows={4}
              maxLength={COMMENT_MAX}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                isClient
                  ? 'What was it like working with them? Others will see this on their profile.'
                  : 'What was it like working for them? Others will see this on their profile.'
              }
              className="w-full resize-none rounded-md border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent"
            />
          </div>

          <p className="rounded-md bg-surface px-3 py-2 text-[12px] text-text-secondary">
            Your rating and review will be public, and can't be edited after you submit.
          </p>

          {error && (
            <p role="alert" className="text-[13px] text-error">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-md border border-border px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:text-text disabled:opacity-50 cursor-pointer"
            >
              Not now
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-[#1A1305] transition-colors hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? 'Submitting...' : 'Submit rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
