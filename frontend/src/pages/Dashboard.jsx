import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    async function fetchDashboardData() {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
        
        const response = await fetch(`${API_URL}/health`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          }
        });

        if (!response.ok) throw new Error('Token might be invalid or expired');
        
        setLoading(false);
      } catch (err) {
        console.error("Dashboard error:", err);
        localStorage.removeItem('token');
        navigate('/login');
      }
    }

    fetchDashboardData();
  }, [navigate]);

  function handleLogout() {
    localStorage.removeItem('token');
    navigate('/login');
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-bg text-text items-center justify-center">
        <p className="text-text-secondary">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-10 border-b border-border pb-6">
          <h1 className="font-display text-3xl font-semibold tracking-tight">RaketBase Dashboard</h1>
          <div className="flex items-center gap-3">
            <Link
              to="/explore"
              className="px-4 py-2 bg-accent text-[#1A1305] rounded-md text-sm font-semibold hover:bg-accent-hover transition-colors"
            >
              Explore freelancers
            </Link>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-surface border border-border rounded-md text-sm font-medium hover:bg-error/10 hover:text-error hover:border-error/30 transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-panel p-6 rounded-lg border border-border">
            <h3 className="text-text-secondary text-[13px] font-medium mb-1">Active Rakets</h3>
            <p className="text-3xl font-display font-medium text-accent">0</p>
          </div>
          
          <div className="bg-panel p-6 rounded-lg border border-border">
            <h3 className="text-text-secondary text-[13px] font-medium mb-1">Proposals Sent</h3>
            <p className="text-3xl font-display font-medium text-accent">0</p>
          </div>
          
          <div className="bg-panel p-6 rounded-lg border border-border">
            <h3 className="text-text-secondary text-[13px] font-medium mb-1">Messages</h3>
            <p className="text-3xl font-display font-medium text-accent">0</p>
          </div>
        </div>

        <div className="bg-panel border border-border rounded-lg p-8">
          <h2 className="font-display text-xl font-medium mb-3">Welcome to the inside!</h2>
          <p className="text-text-secondary text-[15px] leading-relaxed max-w-2xl">
            Because your authentication pipeline works, we successfully proved to the backend that we are logged in. 
            Member 5 can now replace this placeholder box with actual lists of available jobs, freelancer profiles, or proposal forms.
          </p>
        </div>
      </div>
    </div>
  );
}