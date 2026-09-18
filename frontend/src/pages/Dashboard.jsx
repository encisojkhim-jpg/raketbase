// Dashboard.jsx — Contracts, Escrow & Proposals Tracker (Member 4 — Part 3)
// Features:
// 1. Shared Navbar with navigable logo and user profile dropdown
// 2. Metrics summary cards (Active Contracts, Escrow / Earnings, Completed, Proposals)
// 3. Contracts & Escrow management:
//    - View active, submitted, and completed contracts with partner info
//    - Freelancer: "Submit Work" deliverable action (transitions 'active' -> 'submitted')
//    - Client: "Approve & Release Funds" escrow release action (transitions 'submitted'/'active' -> 'completed')
// 4. Proposals tracking table with status badges
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  getMyProposals,
  getContracts,
  submitContractWork,
  completeContract,
} from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actioningId, setActioningId] = useState(null);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  })();

  const loadData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const [propRes, contractRes] = await Promise.allSettled([
        getMyProposals(),
        getContracts(),
      ]);

      if (propRes.status === 'fulfilled') {
        const pData = propRes.value;
        setProposals(Array.isArray(pData) ? pData : pData.data || []);
      } else {
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
  }, [navigate]);

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
    } catch (err) {
      setActionError(err.message || 'Failed to release escrow funds. Please try again.');
    } finally {
      setActioningId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-bg text-text items-center justify-center">
        <p className="text-text-secondary animate-pulse">Loading your dashboard & escrow balances...</p>
      </div>
    );
  }

  // Summary metrics calculation
  const activeContracts = contracts.filter((c) => c.status === 'active' || c.status === 'submitted');
  const completedContracts = contracts.filter((c) => c.status === 'completed');
  const totalAgreedEscrow = contracts.reduce((sum, c) => sum + Number(c.agreed_amount || 0), 0);
  const pendingProposalsCount = proposals.filter((p) => p.status === 'pending').length;

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
                {user.active_role === 'customer' ? 'Total Escrow Funded' : 'Total Contract Value'}
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
            <div className="bg-panel p-6 rounded-lg border border-border">
              <h3 className="text-text-secondary text-[13px] font-medium mb-1">Pending Proposals</h3>
              <p className="text-3xl font-display font-medium text-text">{pendingProposalsCount}</p>
              <p className="text-[11px] text-text-secondary mt-1">Awaiting client review</p>
            </div>
          </div>

          {/* Section 1: Active Contracts & Escrow (Part 3 Core) */}
          <div className="bg-panel border border-border rounded-lg mb-10 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface/50">
              <div className="flex items-center gap-2">
                <span className="text-accent text-base">🛡️</span>
                <h2 className="font-display text-lg font-medium">Contracts & Escrow</h2>
              </div>
              <span className="text-xs text-text-secondary hidden sm:inline">
                Funds held safely in escrow until client approval
              </span>
            </div>

            {contracts.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center mx-auto mb-3 text-xl">
                  📄
                </div>
                <p className="font-display text-base font-medium mb-1">No contracts yet</p>
                <p className="text-text-secondary text-sm max-w-md mx-auto mb-4">
                  When a client accepts a proposal, an escrow-backed contract is automatically generated here.
                </p>
                {user.active_role === 'customer' ? (
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
                    {contracts.map((c) => {
                      const isClient = user.id === c.client_id;
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
                            <div className="text-text font-medium">{partnerName}</div>
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

                            {/* Client Action: Approve Deliverables & Release Funds */}
                            {isClient && (c.status === 'submitted' || c.status === 'active') && (
                              <button
                                onClick={() => handleApproveAndRelease(c)}
                                disabled={actioningId === c.contract_id}
                                className="px-3 py-1.5 bg-emerald-500 text-black rounded-md text-xs font-semibold hover:bg-emerald-400 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                              >
                                {actioningId === c.contract_id ? 'Releasing...' : 'Approve & Release Funds'}
                              </button>
                            )}

                            {/* Completed Badge */}
                            {c.status === 'completed' && (
                              <span className="text-xs text-emerald-400 font-medium">
                                Funds Released ✓
                              </span>
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

          {/* Section 2: Proposals Tracking */}
          <div className="bg-panel border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface/50">
              <h2 className="font-display text-lg font-medium">My Submitted Proposals</h2>
              <Link to="/explore" className="text-sm text-accent hover:underline cursor-pointer">
                Find more jobs
              </Link>
            </div>

            {proposals.length === 0 ? (
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
                    {proposals.map((p) => (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
