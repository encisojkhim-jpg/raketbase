// Dashboard — Contracts, Escrow & Proposals Tracker
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TrendUpIcon, ShieldCheckIcon, ClockIcon } from '../components/Icons';
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
    try { return JSON.parse(localStorage.getItem('user') || '{}'); }
    catch { return {}; }
  })();

  const displayName = [user.first_name, user.last_name].filter(Boolean).join(' ') || 'there';

  const loadData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    try {
      const [propRes, contractRes] = await Promise.allSettled([getMyProposals(), getContracts()]);
      if (propRes.status === 'fulfilled') {
        const d = propRes.value;
        setProposals(Array.isArray(d) ? d : d.data || []);
      } else setProposals([]);
      if (contractRes.status === 'fulfilled') {
        const d = contractRes.value;
        setContracts(Array.isArray(d) ? d : d.data || []);
      } else setContracts([]);
    } finally { setLoading(false); }
  }, [navigate]);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleSubmitWork(contractId) {
    setActionError(''); setActionSuccess(''); setActioningId(contractId);
    try {
      await submitContractWork(contractId);
      setActionSuccess('Work submitted for review! The client has been notified to release escrow funds.');
      await loadData();
    } catch (err) { setActionError(err.message || 'Failed to submit work.'); }
    finally { setActioningId(null); }
  }

  async function handleApproveAndRelease(contract) {
    const amount = Number(contract.agreed_amount || 0).toLocaleString();
    if (!window.confirm(`Approve deliverables and release ₱${amount} in escrow funds to the freelancer? This action completes the contract.`)) return;
    setActionError(''); setActionSuccess(''); setActioningId(contract.contract_id);
    try {
      await completeContract(contract.contract_id);
      setActionSuccess(`Escrow payment of ₱${amount} released successfully! Contract marked as completed.`);
      await loadData();
    } catch (err) { setActionError(err.message || 'Failed to release escrow funds.'); }
    finally { setActioningId(null); }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 mx-auto mb-3 rounded-full border-2 border-accent border-t-transparent" style={{ animation: 'pulse-soft 1s linear infinite' }} />
          <p className="text-text-secondary text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const activeContracts = contracts.filter((c) => c.status === 'active' || c.status === 'submitted');
  const completedContracts = contracts.filter((c) => c.status === 'completed');
  const totalEscrow = contracts.reduce((sum, c) => sum + Number(c.agreed_amount || 0), 0);
  const pendingProposals = proposals.filter((p) => p.status === 'pending').length;

  return (
    <div className="p-5 sm:p-8 max-w-[1280px] mx-auto" style={{ animation: 'fade-in-up 0.4s ease-out' }}>
      {/* ── Welcome Banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a2818] via-[#0f3322] to-[#142e1c] border border-border/40 p-6 sm:p-8 mb-7">
        <div className="relative z-10">
          <span className="inline-block px-2.5 py-1 rounded-md bg-accent/15 text-accent text-[11px] font-bold uppercase tracking-wider mb-3">
            Dashboard
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text mb-1.5">
            Welcome back, {displayName} 👋
          </h1>
          <p className="text-text-secondary text-sm max-w-lg">
            Manage your active contracts, track escrow funds, and review job applications — all from one place.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {user.active_role === 'customer' && (
              <Link to="/jobs/create" className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-accent/15 hover:bg-accent-hover transition-all hover:-translate-y-0.5 cursor-pointer">
                + Post a Job
              </Link>
            )}
            <Link to="/explore" className="inline-flex items-center gap-2 rounded-lg border border-border/80 bg-surface/40 px-4 py-2.5 text-sm font-medium text-text hover:border-accent/40 transition-colors cursor-pointer">
              Explore Jobs
            </Link>
          </div>
        </div>
        {/* Decorative SVG */}
        <svg className="absolute -right-6 -bottom-6 h-36 w-36 opacity-10" viewBox="0 0 100 100" fill="none">
          <g transform="translate(50,50)">
            <rect x="-6" y="-45" width="12" height="90" rx="6" fill="#FF5A1E" />
            <rect x="-6" y="-45" width="12" height="90" rx="6" fill="#FF5A1E" transform="rotate(60)" />
            <rect x="-6" y="-45" width="12" height="90" rx="6" fill="#FF5A1E" transform="rotate(120)" />
          </g>
        </svg>
      </div>

      {/* ── Toast Messages ── */}
      {actionSuccess && (
        <div className="mb-6 flex items-center justify-between gap-3 rounded-xl bg-success/10 border border-success/25 px-5 py-3.5 text-sm text-success">
          <div className="flex items-center gap-2"><span className="font-bold">✓</span><span>{actionSuccess}</span></div>
          <button onClick={() => setActionSuccess('')} className="text-text-secondary hover:text-text cursor-pointer">✕</button>
        </div>
      )}
      {actionError && (
        <div className="mb-6 flex items-center justify-between gap-3 rounded-xl bg-error/10 border border-error/25 px-5 py-3.5 text-sm text-error">
          <div className="flex items-center gap-2"><span className="font-bold">!</span><span>{actionError}</span></div>
          <button onClick={() => setActionError('')} className="text-text-secondary hover:text-text cursor-pointer">✕</button>
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Active Contracts" value={activeContracts.length} sub="In progress or submitted" color="accent" />
        <StatCard label={user.active_role === 'customer' ? 'Total Escrow Funded' : 'Total Contract Value'} value={`₱${totalEscrow.toLocaleString()}`} sub="Secured via escrow" color="accent" />
        <StatCard label="Completed Contracts" value={completedContracts.length} sub="Funds released" color="success" />
        <StatCard label="Pending Proposals" value={pendingProposals} sub="Awaiting client review" color="warning" />
      </div>

      {/* ── Contracts & Escrow Table ── */}
      <div className="rounded-2xl border border-border/60 bg-panel/60 backdrop-blur-sm mb-8 overflow-hidden">
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border/40">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
              <ShieldCheckIcon className="h-4 w-4 text-accent" />
            </div>
            <h2 className="font-heading text-base font-bold text-text">Contracts & Escrow</h2>
          </div>
          <span className="hidden sm:inline text-[12px] text-text-secondary">Funds held safely until client approval</span>
        </div>

        {contracts.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface border border-border text-xl">📄</div>
            <p className="font-heading text-base font-bold mb-1">No contracts yet</p>
            <p className="text-text-secondary text-sm max-w-sm mx-auto mb-4">When a client accepts a proposal, an escrow-backed contract will appear here.</p>
            <Link to={user.active_role === 'customer' ? '/my-jobs' : '/explore'}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-white hover:bg-accent-hover transition-colors cursor-pointer">
              {user.active_role === 'customer' ? 'View Your Postings' : 'Browse Open Jobs'}
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-text-secondary text-[11px] uppercase tracking-wider border-b border-border/30 bg-surface/20">
                  <th className="text-left px-6 py-3 font-semibold">Job Title</th>
                  <th className="text-left px-6 py-3 font-semibold">Counterparty</th>
                  <th className="text-left px-6 py-3 font-semibold">Escrow Amount</th>
                  <th className="text-left px-6 py-3 font-semibold">Status</th>
                  <th className="text-right px-6 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/25">
                {contracts.map((c) => {
                  const isClient = user.user_id === c.client_id;
                  const partner = isClient ? c.freelancer : c.client;
                  const partnerRole = isClient ? 'Freelancer' : 'Client';
                  const partnerName = partner ? `${partner.first_name || ''} ${partner.last_name || ''}`.trim() || partner.email : 'Participant';

                  return (
                    <tr key={c.contract_id} className="hover:bg-surface/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-text">{c.jobs?.title || 'Job Posting'}</div>
                        <div className="text-[11px] text-text-secondary mt-0.5">Created {new Date(c.created_at).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-text">{partnerName}</div>
                        <div className="text-[11px] text-text-secondary">{partnerRole}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-accent">₱{Number(c.agreed_amount || 0).toLocaleString()}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-accent/10 text-accent border border-accent/15 font-semibold">Escrow</span>
                        </div>
                      </td>
                      <td className="px-6 py-4"><ContractStatusPill status={c.status} /></td>
                      <td className="px-6 py-4 text-right">
                        {!isClient && c.status === 'active' && (
                          <button onClick={() => handleSubmitWork(c.contract_id)} disabled={actioningId === c.contract_id}
                            className="px-3.5 py-1.5 bg-accent text-white rounded-lg text-xs font-bold hover:bg-accent-hover transition-colors disabled:opacity-50 cursor-pointer">
                            {actioningId === c.contract_id ? 'Submitting...' : 'Submit Work'}
                          </button>
                        )}
                        {isClient && c.status === 'submitted' && (
                          <button onClick={() => handleApproveAndRelease(c)} disabled={actioningId === c.contract_id}
                            className="px-3.5 py-1.5 bg-success text-white rounded-lg text-xs font-bold hover:bg-green-400 transition-colors disabled:opacity-50 cursor-pointer shadow-sm">
                            {actioningId === c.contract_id ? 'Releasing...' : 'Approve & Release'}
                          </button>
                        )}
                        {isClient && c.status === 'active' && <span className="text-xs text-text-secondary">Work in Progress</span>}
                        {c.status === 'completed' && <span className="text-xs text-success font-semibold">Funds Released ✓</span>}
                        {!isClient && c.status === 'submitted' && <span className="text-xs text-info font-semibold">Awaiting Review</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Proposals Table ── */}
      <div className="rounded-2xl border border-border/60 bg-panel/60 backdrop-blur-sm overflow-hidden">
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border/40">
          <h2 className="font-heading text-base font-bold text-text">My Submitted Proposals</h2>
          <Link to="/explore" className="text-sm font-semibold text-accent hover:text-accent-hover transition-colors cursor-pointer">Find more jobs →</Link>
        </div>

        {proposals.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="font-heading text-base font-bold mb-1">No proposals yet</p>
            <p className="text-text-secondary text-sm mb-4">Browse open jobs and submit your first proposal.</p>
            <Link to="/explore" className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-white hover:bg-accent-hover transition-colors cursor-pointer">Browse jobs</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-text-secondary text-[11px] uppercase tracking-wider border-b border-border/30 bg-surface/20">
                  <th className="text-left px-6 py-3 font-semibold">Job</th>
                  <th className="text-left px-6 py-3 font-semibold">Bid Amount</th>
                  <th className="text-left px-6 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/25">
                {proposals.map((p) => (
                  <tr key={p.proposal_id} className="hover:bg-surface/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-text">{p.jobs?.title || 'Job Posting'}</td>
                    <td className="px-6 py-4 font-bold text-accent">₱{Number(p.bid_amount || 0).toLocaleString()}</td>
                    <td className="px-6 py-4"><ProposalStatusPill status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color }) {
  const colorMap = {
    accent: { bg: 'bg-accent/8', text: 'text-accent', border: 'border-accent/15' },
    success: { bg: 'bg-success/8', text: 'text-success', border: 'border-success/15' },
    warning: { bg: 'bg-warning/8', text: 'text-warning', border: 'border-warning/15' },
    info: { bg: 'bg-info/8', text: 'text-info', border: 'border-info/15' },
  };
  const c = colorMap[color] || colorMap.accent;

  return (
    <div className={`rounded-2xl border ${c.border} ${c.bg} p-5 transition-all hover:shadow-lg hover:shadow-black/5`}>
      <p className="text-text-secondary text-[12px] font-semibold uppercase tracking-wider mb-2">{label}</p>
      <p className={`font-heading text-2xl sm:text-3xl font-bold ${c.text}`}>{value}</p>
      <p className="text-[11px] text-text-secondary mt-1.5">{sub}</p>
    </div>
  );
}

function ContractStatusPill({ status }) {
  const styles = {
    completed: 'bg-success/10 text-success border-success/25',
    submitted: 'bg-info/10 text-info border-info/25',
    active: 'bg-warning/10 text-warning border-warning/25',
  };
  const labels = { active: 'In Progress', submitted: 'Work Submitted', completed: 'Completed' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${styles[status] || 'bg-surface text-text-secondary border-border'}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {labels[status] || status}
    </span>
  );
}

function ProposalStatusPill({ status }) {
  const styles = {
    accepted: 'bg-success/10 text-success border-success/25',
    rejected: 'bg-error/10 text-error border-error/25',
    pending: 'bg-surface text-text-secondary border-border',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${styles[status] || styles.pending}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status ?? 'pending'}
    </span>
  );
}
