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

  

  // Summary metrics calculation
  const activeContracts = contracts.filter((c) => c.status === 'active' || c.status === 'submitted');
  const completedContracts = contracts.filter((c) => c.status === 'completed');
  const totalAgreedEscrow = contracts.reduce((sum, c) => sum + Number(c.agreed_amount || 0), 0);
  const pendingProposalsCount = proposals.filter((p) => p.status === 'pending').length;

  return (
    <>


        <div className="page-header">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Manage your active contracts, escrow funds, and job applications.</p>
          </div>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-12">
            {actionSuccess && (
              <div className="alert alert-success alert-dismissible fade show border-0 bg-success text-white" role="alert">
                <i className="bi bi-check-circle me-2"></i>{actionSuccess}
                <button type="button" className="btn-close btn-close-white" onClick={() => setActionSuccess('')}></button>
              </div>
            )}
            {actionError && (
              <div className="alert alert-danger alert-dismissible fade show border-0 bg-danger text-white" role="alert">
                <i className="bi bi-exclamation-circle me-2"></i>{actionError}
                <button type="button" className="btn-close btn-close-white" onClick={() => setActionError('')}></button>
              </div>
            )}
            <div className="row g-4">
              <div className="col-md-4">
                <div className="card alert-green-card h-100">
                  <div className="position-relative z-index-2">
                    <span className="alert-green-badge">Welcome</span>
                    <div className="alert-green-text mt-3" style={{ fontSize: '1.2rem' }}>Hello, {user.first_name || 'User'}!</div>
                    <div className="mt-2 text-white">You have {pendingProposalsCount} pending proposals.</div>
                  </div>
                      <img src="/racketbaseSVG.svg" className="alert-green-bg-shape rocket-logo" alt="Raketbase Logo" />
                </div>
              </div>

              <div className="col-md-4">
                <div className="card card-stat d-flex flex-column justify-content-between h-100">
                  <div>
                    <div className="card-header">
                      <span className="stat-label">Active Contracts</span>
                    </div>
                    <div className="stat-value">{activeContracts.length}</div>
                    <div className="trend-badge trend-up">
                      <span>In progress or submitted</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card card-stat d-flex flex-column justify-content-between h-100">
                  <div>
                    <div className="card-header">
                      <span className="stat-label">{user.active_role === 'customer' ? 'Total Escrow Funded' : 'Total Contract Value'}</span>
                    </div>
                    <div className="stat-value">₱{totalAgreedEscrow.toLocaleString()}</div>
                    <div className="trend-badge trend-up">
                      <i className="bi bi-shield-check"></i>
                      <span>Secured via Supabase</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-xl-8 col-lg-8">
            <div className="card mb-0 h-100">
              <div className="card-header mb-2">
                <h2 className="card-title">Contracts & Escrow</h2>
              </div>
              {contracts.length === 0 ? (
                <div className="text-center p-5 text-muted">No contracts yet.</div>
              ) : (
                <div className="table-responsive p-3 pt-0">
                  <table className="table table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Job Title</th>
                        <th>Counterparty</th>
                        <th>Escrow Amount</th>
                        <th>Status</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="border-top-0">
                      {contracts.map((c) => {
                        const isClient = user.id === c.client_id;
                        const partner = isClient ? c.freelancer : c.client;
                        const partnerRole = isClient ? 'Freelancer' : 'Client';
                        const partnerName = partner ? `${partner.first_name || ''} ${partner.last_name || ''}`.trim() || partner.email : 'Participant';
                        return (
                          <tr key={c.contract_id}>
                            <td>
                              <div className="fw-semibold text-dark">{c.jobs?.title || 'Job Posting'}</div>
                              <div className="small text-muted">{new Date(c.created_at).toLocaleDateString()}</div>
                            </td>
                            <td>
                              <div className="fw-medium text-dark">{partnerName}</div>
                              <div className="small text-muted">{partnerRole}</div>
                            </td>
                            <td>
                              <div className="fw-bold text-success">₱{Number(c.agreed_amount || 0).toLocaleString()}</div>
                            </td>
                            <td>
                              <span className={`badge rounded-pill px-3 py-2 fw-medium ${c.status === 'completed' ? 'bg-success text-white' : c.status === 'submitted' ? 'bg-warning text-dark' : 'bg-info text-dark'}`} style={{ fontSize: '0.85rem' }}>
                                {c.status}
                              </span>
                            </td>
                            <td className="text-end">
                              {!isClient && c.status === 'active' && (
                                <button className="btn btn-sm btn-primary rounded-pill px-3" disabled={actioningId === c.contract_id} onClick={() => handleSubmitWork(c.contract_id)}>
                                  {actioningId === c.contract_id ? 'Submitting...' : 'Submit Work'}
                                </button>
                              )}
                              {isClient && c.status === 'submitted' && (
                                <button className="btn btn-sm btn-success rounded-pill px-3" disabled={actioningId === c.contract_id} onClick={() => handleApproveAndRelease(c)}>
                                  {actioningId === c.contract_id ? 'Releasing...' : 'Approve & Release'}
                                </button>
                              )}
                              {isClient && c.status === 'active' && <span className="small text-dark fw-semibold fst-italic">Work in Progress</span>}
                              {c.status === 'completed' && <span className="small text-success fw-bold"><i className="bi bi-check-all"></i> Released</span>}
                              {!isClient && c.status === 'submitted' && <span className="small text-dark fw-bold">Awaiting Review</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="col-xl-4 col-lg-4">
            <div className="card h-100 mb-0 flex-grow-1">
              <div className="card-header">
                <h2 className="card-title">My Proposals</h2>
              </div>
              {proposals.length === 0 ? (
                <div className="text-center p-5 text-muted">No proposals yet.</div>
              ) : (
                <div className="transaction-list mt-2">
                  {[...proposals].sort((a, b) => {
                    const statusA = (a.status || 'pending').toLowerCase();
                    const statusB = (b.status || 'pending').toLowerCase();
                    const rank = { 'accepted': 1, 'pending': 2, 'rejected': 3 };
                    return (rank[statusA] || 4) - (rank[statusB] || 4);
                  }).map((p) => {
                    const status = (p.status || 'pending').toLowerCase();
                    let statusClass = 'btn btn-warning btn-sm text-dark';
                    let displayStatus = 'Submitted';
                    if (status === 'accepted') {
                      statusClass = 'btn btn-success btn-sm text-white';
                      displayStatus = 'Accepted';
                    } else if (status === 'rejected') {
                      statusClass = 'btn btn-danger btn-sm text-white';
                      displayStatus = 'Rejected';
                    }

                    return (
                      <div className="transaction-item align-items-center" key={p.proposal_id}>
                        <div className="transaction-icon bg-forest-light text-lime">
                          <i className="bi bi-file-earmark-text"></i>
                        </div>
                        <div className="transaction-info flex-grow-1">
                          <div className="transaction-name text-dark fw-semibold mb-1">{p.jobs?.title || 'Job Posting'}</div>
                          <div className="transaction-amount text-success fw-bold small">₱{Number(p.bid_amount || 0).toLocaleString()}</div>
                        </div>
                        <div className="ms-3 text-end">
                          <span className={`${statusClass} rounded-pill px-3 fw-medium`} style={{ pointerEvents: 'none' }}>
                            {displayStatus}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

      
    </>
  );
}
