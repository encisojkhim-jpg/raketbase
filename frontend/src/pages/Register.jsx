import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';

export default function Register() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await registerUser({ firstName, lastName, email, password });
      navigate('/login?registered=1');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-bg text-text">
      <div className="hidden md:flex md:w-[42%] flex-col justify-between bg-panel border-r border-border p-14">
        <div className="font-display text-2xl font-semibold tracking-tight">RaketBase</div>
        <div className="max-w-xs">
          <h1 className="font-display text-3xl font-medium leading-snug mb-3">
            Built for the people who get things done.
          </h1>
          <p className="text-text-secondary text-[15px] leading-relaxed">
            Post the work. Find the work. RaketBase connects clients and freelancers directly.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="h-2.5 rounded-sm bg-border" style={{ width: '70%' }} />
          <div className="h-2.5 rounded-sm bg-border" style={{ width: '45%' }} />
          <div className="h-2.5 rounded-sm bg-border" style={{ width: '85%' }} />
          <div className="h-2.5 rounded-sm bg-border" style={{ width: '30%' }} />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[340px]">
          <h2 className="font-display text-2xl font-medium mb-1.5">Create your account</h2>
          <p className="text-text-secondary text-sm mb-8">Start posting jobs or picking up work.</p>

          {error && (
            <div className="text-sm mb-4 px-3 py-2.5 rounded-md bg-error/10 text-error border border-error/30">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="flex gap-3 mb-4">
              <div className="flex-1">
                <label className="block text-[13px] font-medium text-text-secondary mb-1.5" htmlFor="first-name">
                  First name
                </label>
                <input
                  id="first-name"
                  type="text"
                  required
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-surface border border-border text-text px-3 py-2.5 rounded-md text-sm outline-none focus:border-accent transition-colors"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[13px] font-medium text-text-secondary mb-1.5" htmlFor="last-name">
                  Last name
                </label>
                <input
                  id="last-name"
                  type="text"
                  required
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-surface border border-border text-text px-3 py-2.5 rounded-md text-sm outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface border border-border text-text px-3 py-2.5 rounded-md text-sm outline-none focus:border-accent transition-colors"
              />
            </div>

            <div className="mb-4">
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface border border-border text-text px-3 py-2.5 rounded-md text-sm outline-none focus:border-accent transition-colors"
              />
              <div className="text-xs text-text-secondary mt-1.5">At least 6 characters.</div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent-hover disabled:bg-border disabled:text-text-secondary text-[#1A1305] font-semibold text-sm py-3 rounded-md mt-2 transition-colors"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="mt-6 text-sm text-text-secondary text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-accent font-medium hover:underline">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
