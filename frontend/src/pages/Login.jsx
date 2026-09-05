import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { loginUser } from '../services/api';

export default function Login() {
  const [searchParams] = useSearchParams();
  const justRegistered = searchParams.get('registered') === '1';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token } = await loginUser({ email, password });
      localStorage.setItem('token', token);
      window.location.href = 'https://youtube.com';
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
          <h2 className="font-display text-2xl font-medium mb-1.5">Log in</h2>
          <p className="text-text-secondary text-sm mb-8">Welcome back. Enter your details to continue.</p>

          {justRegistered && (
            <div className="text-sm mb-4 px-3 py-2.5 rounded-md bg-accent/10 text-accent border border-accent/30">
              Account created. Log in below.
            </div>
          )}
          {error && (
            <div className="text-sm mb-4 px-3 py-2.5 rounded-md bg-error/10 text-error border border-error/30">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
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
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface border border-border text-text px-3 py-2.5 rounded-md text-sm outline-none focus:border-accent transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent-hover disabled:bg-border disabled:text-text-secondary text-[#1A1305] font-semibold text-sm py-3 rounded-md mt-2 transition-colors"
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <div className="mt-6 text-sm text-text-secondary text-center">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-accent font-medium hover:underline">
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
