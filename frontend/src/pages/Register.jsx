import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import { MailIcon, LockIcon, UserIcon, EyeIcon, EyeOffIcon } from '../components/Icons';

export default function Register() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Member 1 Validation Specifications
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return setError('Please enter a valid email address.');
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      return setError('Password must be at least 8 characters long, include at least 1 uppercase letter and 1 number.');
    }

    setLoading(true);
    try {
      await registerUser({ firstName, lastName, email, password, role });
      navigate('/login?registered=1');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-bg overflow-hidden">
      {/* Ambient Glow Orbs */}
      <div
        className="pointer-events-none absolute -top-40 -right-32 h-[450px] w-[450px] rounded-full opacity-35"
        style={{
          background: 'radial-gradient(circle, rgba(255,90,30,0.3) 0%, transparent 70%)',
          animation: 'orb-drift-2 14s ease-in-out infinite',
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-40 h-[480px] w-[480px] rounded-full opacity-25"
        style={{
          background: 'radial-gradient(circle, rgba(34,197,94,0.3) 0%, transparent 70%)',
          animation: 'orb-drift-1 16s ease-in-out infinite',
        }}
      />
      <div
        className="pointer-events-none absolute top-1/4 left-1/3 h-[250px] w-[250px] rounded-full opacity-15"
        style={{
          background: 'radial-gradient(circle, rgba(180,241,5,0.25) 0%, transparent 70%)',
          animation: 'orb-drift-2 20s ease-in-out infinite reverse',
        }}
      />

      {/* Register Card */}
      <div
        className="relative z-10 w-full max-w-[440px] mx-4 my-8 rounded-2xl border border-border/60 bg-panel/80 p-8 backdrop-blur-xl shadow-2xl"
        style={{ animation: 'fade-in-up 0.5s ease-out' }}
      >
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 mb-7 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent shadow-lg shadow-accent/20 transition-transform group-hover:scale-105">
            <svg viewBox="0 0 24 24" fill="white" className="h-5 w-5">
              <path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" />
            </svg>
          </div>
          <span className="font-heading text-xl font-bold tracking-tight text-text">RaketBase</span>
        </Link>

        <h1 className="font-heading text-2xl font-bold text-text mb-1">Create your account</h1>
        <p className="text-text-secondary text-sm mb-6">Start posting jobs or picking up work.</p>

        {error && (
          <div className="mb-5 flex items-start gap-2 rounded-lg bg-error/10 border border-error/25 px-4 py-3 text-sm text-error">
            <span className="font-bold text-base leading-none mt-0.5">!</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-semibold text-text-secondary mb-2" htmlFor="reg-fname">First name</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-text-secondary/60 pointer-events-none" />
                <input id="reg-fname" type="text" required autoComplete="given-name" value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface/80 py-3 pl-10 pr-3 text-sm text-text placeholder-text-secondary/50 outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                  placeholder="Juan" />
              </div>
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-text-secondary mb-2" htmlFor="reg-lname">Last name</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-text-secondary/60 pointer-events-none" />
                <input id="reg-lname" type="text" required autoComplete="family-name" value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface/80 py-3 pl-10 pr-3 text-sm text-text placeholder-text-secondary/50 outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                  placeholder="Dela Cruz" />
              </div>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-[13px] font-semibold text-text-secondary mb-2" htmlFor="reg-email">Email Address</label>
            <div className="relative">
              <MailIcon className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-text-secondary/60 pointer-events-none" />
              <input id="reg-email" type="email" required autoComplete="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-xl border border-border bg-surface/80 py-3 pl-11 pr-4 text-sm text-text placeholder-text-secondary/50 outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[13px] font-semibold text-text-secondary mb-2" htmlFor="reg-password">Password</label>
            <div className="relative">
              <LockIcon className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-text-secondary/60 pointer-events-none" />
              <input id="reg-password" type={showPw ? 'text' : 'password'} required autoComplete="new-password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-border bg-surface/80 py-3 pl-11 pr-12 text-sm text-text placeholder-text-secondary/50 outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all" />
              <button type="button" onClick={() => setShowPw((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary/60 hover:text-text cursor-pointer transition-colors"
                aria-label={showPw ? 'Hide password' : 'Show password'}>
                {showPw ? <EyeOffIcon className="h-[18px] w-[18px]" /> : <EyeIcon className="h-[18px] w-[18px]" />}
              </button>
            </div>
            <p className="text-[11px] text-text-secondary/70 mt-1.5 pl-1">Min. 8 chars, 1 uppercase, 1 number</p>
          </div>

          {/* Role Toggle Cards */}
          <div>
            <label className="block text-[13px] font-semibold text-text-secondary mb-2">I want to join as:</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setRole('customer')}
                className={`rounded-xl border-2 p-3.5 text-left transition-all cursor-pointer ${
                  role === 'customer'
                    ? 'border-accent bg-accent/8 shadow-sm shadow-accent/10'
                    : 'border-border bg-surface/40 hover:border-border/80'
                }`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <BriefcaseIcon className={`h-5 w-5 ${role === 'customer' ? 'text-accent' : 'text-text-secondary'}`} />
                  <span className={`text-sm font-bold ${role === 'customer' ? 'text-accent' : 'text-text'}`}>Client</span>
                </div>
                <p className="text-[11px] text-text-secondary leading-snug">Post jobs & hire freelancers</p>
              </button>
              <button type="button" onClick={() => setRole('freelancer')}
                className={`rounded-xl border-2 p-3.5 text-left transition-all cursor-pointer ${
                  role === 'freelancer'
                    ? 'border-accent bg-accent/8 shadow-sm shadow-accent/10'
                    : 'border-border bg-surface/40 hover:border-border/80'
                }`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <CompassIcon className={`h-5 w-5 ${role === 'freelancer' ? 'text-accent' : 'text-text-secondary'}`} />
                  <span className={`text-sm font-bold ${role === 'freelancer' ? 'text-accent' : 'text-text'}`}>Freelancer</span>
                </div>
                <p className="text-[11px] text-text-secondary leading-snug">Browse & apply to jobs</p>
              </button>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-accent py-3.5 text-sm font-bold text-white shadow-lg shadow-accent/20 transition-all hover:bg-accent-hover hover:shadow-accent/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:translate-y-0 mt-2">
            {loading ? (
              <span style={{ animation: 'pulse-soft 1.2s ease-in-out infinite' }}>Creating account...</span>
            ) : (
              <>
                <span>Create Account</span>
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 10h12M12 5l5 5-5 5" />
                </svg>
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-accent hover:text-accent-hover transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

// Import sidebar icons used in role selection
function BriefcaseIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="6.2" width="14" height="9.3" rx="1.6" />
      <path d="M7.2 6.2V4.9a1.4 1.4 0 0 1 1.4-1.4h2.8a1.4 1.4 0 0 1 1.4 1.4v1.3" />
    </svg>
  );
}

function CompassIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="10" cy="10" r="7" />
      <polygon points="12,8 8.5,9.5 8,12 11.5,10.5" fill="currentColor" stroke="none" />
    </svg>
  );
}