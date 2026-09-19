// Dashboard.jsx — Contracts, Escrow & Proposals Tracker (Member 4 — Part 3)
// Features:
// 1. Shared Navbar with navigable logo and user profile dropdown
// 2. Mode-specific metrics summary cards (Active Contracts, Escrow / Earnings, Completed, Proposals)
// 3. Contracts & Escrow management, scoped to the current mode:
//    - Client mode: only contracts where you're the client
//      - "Approve & Release Funds" escrow release action (transitions 'submitted' -> 'completed')
//    - Freelancer mode: only contracts where you're the freelancer
//      - "Submit Work" deliverable action (transitions 'active' -> 'submitted')
// 4. Client mode: pending-proposal summary linking to My Postings for full review.
//    Freelancer mode: your own submitted proposals ("active bids") tracking table.
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  getMyProposals,
  getMyJobs,
  getContracts,
  submitContractWork,
  completeContract,
} from '../services/api';
import { useCurrentUser } from '../utils/currentUser';
import RateContractModal from '../components/RateContractModal';

export default function Dashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actioningId, setActioningId] = useState(null);
  // Contract currently being rated in the rating modal (null = closed).
  const [ratingContract, setRatingContract] = useState(null);

  const user = useCurrentUser();
  // 'customer' active_role is Client mode; anything else is Freelancer mode.
  const isClientMode = (user.active_role || 'customer') === 'customer';

  const loadData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      // Client mode needs job postings (for the pending-review count); Freelancer
      // mode needs the proposals you've submitted ("active bids"). Contracts are
      // fetched either way and then filtered per-mode below.
      const [modeRes, contractRes] = await Promise.allSettled([
        isClientMode ? getMyJobs() : getMyProposals(),
        getContracts(),
      ]);

      if (modeRes.status === 'fulfilled') {
        const mData = modeRes.value;
        const list = Array.isArray(mData) ? mData : mData.data || [];
        if (isClientMode) {
          setMyJobs(list);
          setProposals([]);
        } else {
          setProposals(list);
          setMyJobs([]);
        }
      } else {
        setMyJobs([]);
        setProposals([]);
      }

      if (contractRes.status === 'fulfilled') {
        const cData = contractRes.value;
        setContracts(Array.isArray(cData) ? cData : cData.data || []);
      } else {
        setContracts([]);
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, isClientMode]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Freelancer submits project deliverables
  async function handleSubmitWork(contractId) {
    setActionError('');
    setActionSuccess('');
    setActioningId(contractId);
    try {
      await submitContractWork(contractId);
      setActionSuccess('Work submitted for review! The client has been notified to release escrow funds.');
      await loadData();
    } catch (err) {
      setActionError(err.message || 'Failed to submit work. Please try again.');
    } finally {
      setActioningId(null);
    }
  }

  // Client approves project and releases escrow funds to the freelancer
  async function handleApproveAndRelease(contract) {
    const amount = Number(contract.agreed_amount || 0).toLocaleString();
    if (!window.confirm(`Approve deliverables and release ₱${amount} in escrow funds to the freelancer? This action completes the contract.`)) {
      return;
    }

    setActionError('');
    setActionSuccess('');
    setActioningId(contract.contract_id);
    try {
      await completeContract(contract.contract_id);
      setActionSuccess(`Escrow payment of ₱${amount} released successfully! Contract marked as completed.`);
      await loadData();
      // Work is done: invite the client to rate the freelancer right away (dismissable).
      setRatingContract(contract);
    } catch (err) {
      setActionError(err.message || 'Failed to release escrow funds. Please try again.');
    } finally {
      setActioningId(null);
    }
  }

  function handleRatingSubmitted() {
    setRatingContract(null);
    setActionError('');
    setActionSuccess('Thanks! Your rating has been submitted and is now public on their profile.');
    loadData();
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-bg text-text items-center justify-center">
        <p className="text-text-secondary animate-pulse">Loading your dashboard & escrow balances...</p>
      </div>
    );
  }

  // Scope contracts to the current mode: Client mode only sees contracts where
  // you're the client, Freelancer mode only sees ones where you're the freelancer.
  const modeContracts = contracts.filter((c) =>
    isClientMode ? c.client_id === user.user_id : c.freelancer_id === user.user_id
  );

  // Summary metrics calculation (mode-scoped)
  const activeContracts = modeContracts.filter((c) => c.status === 'active' || c.status === 'submitted');
  const completedContracts = modeContracts.filter((c) => c.status === 'completed');
  const totalAgreedEscrow = modeContracts.reduce((sum, c) => sum + Number(c.agreed_amount || 0), 0);

  // Client mode: proposals awaiting review across all your job postings.
  // Freelancer mode: your own bids still awaiting a decision.
  const pendingProposalsCount = isClientMode
    ? myJobs.reduce((sum, j) => sum + Number(j.pending_count || 0), 0)
    : proposals.filter((p) => p.status === 'pending').length;

  return (
    <div className="min-h-screen bg-bg text-text">
      <Navbar />

      <div className="p-8">
        <div className="max-w-5xl mx-auto">
          {/* Top header with navigation actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-border pb-6">
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight">Dashboard</h1>
              <p className="text-text-secondary text-sm mt-1">
                Manage your active contracts, escrow funds, and job applications.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {user.active_role === 'customer' && (
                <>
                  <Link
                    to="/my-jobs"
                    className="px-4 py-2 border border-border text-text rounded-md text-sm font-medium hover:border-accent/40 transition-colors cursor-pointer"
                  >
                    My Postings
                  </Link>
                  <Link
                    to="/jobs/create"
                    className="px-4 py-2 bg-accent text-[#1A1305] rounded-md text-sm font-semibold hover:bg-accent-hover transition-colors cursor-pointer"
                  >
                    + Post a Job
                  </Link>
                </>
              )}
              <Link
                to="/explore"
                className="px-4 py-2 border border-border text-text rounded-md text-sm font-medium hover:border-accent/40 transition-colors cursor-pointer"
              >
                Explore Jobs
              </Link>
            </div>
          </div>

          {/* Feedback Toasts */}
          {actionSuccess && (
            <div className="mb-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold">✓</span>
                <span>{actionSuccess}</span>
              </div>
              <button
                onClick={() => setActionSuccess('')}
                className="text-text-secondary hover:text-text text-sm cursor-pointer ml-4"
              >
                ✕
              </button>
            </div>
          )}

          {actionError && (
            <div className="mb-6 p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold">!</span>
                <span>{actionError}</span>
              </div>
              <button
                onClick={() => setActionError('')}
                className="text-text-secondary hover:text-text text-sm cursor-pointer ml-4"
              >
                ✕
              </button>
            </div>
          )}

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            <div className="bg-panel p-6 rounded-lg border border-border">
              <h3 className="text-text-secondary text-[13px] font-medium mb-1">Active Contracts</h3>
              <p className="text-3xl font-display font-medium text-accent">{activeContracts.length}</p>
              <p className="text-[11px] text-text-secondary mt-1">In progress or submitted</p>
            </div>
            <div className="bg-panel p-6 rounded-lg border border-border">
              <h3 className="text-text-secondary text-[13px] font-medium mb-1">
                {isClientMode ? 'Total Escrow Funded' : 'Total Contract Value'}
              </h3>
              <p className="text-3xl font-display font-medium text-accent">
                ₱{totalAgreedEscrow.toLocaleString()}
              </p>
              <p className="text-[11px] text-text-secondary mt-1">Secured via Supabase</p>
            </div>
            <div className="bg-panel p-6 rounded-lg border border-border">
              <h3 className="text-text-secondary text-[13px] font-medium mb-1">Completed Contracts</h3>
              <p className="text-3xl font-display font-medium text-emerald-400">{completedContracts.length}</p>
              <p className="text-[11px] text-text-secondary mt-1">Funds released</p>
            </div>
            {isClientMode ? (
              <Link
                to="/my-jobs"
                className="bg-panel p-6 rounded-lg border border-border hover:border-accent/40 transition-colors cursor-pointer"
              >
                <h3 className="text-text-secondary text-[13px] font-medium mb-1">Proposals to Review</h3>
                <p className="text-3xl font-display font-medium text-text">{pendingProposalsCount}</p>
                <p className="text-[11px] text-accent mt-1">Across your job postings &rarr;</p>
              </Link>
            ) : (
              <div className="bg-panel p-6 rounded-lg border border-border">
                <h3 className="text-text-secondary text-[13px] font-medium mb-1">Pending Proposals</h3>
                <p className="text-3xl font-display font-medium text-text">{pendingProposalsCount}</p>
                <p className="text-[11px] text-text-secondary mt-1">Awaiting client review</p>
              </div>
            )}
          </div>

          {/* Section 1: Active Contracts & Escrow (Part 3 Core), scoped to the current mode */}
          <div className="bg-panel border border-border rounded-lg mb-10 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface/50">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-medium">
                  {isClientMode ? 'Contracts & Escrow (as Client)' : 'Contracts & Escrow (as Freelancer)'}
                </h2>
              </div>
              <span className="text-xs text-text-secondary hidden sm:inline">
                Funds held safely in escrow until client approval
              </span>
            </div>

            {modeContracts.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center mx-auto mb-3 text-xl">
                  📄
                </div>
                <p className="font-display text-base font-medium mb-1">No contracts yet</p>
                <p className="text-text-secondary text-sm max-w-md mx-auto mb-4">
                  When a client accepts a proposal, an escrow-backed contract is automatically generated here.
                </p>
                {isClientMode ? (
                  <Link
                    to="/my-jobs"
                    className="inline-block px-4 py-2 bg-accent text-[#1A1305] rounded-md text-sm font-semibold hover:bg-accent-hover transition-colors cursor-pointer"
                  >
                    View Your Postings
                  </Link>
                ) : (
                  <Link
                    to="/explore"
                    className="inline-block px-4 py-2 bg-accent text-[#1A1305] rounded-md text-sm font-semibold hover:bg-accent-hover transition-colors cursor-pointer"
                  >
                    Browse Open Jobs
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-text-secondary text-[12px] uppercase tracking-wider border-b border-border bg-surface/30">
                      <th className="text-left px-6 py-3 font-medium">Job Title</th>
                      <th className="text-left px-6 py-3 font-medium">Counterparty</th>
                      <th className="text-left px-6 py-3 font-medium">Escrow Amount</th>
                      <th className="text-left px-6 py-3 font-medium">Status</th>
                      <th className="text-right px-6 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {modeContracts.map((c) => {
                      const isClient = user.user_id === c.client_id;
                      const partner = isClient ? c.freelancer : c.client;
                      const partnerRole = isClient ? 'Freelancer' : 'Client';
                      const partnerName = partner
                        ? `${partner.first_name || ''} ${partner.last_name || ''}`.trim() || partner.email
                        : 'Participant';

                      return (
                        <tr key={c.contract_id} className="hover:bg-surface/20 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-medium text-text">{c.jobs?.title || 'Job Posting'}</div>
                            <div className="text-xs text-text-secondary mt-0.5">
                              Created {new Date(c.created_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {partner?.user_id ? (
                              <Link
                                to={`/users/${partner.user_id}?role=${isClient ? 'freelancer' : 'customer'}`}
                                className="text-text font-medium hover:text-accent hover:underline cursor-pointer"
                              >
                                {partnerName}
                              </Link>
                            ) : (
                              <div className="text-text font-medium">{partnerName}</div>
                            )}
                            <div className="text-xs text-text-secondary">{partnerRole}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-accent flex items-center gap-1.5">
                              <span>₱{Number(c.agreed_amount || 0).toLocaleString()}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent border border-accent/20">
                                Escrow
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium border ${
                                c.status === 'completed'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                  : c.status === 'submitted'
                                  ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                                  : c.status === 'active'
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                  : 'bg-surface text-text-secondary border-border'
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />
                              {c.status === 'active'
                                ? 'In Progress'
                                : c.status === 'submitted'
                                ? 'Work Submitted'
                                : c.status === 'completed'
                                ? 'Completed'
                                : c.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {/* Freelancer Action: Submit Work */}
                            {!isClient && c.status === 'active' && (
                              <button
                                onClick={() => handleSubmitWork(c.contract_id)}
                                disabled={actioningId === c.contract_id}
                                className="px-3 py-1.5 bg-accent text-[#1A1305] rounded-md text-xs font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50 cursor-pointer"
                              >
                                {actioningId === c.contract_id ? 'Submitting...' : 'Submit Work'}
                              </button>
                            )}

                            {/* Client Action: Approve Deliverables & Release Funds (strictly from submitted status) */}
                            {isClient && c.status === 'submitted' && (
                              <button
                                onClick={() => handleApproveAndRelease(c)}
                                disabled={actioningId === c.contract_id}
                                className="px-3 py-1.5 bg-emerald-500 text-black rounded-md text-xs font-semibold hover:bg-emerald-400 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                              >
                                {actioningId === c.contract_id ? 'Releasing...' : 'Approve & Release Funds'}
                              </button>
                            )}

                            {/* Client awaiting freelancer deliverables */}
                            {isClient && c.status === 'active' && (
                              <span className="text-xs text-text-secondary">
                                Work in Progress
                              </span>
                            )}

                            {/* Completed Badge */}
                            {c.status === 'completed' && (
                              <span className="text-xs text-emerald-400 font-medium">
                                Funds Released ✓
                              </span>
                            )}

                            {/* Rating: one per side. Button until you've rated, then your score. */}
                            {c.status === 'completed' && (() => {
                              const myReview = (c.reviews || []).find((r) => r.reviewer_id === user.user_id);
                              return myReview ? (
                                <span className="ml-2 inline-block text-xs font-medium text-accent">
                                  You rated {myReview.rating}★
                                </span>
                              ) : (
                                <button
                                  onClick={() => setRatingContract(c)}
                                  className="ml-2 inline-block px-3 py-1.5 border border-accent/40 text-accent rounded-md text-xs font-semibold hover:bg-accent/10 transition-colors cursor-pointer"
                                >
                                  {isClient ? 'Rate Freelancer' : 'Rate Client'}
                                </button>
                              );
                            })()}

                            {/* Either participant can escalate an in-flight contract */}
                            {(c.status === 'active' || c.status === 'submitted') && (
                              <Link
                                to={`/contracts/${c.contract_id}/dispute`}
                                className="ml-2 inline-block px-3 py-1.5 border border-rose-500/30 text-rose-400 rounded-md text-xs font-medium hover:bg-rose-500/10 transition-colors cursor-pointer"
                              >
                                File Dispute
                              </Link>
                            )}

                            {/* Freelancer awaiting client approval */}
                            {!isClient && c.status === 'submitted' && (
                              <span className="text-xs text-sky-400 font-medium">
                                Awaiting Client Review
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section 2: mode-specific proposals view */}
          {isClientMode ? (
            /* Client mode: a summary + link, not the full review UI (that lives on My Postings) */
            <div className="bg-panel border border-border rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface/50">
                <h2 className="font-display text-lg font-medium">Proposals Waiting for Review</h2>
              </div>
              <div className="px-6 py-10 text-center">
                <p className="text-3xl font-display font-medium text-accent mb-1">{pendingProposalsCount}</p>
                <p className="text-text-secondary text-sm mb-4">
                  {pendingProposalsCount === 0
                    ? 'No pending proposals across your job postings right now.'
                    : `Pending proposal${pendingProposalsCount === 1 ? '' : 's'} across your job postings.`}
                </p>
                <Link
                  to="/my-jobs"
                  className="inline-block px-4 py-2 bg-accent text-[#1A1305] rounded-md text-sm font-semibold hover:bg-accent-hover transition-colors cursor-pointer"
                >
                  Review Proposals
                </Link>
              </div>
            </div>
          ) : (
            /* Freelancer mode: the bids you've submitted */
            <div className="bg-panel border border-border rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface/50">
                <h2 className="font-display text-lg font-medium">My Active Bids</h2>
                <div className="flex items-center gap-4">
                  <Link to="/my-proposals" className="text-sm text-accent hover:underline cursor-pointer">
                    Manage proposals
                  </Link>
                  <Link to="/explore" className="text-sm text-accent hover:underline cursor-pointer">
                    Find more jobs
                  </Link>
                </div>
              </div>

              {(() => {
                // Withdrawn proposals are managed on /my-proposals, not shown here.
                const activeBids = proposals.filter((p) => p.status !== 'withdrawn');
                return activeBids.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="font-display text-base font-medium mb-1">No proposals yet</p>
                  <p className="text-text-secondary text-sm mb-4">
                    Browse open jobs and submit your first proposal.
                  </p>
                  <Link
                    to="/explore"
                    className="inline-block px-4 py-2 bg-accent text-[#1A1305] rounded-md text-sm font-semibold hover:bg-accent-hover transition-colors cursor-pointer"
                  >
                    Browse jobs
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-text-secondary text-[12px] uppercase tracking-wider border-b border-border bg-surface/30">
                        <th className="text-left px-6 py-3 font-medium">Job</th>
                        <th className="text-left px-6 py-3 font-medium">Bid Amount</th>
                        <th className="text-left px-6 py-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {activeBids.map((p) => (
                        <tr key={p.proposal_id} className="hover:bg-surface/20 transition-colors">
                          <td className="px-6 py-4 font-medium text-text">{p.jobs?.title || 'Job Posting'}</td>
                          <td className="px-6 py-4 font-sans font-medium text-accent">
                            ₱{Number(p.bid_amount || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium border ${
                                p.status === 'accepted'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                  : p.status === 'rejected'
                                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                  : 'bg-surface text-text-secondary border-border'
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />
                              {p.status ?? 'pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
              })()}
            </div>
          )}
        </div>
      </div>

      {ratingContract && (
        <RateContractModal
          contract={ratingContract}
          isClient={ratingContract.client_id === user.user_id}
          onClose={() => setRatingContract(null)}
          onSubmitted={handleRatingSubmitted}
        />
      )}
    </div>
  );
}
