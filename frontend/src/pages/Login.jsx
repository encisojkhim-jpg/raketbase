import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { loginUser } from '../services/api';
import { MailIcon, LockIcon, EyeIcon, EyeOffIcon } from '../components/Icons';

export default function Login() {
  const [searchParams] = useSearchParams();
  const justRegistered = searchParams.get('registered') === '1';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginUser({ email, password });
      localStorage.setItem('token', res.token);
      if (res.user) localStorage.setItem('user', JSON.stringify(res.user));
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-bg overflow-hidden">
      {/* Ambient Glow Orbs */}
      <div
        className="pointer-events-none absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full opacity-40"
        style={{
          background: 'radial-gradient(circle, rgba(255,90,30,0.35) 0%, transparent 70%)',
          animation: 'orb-drift-1 12s ease-in-out infinite',
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(34,197,94,0.3) 0%, transparent 70%)',
          animation: 'orb-drift-2 15s ease-in-out infinite',
        }}
      />
      <div
        className="pointer-events-none absolute top-1/3 right-1/4 h-[280px] w-[280px] rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(180,241,5,0.25) 0%, transparent 70%)',
          animation: 'orb-drift-1 18s ease-in-out infinite reverse',
        }}
      />

      {/* Login Card */}
      <div
        className="relative z-10 w-full max-w-[420px] mx-4 rounded-2xl border border-border/60 bg-panel/80 p-8 backdrop-blur-xl shadow-2xl"
        style={{ animation: 'fade-in-up 0.5s ease-out' }}
      >
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 mb-8 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent shadow-lg shadow-accent/20 transition-transform group-hover:scale-105">
            <svg viewBox="0 0 24 24" fill="white" className="h-5 w-5">
              <path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" />
            </svg>
          </div>
          <span className="font-heading text-xl font-bold tracking-tight text-text">
            RaketBase
          </span>
        </Link>

        <h1 className="font-heading text-2xl font-bold text-text mb-1">Welcome back</h1>
        <p className="text-text-secondary text-sm mb-7">Sign in to access your dashboard</p>

        {justRegistered && (
          <div className="mb-5 flex items-center gap-2 rounded-lg bg-success/10 border border-success/25 px-4 py-3 text-sm text-success">
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Account created successfully. Sign in below.
          </div>
        )}

        {error && (
          <div className="mb-5 flex items-center gap-2 rounded-lg bg-error/10 border border-error/25 px-4 py-3 text-sm text-error">
            <span className="font-bold text-base leading-none">!</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-[13px] font-semibold text-text-secondary mb-2" htmlFor="login-email">
              Email Address
            </label>
            <div className="relative">
              <MailIcon className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-text-secondary/60 pointer-events-none" />
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-xl border border-border bg-surface/80 py-3 pl-11 pr-4 text-sm text-text placeholder-text-secondary/50 outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[13px] font-semibold text-text-secondary mb-2" htmlFor="login-password">
              Password
            </label>
            <div className="relative">
              <LockIcon className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-text-secondary/60 pointer-events-none" />
              <input
                id="login-password"
                type={showPw ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-border bg-surface/80 py-3 pl-11 pr-12 text-sm text-text placeholder-text-secondary/50 outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary/60 hover:text-text cursor-pointer transition-colors"
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <EyeOffIcon className="h-[18px] w-[18px]" /> : <EyeIcon className="h-[18px] w-[18px]" />}
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer text-text-secondary hover:text-text transition-colors">
              <input type="checkbox" className="h-4 w-4 rounded border-border bg-surface accent-accent cursor-pointer" />
              <span className="text-[13px]">Remember me</span>
            </label>
            <span className="text-[13px] text-accent hover:text-accent-hover cursor-pointer transition-colors">
              Forgot password?
            </span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-accent py-3.5 text-sm font-bold text-white shadow-lg shadow-accent/20 transition-all hover:bg-accent-hover hover:shadow-accent/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:translate-y-0"
          >
            {loading ? (
              <span style={{ animation: 'pulse-soft 1.2s ease-in-out infinite' }}>Signing in...</span>
            ) : (
              <>
                <span>Sign In</span>
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 10h12M12 5l5 5-5 5" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-7 text-center text-sm text-text-secondary">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-accent hover:text-accent-hover transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}