// AdminDashboard.jsx — Platform Management & Disputes (Member 5 — Part 4)
// Features:
// 1. Metric summary cards (Total Users, Active Contracts, Platform Revenue, Open Disputes)
// 2. Dispute resolution panel — inspect evidence, resolve (Refund / Release / Split)
// 3. User management table — toggle Active / Suspended
//
// NOTE: Falls back to local mock data if the backend/DB isn't reachable yet
// (e.g. before the `users.status` migration is run, or before Supabase access
// is available). Swap MOCK_* below or remove the catch-fallback once the
// backend is confirmed working end-to-end.
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  getAdminAnalytics,
  getAdminUsers,
  updateUserStatus,
  listDisputes,
  resolveDispute,
} from '../services/api';

const MOCK_ANALYTICS = {
  total_users: 24,
  active_contracts: 6,
  platform_revenue: 128500,
  open_disputes: 2,
};

const MOCK_USERS = [
  { user_id: 'mock-1', email: 'juan.delacruz@example.com', first_name: 'Juan', last_name: 'Dela Cruz', role: 'customer', active_role: 'customer', status: 'active' },
  { user_id: 'mock-2', email: 'maria.santos@example.com', first_name: 'Maria', last_name: 'Santos', role: 'customer', active_role: 'freelancer', status: 'active' },
  { user_id: 'mock-3', email: 'pedro.reyes@example.com', first_name: 'Pedro', last_name: 'Reyes', role: 'customer', active_role: 'freelancer', status: 'suspended' },
];

const MOCK_DISPUTES = [
  {
    dispute_id: 'mock-d1',
    status: 'open',
    reason: '[Incomplete Work] Freelancer delivered only half of the agreed scope and stopped responding after the deadline passed.',
    created_at: new Date().toISOString(),
    contracts: { agreed_amount: 15000, jobs: { title: 'Logo & Brand Kit Design' } },
  },
  {
    dispute_id: 'mock-d2',
    status: 'under_review',
    reason: '[Non-Payment] Work was submitted and approved but escrow funds were never released.',
    created_at: new Date().toISOString(),
    contracts: { agreed_amount: 8000, jobs: { title: 'Landing Page Development' } },
  },
];

