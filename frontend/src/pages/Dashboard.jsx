// Dashboard.jsx — Freelancer Dashboard & Proposals Tracker (Paula + Kyle)
// Features:
// 1. Shared Navbar with navigable logo and interactive user profile dropdown
// 2. Metrics summary cards (Active Rakets, Proposals Sent, Pending Review)
// 3. Live proposals fetching via getMyProposals() and fallback handling
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getMyProposals } from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();

  // Component state for loading status and proposals list
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState([]);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  })();

  // Auth check & live proposal fetch on mount
  useEffect(() => {
    // Verify that JWT session token exists in localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Attempt to load submitted proposals from API; gracefully fallback to empty state
    getMyProposals()
      .then((data) => {
        setProposals(Array.isArray(data) ? data : data.data || []);
      })
      .catch(() => {
        // Backend auth may be unlinked in testing; fall back safely
        setProposals([]);
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  // Display loading screen while validating session and loading data
  if (loading) {
    return (
      <div className="flex min-h-screen bg-bg text-text items-center justify-center">
        <p className="text-text-secondary">Loading your dashboard...</p>
      </div>
    );
  }

  // Calculate high-level summary metrics from proposals array
  const activeCount = proposals.filter((p) => p.status === 'accepted').length;
  const pendingCount = proposals.filter((p) => p.status === 'pending').length;

  return (
    <div className="min-h-screen bg-bg text-text">
      {/* Shared Navigable Navbar with profile dropdown */}
      <Navbar />

      <div className="p-8">
        <div className="max-w-5xl mx-auto">
          {/* Top header with navigation actions */}
          <div className="flex justify-between items-center mb-10 border-b border-border pb-6">
            <h1 className="font-display text-3xl font-semibold tracking-tight">Dashboard</h1>
            <div className="flex items-center gap-3">
              {user.active_role === 'customer' && (
                <Link
                  to="/jobs/create"
                  className="px-4 py-2 bg-accent text-[#1A1305] rounded-md text-sm font-semibold hover:bg-accent-hover transition-colors cursor-pointer"
                >
                  + Post a Job
                </Link>
              )}
              <Link
                to="/explore"
                className="px-4 py-2 border border-border text-text rounded-md text-sm font-medium hover:border-accent/40 transition-colors cursor-pointer"
              >
                Browse jobs
              </Link>
            </div>
          </div>

          {/* Metric summary cards: Active Rakets, Proposals Sent, Pending Review */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-panel p-6 rounded-lg border border-border">
              <h3 className="text-text-secondary text-[13px] font-medium mb-1">Active Rakets</h3>
              <p className="text-3xl font-display font-medium text-accent">{activeCount}</p>
            </div>
            <div className="bg-panel p-6 rounded-lg border border-border">
              <h3 className="text-text-secondary text-[13px] font-medium mb-1">Proposals Sent</h3>
              <p className="text-3xl font-display font-medium text-accent">{proposals.length}</p>
            </div>
            <div className="bg-panel p-6 rounded-lg border border-border">
              <h3 className="text-text-secondary text-[13px] font-medium mb-1">Pending Review</h3>
              <p className="text-3xl font-display font-medium text-accent">{pendingCount}</p>
            </div>
          </div>

          {/* Proposals tracking table and empty state */}
          <div className="bg-panel border border-border rounded-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-display text-lg font-medium">My Proposals</h2>
              <Link to="/explore" className="text-sm text-accent hover:underline cursor-pointer">
                Find more jobs
              </Link>
            </div>

            {/* Empty state when the freelancer has not applied to any jobs yet */}
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
              /* Proposals list table with job title, bid amount, and status pill */
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-text-secondary text-[13px] border-b border-border">
                    <th className="text-left px-6 py-3 font-medium">Job</th>
                    <th className="text-left px-6 py-3 font-medium">Bid</th>
                    <th className="text-left px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {proposals.map((p) => (
                    <tr key={p.proposal_id} className="border-b border-border last:border-0">
                      <td className="px-6 py-4">{p.jobs?.title || 'Unknown job'}</td>
                      <td className="px-6 py-4 font-sans font-medium text-accent">
                        ₱{Number(p.bid_amount || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[12px] font-medium border ${
                            p.status === 'accepted'
                              ? 'bg-accent/10 text-accent border-accent/30'
                              : p.status === 'rejected'
                              ? 'bg-error/10 text-error border-error/30'
                              : 'bg-surface text-text-secondary border-border'
                          }`}
                        >
                          {p.status ?? 'pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
