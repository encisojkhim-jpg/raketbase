import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeftIcon, SearchIcon, ChevronDownIcon, MenuIcon, CloseIcon } from './Icons';
import { switchRole } from '../services/api';
import { useCurrentUser, setCurrentUser, markModeSwitch } from '../utils/currentUser';
import { showToast } from '../utils/toast';
import { hasUnsavedChanges } from '../utils/unsavedChanges';
import { useCurrency } from '../context/CurrencyContext';

export default function Navbar({
  showBack = false,
  backTo = null,
  showSearch = false,
  searchQuery = '',
  setSearchQuery = () => {},
  showFilters = false,
  filtersOpen = false,
  setFiltersOpen = () => {},
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [switching, setSwitching] = useState(false);
  const [switchError, setSwitchError] = useState('');
  // Remembers a photo URL that failed to load so we fall back to the initial letter.
  const [failedAvatar, setFailedAvatar] = useState(null);

  const { currency, setCurrency, supported } = useCurrency();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const token = localStorage.getItem('token');
  const user = useCurrentUser();

  const displayName =
    [user.first_name, user.last_name].filter(Boolean).join(' ') ||
    user.email?.split('@')[0] ||
    'User';
  const email = user.email || (token ? 'Logged In' : '');
  const initial = (user.first_name?.[0] || user.email?.[0] || 'U').toUpperCase();
  // Each mode has its own photo: the freelancer one or the client one.
  const avatarSrc = user.active_role === 'freelancer' ? user.avatar_url : user.client_avatar_url;
  const showAvatarImage = Boolean(avatarSrc) && failedAvatar !== avatarSrc;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleLogout() {
    // Clear tokens, session, and cookies
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    document.cookie.split(';').forEach((c) => {
      document.cookie = c
        .replace(/^ +/, '')
        .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });
    setDropdownOpen(false);
    navigate('/login');
  }

  // Switch between Client ('customer') and Freelancer modes in place (no reload).
  // Waits for the server (PATCH /auth/switch-role), then updates the shared user
  // so every page re-renders in the new mode. Client-only pages redirect to
  // /dashboard via <ClientRoute />.
  async function handleSwitchRole(newRole) {
    const currentRole = user.active_role || 'customer';
    if (switching || currentRole === newRole) return;

    if (
      hasUnsavedChanges() &&
      !window.confirm('You have unsaved changes on this page. Switching modes will discard them. Switch anyway?')
    ) {
      return;
    }

    setSwitching(true);
    setSwitchError('');
    try {
      const res = await switchRole(newRole);
      const activeRole = res.user?.active_role || newRole;
      markModeSwitch();
      setCurrentUser({ ...user, ...(res.user || {}), active_role: activeRole });
      showToast(`Switched to ${activeRole === 'freelancer' ? 'Freelancer' : 'Client'} mode`);
    } catch (err) {
      setSwitchError(err.message || 'Could not switch mode. Please try again.');
    } finally {
      setSwitching(false);
    }
  }

  function handleBack() {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  }

  const isDashboard = location.pathname === '/dashboard';

  return (
    <div className="sticky top-0 z-50 w-full">
      <header className="flex items-center justify-between border-b border-border bg-bg/95 px-4 py-3 backdrop-blur-md md:px-8">
      {/* Left side: Brand Logo and Filters button only */}
      <div className="flex items-center gap-3 md:gap-6">
        {showBack && (
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-[13px] font-medium text-text-secondary hover:text-text cursor-pointer transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Back</span>
          </button>
        )}

        <Link
          to={token ? '/dashboard' : '/login'}
          className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <img
            src="/racketbaseSVG.svg"
            alt="RaketBase Logo"
            className="h-8 w-8 object-contain logo-shake"
          />
          <div className="flex items-center tracking-tight text-xl md:text-2xl" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            <span className="font-extrabold text-text">RAKET</span>
            <span className="font-normal text-accent">BASE</span>
          </div>
        </Link>

        {showFilters && (
          <button
            onClick={() => setFiltersOpen((o) => !o)}
            className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text hover:border-accent/40 cursor-pointer transition-colors"
          >
            <span>Filters</span>
            <ChevronDownIcon
              className={`h-4 w-4 transition-transform ${filtersOpen ? 'rotate-180' : ''}`}
            />
          </button>
        )}
      </div>

      {/* Right side: Search bar, Navigation links, Currency, Mode toggle, Avatar, and Mobile hamburger */}
      <div className="flex items-center gap-3 md:gap-5">
        {showSearch && (
          <div className="relative hidden w-64 md:block lg:w-80">
            <SearchIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search open jobs, keywords, skills..."
              className="w-full rounded-full border border-border bg-surface py-2 pl-10 pr-4 text-sm text-text placeholder-text-secondary outline-none focus:border-accent"
            />
          </div>
        )}

        {/* Explore Jobs link */}
        <Link
          to="/explore"
          className={`hidden md:inline text-sm font-medium transition-colors cursor-pointer ${
            location.pathname === '/explore' ? 'text-accent font-semibold' : 'text-text-secondary hover:text-text'
          }`}
        >
          Explore Jobs
        </Link>

        {/* Top Users link: leaderboard of best-rated freelancers and clients */}
        <Link
          to="/top-users"
          className={`hidden lg:inline text-sm font-medium transition-colors cursor-pointer ${
            location.pathname === '/top-users' ? 'text-accent font-semibold' : 'text-text-secondary hover:text-text'
          }`}
        >
          Top Users
        </Link>

        {/* Messages link: one chat per contract, on either side of a job */}
        {token && (
          <Link
            to="/messages"
            className={`hidden md:inline text-sm font-medium transition-colors cursor-pointer ${
              location.pathname.startsWith('/messages') ? 'text-accent font-semibold' : 'text-text-secondary hover:text-text'
            }`}
          >
            Messages
          </Link>
        )}

        {/* My Postings link: where a client reviews and acts on incoming proposals */}
        {user.active_role === 'customer' && (
          <Link
            to="/my-jobs"
            className={`hidden lg:inline text-sm font-medium transition-colors cursor-pointer ${
              location.pathname.startsWith('/my-jobs') ? 'text-accent font-semibold' : 'text-text-secondary hover:text-text'
            }`}
          >
            My Postings
          </Link>
        )}

        {/* My Proposals link: where a freelancer tracks and manages their own bids */}
        {user.active_role === 'freelancer' && (
          <Link
            to="/my-proposals"
            className={`hidden lg:inline text-sm font-medium transition-colors cursor-pointer ${
              location.pathname.startsWith('/my-proposals') ? 'text-accent font-semibold' : 'text-text-secondary hover:text-text'
            }`}
          >
            My Proposals
          </Link>
        )}

        {/* Admin panel link (admin accounts only) */}
        {user.role === 'admin' && (
          <Link
            to="/admin"
            className={`hidden md:inline text-sm font-medium transition-colors cursor-pointer ${
              location.pathname === '/admin'
                ? 'text-accent font-semibold'
                : 'text-text-secondary hover:text-text'
            }`}
          >
            Admin
          </Link>
        )}
        
        {/* Dashboard link directly to the left of the user avatar */}
        <Link
          to="/dashboard"
          className={`hidden md:inline text-sm font-medium transition-colors cursor-pointer ${
            isDashboard ? 'text-accent font-semibold' : 'text-text-secondary hover:text-text'
          }`}
        >
          Dashboard
        </Link>

        {/* Post a Job button (customers only) */}
        {user.active_role === 'customer' && (
          <Link
            to="/jobs/create"
            className="hidden md:inline-flex rounded-md bg-accent px-3.5 py-1.5 text-xs font-semibold text-[#1A1305] hover:bg-accent-hover transition-colors cursor-pointer"
          >
            + Post a Job
          </Link>
        )}

        {/* Currency selector */}
        {token && (
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="rounded-md border border-border bg-surface px-2 py-1 text-xs font-medium text-text outline-none cursor-pointer hover:border-accent/40 transition-colors"
            aria-label="Select currency"
          >
            {supported.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}

        {/* Client | Freelancer mode toggle (desktop) */}
        {token && (
          <div className="relative hidden lg:block">
            <div
              role="group"
              aria-label="Switch between client and freelancer mode"
              className={`flex items-center rounded-full border border-border bg-surface p-0.5 text-xs font-semibold ${
                switching ? 'opacity-60' : ''
              }`}
            >
              {[
                { value: 'customer', label: 'Client' },
                { value: 'freelancer', label: 'Freelancer' },
              ].map((opt) => {
                const isActive = (user.active_role || 'customer') === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSwitchRole(opt.value)}
                    disabled={switching}
                    aria-pressed={isActive}
                    className={`rounded-full px-3 py-1 transition-colors ${
                      isActive
                        ? 'bg-accent text-[#1A1305] cursor-default'
                        : 'text-text-secondary hover:text-text cursor-pointer'
                    } disabled:cursor-not-allowed`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            {switchError && (
              <p
                role="alert"
                className="absolute right-0 top-full z-50 mt-2 w-56 rounded-md border border-error/40 bg-panel px-3 py-2 text-xs text-error shadow-2xl"
              >
                {switchError}
              </p>
            )}
          </div>
        )}

        {/* User Profile Avatar with Pure Logout & Identity Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            aria-label="User profile menu"
            className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent font-display text-sm font-semibold text-[#1A1305] cursor-pointer hover:ring-2 hover:ring-accent/50 transition-all focus:outline-none"
          >
            {showAvatarImage ? (
              <img
                src={avatarSrc}
                alt=""
                className="h-full w-full object-cover"
                onError={() => setFailedAvatar(avatarSrc)}
              />
            ) : (
              initial
            )}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg border border-border bg-panel p-2 shadow-2xl z-50">
              {/* User Identity Details */}
              <div className="px-3 py-2.5">
                <p className="font-display text-sm font-semibold text-text truncate">
                  {displayName}
                </p>
                {email && (
                  <p className="text-xs text-text-secondary truncate mt-0.5">{email}</p>
                )}
                <span className="inline-block mt-1.5 rounded bg-surface border border-border px-2 py-0.5 text-[10px] font-medium text-accent uppercase tracking-wider">
                  {user.role === 'admin' ? 'Admin' : user.active_role === 'freelancer' ? 'Freelancer' : 'Client'}
                </span>
              </div>

              {/* Profile link (both modes) directly above Log Out */}
              <div className="border-t border-border pt-1">
                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer hover:bg-surface ${
                    location.pathname === '/profile' ? 'text-accent' : 'text-text'
                  }`}
                >
                  <span>Profile</span>
                </Link>

                {/* Log Out Action */}
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-error hover:bg-error/10 transition-colors cursor-pointer"
                >
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile menu hamburger toggle button (three horizontal lines) — always sticky on mobile */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((o) => !o)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface text-text-secondary hover:text-accent hover:border-accent/50 md:hidden cursor-pointer transition-colors shadow-sm active:scale-95"
        >
          {mobileMenuOpen ? <CloseIcon className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
        </button>
      </div>
    </header>

    {/* Mobile Navigation Drawer — sticky and anchored directly beneath header */}
    {mobileMenuOpen && (
      <div className="md:hidden border-b border-border bg-panel/95 px-5 py-4 space-y-4 shadow-2xl backdrop-blur-md max-h-[calc(100vh-60px)] overflow-y-auto">
        {showSearch && (
          <div className="relative w-full">
            <SearchIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search open jobs, keywords..."
              className="w-full rounded-full border border-border bg-surface py-2 pl-10 pr-4 text-sm text-text placeholder-text-secondary outline-none focus:border-accent"
            />
          </div>
        )}

        {token && (
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <span className="text-xs font-medium text-text-secondary">Role:</span>
            <div
              role="group"
              aria-label="Switch between client and freelancer mode"
              className={`flex items-center rounded-full border border-border bg-surface p-0.5 text-xs font-semibold ${
                switching ? 'opacity-60' : ''
              }`}
            >
              {[
                { value: 'customer', label: 'Client' },
                { value: 'freelancer', label: 'Freelancer' },
              ].map((opt) => {
                const isActive = (user.active_role || 'customer') === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSwitchRole(opt.value)}
                    disabled={switching}
                    aria-pressed={isActive}
                    className={`rounded-full px-3 py-1 transition-colors ${
                      isActive
                        ? 'bg-accent text-[#1A1305] cursor-default'
                        : 'text-text-secondary hover:text-text cursor-pointer'
                    } disabled:cursor-not-allowed`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <nav className="flex flex-col gap-1 text-sm font-medium">
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className={`rounded-md px-3 py-2 transition-colors ${
              isDashboard ? 'bg-surface text-accent font-semibold' : 'text-text hover:bg-surface'
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className={`rounded-md px-3 py-2 transition-colors ${
              location.pathname === '/explore' ? 'bg-surface text-accent font-semibold' : 'text-text hover:bg-surface'
            }`}
          >
            Explore Jobs
          </Link>
          <Link
            to="/top-users"
            onClick={() => setMobileMenuOpen(false)}
            className={`rounded-md px-3 py-2 transition-colors ${
              location.pathname === '/top-users' ? 'bg-surface text-accent font-semibold' : 'text-text hover:bg-surface'
            }`}
          >
            Top Users
          </Link>
          {token && (
            <Link
              to="/messages"
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded-md px-3 py-2 transition-colors ${
                location.pathname.startsWith('/messages') ? 'bg-surface text-accent font-semibold' : 'text-text hover:bg-surface'
              }`}
            >
              Messages
            </Link>
          )}
          {user.active_role === 'customer' && (
            <Link
              to="/my-jobs"
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded-md px-3 py-2 transition-colors ${
                location.pathname.startsWith('/my-jobs') ? 'bg-surface text-accent font-semibold' : 'text-text hover:bg-surface'
              }`}
            >
              My Postings
            </Link>
          )}
          {user.active_role === 'freelancer' && (
            <Link
              to="/my-proposals"
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded-md px-3 py-2 transition-colors ${
                location.pathname.startsWith('/my-proposals') ? 'bg-surface text-accent font-semibold' : 'text-text hover:bg-surface'
              }`}
            >
              My Proposals
            </Link>
          )}
          {user.role === 'admin' && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded-md px-3 py-2 transition-colors ${
                location.pathname === '/admin' ? 'bg-surface text-accent font-semibold' : 'text-text hover:bg-surface'
              }`}
            >
              Admin
            </Link>
          )}
          {user.active_role === 'customer' && (
            <Link
              to="/jobs/create"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2 flex items-center justify-center rounded-md bg-accent px-4 py-2.5 text-center text-xs font-semibold text-[#1A1305] hover:bg-accent-hover transition-colors"
            >
              + Post a Job
            </Link>
          )}
        </nav>
      </div>
    )}
  </div>
  );
}