const STATUS_STYLES = {
  open: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  under_review: 'bg-accent/10 text-accent border-accent/30',
  resolved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
};

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [disputes, setDisputes] = useState([]);
  const [users, setUsers] = useState([]);

  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actioningId, setActioningId] = useState(null);
  const [resolvingDispute, setResolvingDispute] = useState(null); // dispute object mid-resolution
  const [resolutionNotes, setResolutionNotes] = useState('');

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
      const [analyticsRes, disputesRes, usersRes] = await Promise.all([
        getAdminAnalytics(),
        listDisputes(),
        getAdminUsers(),
      ]);

      setAnalytics(analyticsRes.data);
      setDisputes(disputesRes.data || []);
      setUsers(usersRes.data || []);
      setUsingMockData(false);
    } catch (err) {
      // Backend/DB not reachable yet (migration not run, no DB access, etc.)
      // Fall back to mock data so the UI is still reviewable.
      console.warn('Admin data fetch failed, showing mock data:', err.message);
      setAnalytics(MOCK_ANALYTICS);
      setDisputes(MOCK_DISPUTES);
      setUsers(MOCK_USERS);
      setUsingMockData(true);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleResolve(resolution) {
    if (!resolvingDispute) return;
    setActionError('');
    setActionSuccess('');
    setActioningId(resolvingDispute.dispute_id);

    if (usingMockData) {
      // Simulate locally since there's no live backend to hit yet.
      setDisputes((prev) =>
        prev.map((d) =>
          d.dispute_id === resolvingDispute.dispute_id ? { ...d, status: 'resolved' } : d
        )
      );
      setActionSuccess('(Mock) Dispute marked as resolved.');
      setResolvingDispute(null);
      setResolutionNotes('');
      setActioningId(null);
      return;
    }

    try {
      await resolveDispute(resolvingDispute.dispute_id, { resolution, notes: resolutionNotes });
      setActionSuccess('Dispute resolved successfully.');
      setResolvingDispute(null);
      setResolutionNotes('');
      await loadData();
    } catch (err) {
      setActionError(err.message || 'Failed to resolve dispute.');
    } finally {
      setActioningId(null);
    }
  }

  async function handleToggleUserStatus(targetUser) {
    const nextStatus = targetUser.status === 'suspended' ? 'active' : 'suspended';
    setActionError('');
    setActionSuccess('');
    setActioningId(targetUser.user_id);

    if (usingMockData) {
      setUsers((prev) =>
        prev.map((u) => (u.user_id === targetUser.user_id ? { ...u, status: nextStatus } : u))
      );
      setActionSuccess(`(Mock) User marked as ${nextStatus}.`);
      setActioningId(null);
      return;
    }

    try {
      await updateUserStatus(targetUser.user_id, nextStatus);
      setActionSuccess(`User ${targetUser.email} is now ${nextStatus}.`);
      await loadData();
    } catch (err) {
      setActionError(err.message || 'Failed to update user status.');
    } finally {
      setActioningId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-bg text-text items-center justify-center">
        <p className="text-text-secondary animate-pulse">Loading platform metrics...</p>
      </div>
    );
  }

  const openDisputes = disputes.filter((d) => d.status !== 'resolved');
  const resolvedDisputes = disputes.filter((d) => d.status === 'resolved');

  return (
    <div className="min-h-screen bg-bg text-text">
      <Navbar />

      <div className="p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-border pb-6">
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight">Admin Dashboard</h1>
              <p className="text-text-secondary text-sm mt-1">
                Platform metrics, dispute resolution, and user management.
              </p>
            </div>
            <span className="inline-block rounded bg-surface border border-border px-3 py-1.5 text-[11px] font-medium text-accent uppercase tracking-wider">
              {user.role || 'Admin'} access
            </span>
          </div>

          {/* Mock data banner */}
          {usingMockData && (
            <div className="mb-6 p-4 rounded-lg bg-accent/10 border border-accent/30 text-accent text-sm">
              Showing sample data — the backend or database isn't reachable yet. Actions here are
              simulated locally and won't persist.
            </div>
          )}

          {/* Feedback toasts */}
          {actionSuccess && (
            <div className="mb-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold">✓</span>
                <span>{actionSuccess}</span>
              </div>
              <button onClick={() => setActionSuccess('')} className="text-text-secondary hover:text-text text-sm cursor-pointer ml-4">
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
              <button onClick={() => setActionError('')} className="text-text-secondary hover:text-text text-sm cursor-pointer ml-4">
                ✕
              </button>
            </div>
          )}

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            <div className="bg-panel p-6 rounded-lg border border-border">
              <h3 className="text-text-secondary text-[13px] font-medium mb-1">Total Users</h3>
              <p className="text-3xl font-display font-medium text-text">{analytics.total_users}</p>
              <p className="text-[11px] text-text-secondary mt-1">Registered accounts</p>
            </div>
            <div className="bg-panel p-6 rounded-lg border border-border">
              <h3 className="text-text-secondary text-[13px] font-medium mb-1">Active Contracts</h3>
              <p className="text-3xl font-display font-medium text-accent">{analytics.active_contracts}</p>
              <p className="text-[11px] text-text-secondary mt-1">In progress or submitted</p>
            </div>
            <div className="bg-panel p-6 rounded-lg border border-border">
              <h3 className="text-text-secondary text-[13px] font-medium mb-1">Platform Revenue</h3>
              <p className="text-3xl font-display font-medium text-emerald-400">
                ₱{Number(analytics.platform_revenue).toLocaleString()}
              </p>
              <p className="text-[11px] text-text-secondary mt-1">From completed contracts</p>
            </div>
            <div className="bg-panel p-6 rounded-lg border border-border">
              <h3 className="text-text-secondary text-[13px] font-medium mb-1">Open Disputes</h3>
              <p className="text-3xl font-display font-medium text-rose-400">{analytics.open_disputes}</p>
              <p className="text-[11px] text-text-secondary mt-1">Needing review</p>
            </div>
          </div>

          {/* Disputes Panel */}
          <div className="bg-panel border border-border rounded-lg mb-10 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface/50">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-medium">Dispute Resolution</h2>
              </div>
              <span className="text-xs text-text-secondary hidden sm:inline">
                {openDisputes.length} open · {resolvedDisputes.length} resolved
              </span>
            </div>

            {disputes.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="font-display text-base font-medium mb-1">No disputes filed</p>
                <p className="text-text-secondary text-sm">All contracts are running smoothly.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {disputes.map((d) => (
                  <div key={d.dispute_id} className="px-6 py-5">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <p className="font-display text-sm font-medium">
                          {d.contracts?.jobs?.title || 'Contract dispute'}
                        </p>
                        <p className="text-[11px] text-text-secondary mt-0.5">
                          ₱{Number(d.contracts?.agreed_amount || 0).toLocaleString()} in escrow ·{' '}
                          {new Date(d.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded border px-2 py-1 text-[11px] font-medium uppercase tracking-wide ${
                          STATUS_STYLES[d.status] || STATUS_STYLES.open
                        }`}
                      >
                        {d.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-text-secondary text-sm mb-3">{d.reason}</p>
                    {d.resolution_notes && (
                      <p className="text-emerald-400 text-xs mb-3">Resolution: {d.resolution_notes}</p>
                    )}
                    {d.status !== 'resolved' && (
                      <button
                        onClick={() => setResolvingDispute(d)}
                        className="px-3.5 py-1.5 bg-accent text-[#1A1305] rounded-md text-xs font-semibold hover:bg-accent-hover transition-colors cursor-pointer"
                      >
                        Review & Resolve
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Management Table */}
          <div className="bg-panel border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface/50">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-medium">User Management</h2>
              </div>
              <span className="text-xs text-text-secondary hidden sm:inline">{users.length} accounts</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-text-secondary text-[11px] uppercase tracking-wide border-b border-border">
                    <th className="px-6 py-3 font-medium">Name</th>
                    <th className="px-6 py-3 font-medium">Email</th>
                    <th className="px-6 py-3 font-medium">Role</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((u) => (
                    <tr key={u.user_id}>
                      <td className="px-6 py-3.5 font-medium">
                        {[u.first_name, u.last_name].filter(Boolean).join(' ') || '—'}
                      </td>
                      <td className="px-6 py-3.5 text-text-secondary">{u.email}</td>
                      <td className="px-6 py-3.5 text-text-secondary capitalize">
                        {u.role}
                        {u.role === 'customer' && u.active_role ? ` (${u.active_role})` : ''}
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`rounded border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide ${
                            u.status === 'suspended'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {u.status || 'active'}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleUserStatus(u)}
                            disabled={actioningId === u.user_id}
                            className="px-3 py-1.5 border border-border rounded-md text-xs font-medium hover:border-accent/40 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {u.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Resolve Dispute Modal */}
      {resolvingDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-panel border border-border rounded-lg p-6">
            <h3 className="font-display text-lg font-medium mb-1">Resolve Dispute</h3>
            <p className="text-text-secondary text-sm mb-4">
              {resolvingDispute.contracts?.jobs?.title} — ₱
              {Number(resolvingDispute.contracts?.agreed_amount || 0).toLocaleString()} in escrow
            </p>

            <label className="block text-[13px] font-medium text-text-secondary mb-1.5">
              Resolution notes (optional)
            </label>
            <textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              rows={3}
              className="w-full bg-surface border border-border text-text px-3 py-2.5 rounded-md text-sm outline-none focus:border-accent transition-colors mb-5"
              placeholder="Add context for the resolution log..."
            />

            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => handleResolve('release_freelancer')}
                disabled={actioningId === resolvingDispute.dispute_id}
                className="px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-md text-sm font-medium hover:bg-emerald-500/20 transition-colors cursor-pointer disabled:opacity-50"
              >
                Release to Freelancer
              </button>
              <button
                onClick={() => handleResolve('refund_client')}
                disabled={actioningId === resolvingDispute.dispute_id}
                className="px-4 py-2.5 bg-accent/10 border border-accent/30 text-accent rounded-md text-sm font-medium hover:bg-accent/20 transition-colors cursor-pointer disabled:opacity-50"
              >
                Refund Client
              </button>
              <button
                onClick={() => handleResolve('split')}
                disabled={actioningId === resolvingDispute.dispute_id}
                className="px-4 py-2.5 border border-border rounded-md text-sm font-medium hover:border-accent/40 transition-colors cursor-pointer disabled:opacity-50"
              >
                Split Funds
              </button>
            </div>

            <button
              onClick={() => { setResolvingDispute(null); setResolutionNotes(''); }}
              className="w-full mt-3 px-4 py-2 text-text-secondary text-sm hover:text-text transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
