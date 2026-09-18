import { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  GridIcon, CompassIcon, BriefcaseIcon, FileTextIcon, PlusCircleIcon,
  ShieldCheckIcon, LogOutIcon, MenuIcon, SearchIcon, BellIcon, ExpandIcon,
  ChevronLeftIcon, ChevronRightIcon, CloseIcon,
} from './Icons';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); }
    catch { return {}; }
  })();

  const displayName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email?.split('@')[0] || 'User';
  const email = user.email || '';
  const initial = (user.first_name?.[0] || user.email?.[0] || 'U').toUpperCase();
  const activeRole = user.active_role || 'freelancer';

  useEffect(() => {
    function onClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    document.cookie.split(';').forEach((c) => {
      document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });
    navigate('/login');
  }

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  // Navigation items — dynamic based on role
  const navSections = [
    {
      title: 'Main',
      items: [
        { label: 'Dashboard', icon: GridIcon, path: '/dashboard' },
        { label: 'Explore Jobs', icon: CompassIcon, path: '/explore' },
      ],
    },
    ...(activeRole === 'customer'
      ? [{
          title: 'Client Tools',
          items: [
            { label: 'My Postings', icon: BriefcaseIcon, path: '/my-jobs' },
            { label: 'Post a Job', icon: PlusCircleIcon, path: '/jobs/create' },
          ],
        }]
      : []),
    {
      title: 'Manage',
      items: [
        { label: 'Contracts', icon: ShieldCheckIcon, path: '/dashboard', hash: '#contracts' },
      ],
    },
  ];

  return (
    <div className="flex min-h-screen bg-bg">
      {/* ── Sidebar Overlay (Mobile) ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm xl:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed top-0 left-0 z-50 flex h-screen flex-col bg-sidebar border-r border-border/50
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          xl:translate-x-0 xl:static xl:z-auto
          ${sidebarMinimized ? 'xl:w-[72px]' : 'xl:w-[260px]'}
          w-[260px]
        `}
      >
        {/* Brand */}
        <div className={`flex items-center gap-3 px-5 py-5 border-b border-border/30 ${sidebarMinimized ? 'xl:justify-center xl:px-0' : ''}`}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent">
            <svg viewBox="0 0 24 24" fill="white" className="h-5 w-5">
              <path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" />
            </svg>
          </div>
          {!sidebarMinimized && (
            <span className="font-heading text-lg font-bold tracking-tight text-text">
              RaketBase
            </span>
          )}
          {/* Mobile close */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto xl:hidden text-text-secondary hover:text-text cursor-pointer"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navSections.map((section) => (
            <div key={section.title}>
              {!sidebarMinimized && (
                <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-text-secondary/60">
                  {section.title}
                </div>
              )}
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <li key={item.label}>
                      <Link
                        to={item.path}
                        title={sidebarMinimized ? item.label : undefined}
                        className={`
                          group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium
                          transition-all duration-200 cursor-pointer
                          ${active
                            ? 'bg-accent/12 text-accent shadow-sm shadow-accent/5'
                            : 'text-text-secondary hover:bg-surface/60 hover:text-text'
                          }
                          ${sidebarMinimized ? 'xl:justify-center xl:px-0' : ''}
                        `}
                      >
                        <Icon className={`h-[18px] w-[18px] shrink-0 transition-colors ${active ? 'text-accent' : 'text-text-secondary group-hover:text-text'}`} />
                        {!sidebarMinimized && <span>{item.label}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Profile Card at Bottom */}
        <div className={`border-t border-border/30 p-3 ${sidebarMinimized ? 'xl:px-2' : ''}`}>
          <div className={`flex items-center gap-3 rounded-lg bg-surface/40 p-3 ${sidebarMinimized ? 'xl:justify-center xl:p-2' : ''}`}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent font-heading text-sm font-bold text-white">
              {initial}
            </div>
            {!sidebarMinimized && (
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-text">{displayName}</div>
                <div className="truncate text-[11px] text-text-secondary">{activeRole}</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div className={`flex min-w-0 flex-1 flex-col transition-all duration-300`}>
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border/60 bg-bg/80 px-4 py-3 backdrop-blur-xl sm:px-6">
          {/* Left: Toggle + Minimize */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="xl:hidden flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-surface hover:text-text cursor-pointer transition-colors"
              aria-label="Open menu"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setSidebarMinimized((m) => !m)}
              className="hidden xl:flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-surface hover:text-text cursor-pointer transition-colors"
              aria-label="Toggle sidebar"
            >
              {sidebarMinimized ? <ChevronRightIcon className="h-5 w-5" /> : <ChevronLeftIcon className="h-5 w-5" />}
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button
              className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-surface hover:text-text cursor-pointer transition-colors"
              aria-label="Notifications"
            >
              <BellIcon className="h-[18px] w-[18px]" />
            </button>
            <button
              onClick={() => {
                if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
                else document.exitFullscreen?.();
              }}
              className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-surface hover:text-text cursor-pointer transition-colors"
              aria-label="Fullscreen"
            >
              <ExpandIcon className="h-[18px] w-[18px]" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((o) => !o)}
                className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-surface cursor-pointer transition-colors"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent font-heading text-xs font-bold text-white">
                  {initial}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-semibold text-text leading-tight">{displayName}</div>
                  <div className="text-[11px] text-text-secondary leading-tight">{activeRole}</div>
                </div>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-border bg-panel p-1.5 shadow-2xl z-50"
                     style={{ animation: 'fade-in-up 0.15s ease-out' }}>
                  <div className="px-3 py-2.5 border-b border-border/50 mb-1">
                    <p className="font-heading text-sm font-bold text-text truncate">{displayName}</p>
                    {email && <p className="text-[11px] text-text-secondary truncate mt-0.5">{email}</p>}
                    <span className="inline-block mt-1.5 rounded-md bg-accent/10 border border-accent/20 px-2 py-0.5 text-[10px] font-bold text-accent uppercase tracking-wider">
                      {activeRole}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <LogOutIcon className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
