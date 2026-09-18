// CreateJob — Post a new job listing
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCategories, createJob } from '../services/api';

export default function CreateJob() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [budgetType, setBudgetType] = useState('fixed');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await getCategories();
        setCategories(res.data || []);
      } catch { setError('Failed to fetch job categories.'); }
    }
    loadCategories();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (title.length < 10) return setError('Job title must be at least 10 characters long.');
    if (!categoryId) return setError('Please select a valid job category.');
    if (Number(budget) <= 0) return setError('Budget must be greater than ₱0.');
    if (deadline && new Date(deadline).getTime() <= Date.now()) return setError('Deadline must be a future date.');

    setLoading(true);
    try {
      await createJob({ title, description, category_id: categoryId, budget_type: budgetType, budget: Number(budget), deadline: deadline || null });
      navigate('/explore');
    } catch (err) { setError(err.message); setLoading(false); }
  }

  const inputClass = "w-full rounded-xl border border-border bg-surface/60 text-text px-4 py-3 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all placeholder-text-secondary/50";

  return (
    <div className="p-5 sm:p-8 max-w-2xl mx-auto" style={{ animation: 'fade-in-up 0.4s ease-out' }}>
      <Link to="/explore" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent hover:text-accent-hover mb-6 transition-colors">
        ← Back to Explore
      </Link>

      <div className="rounded-2xl border border-border/50 bg-panel/60 p-6 sm:p-8 backdrop-blur-sm shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
            <svg className="h-5 w-5 text-accent" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M10 4.5v11M4.5 10h11" />
            </svg>
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold">Post a New Job</h2>
            <p className="text-text-secondary text-sm">Reach verified freelancers across RaketBase</p>
          </div>
        </div>

        {error && (
          <div className="mt-5 flex items-start gap-2 rounded-xl bg-error/10 border border-error/25 px-4 py-3 text-sm text-error">
            <span className="font-bold text-base leading-none mt-0.5">!</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="block text-[13px] font-semibold text-text-secondary mb-2" htmlFor="cj-title">Job Title</label>
            <input id="cj-title" type="text" required placeholder="e.g. Full-Stack Node/React Developer Needed"
              value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-text-secondary mb-2" htmlFor="cj-category">Category</label>
            <select id="cj-category" required value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}>
              <option value="">Select Category</option>
              {categories.map((cat) => <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-text-secondary mb-2" htmlFor="cj-desc">Description</label>
            <textarea id="cj-desc" required rows={5} placeholder="Provide a detailed description of the scope, deliverables, and requirements..."
              value={description} onChange={(e) => setDescription(e.target.value)}
              className={inputClass + " resize-none"} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-text-secondary mb-2" htmlFor="cj-btype">Budget Type</label>
              <select id="cj-btype" value={budgetType} onChange={(e) => setBudgetType(e.target.value)} className={inputClass}>
                <option value="fixed">Fixed Price</option>
                <option value="milestone">Milestone Based</option>
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-text-secondary mb-2" htmlFor="cj-budget">Budget (₱)</label>
              <input id="cj-budget" type="number" min="1" required placeholder="5000"
                value={budget} onChange={(e) => setBudget(e.target.value)} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-text-secondary mb-2" htmlFor="cj-deadline">Deadline (Optional)</label>
            <input id="cj-deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={inputClass} />
          </div>

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-accent py-3.5 text-sm font-bold text-white shadow-lg shadow-accent/15 transition-all hover:bg-accent-hover hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2">
            {loading ? (
              <span style={{ animation: 'pulse-soft 1.2s ease-in-out infinite' }}>Publishing Job...</span>
            ) : (
              <>
                <span>Publish Job</span>
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 10h12M12 5l5 5-5 5" />
                </svg>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}