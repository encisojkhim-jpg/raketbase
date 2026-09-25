import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  })();

  const isActive = (path) => {
    return location.pathname.startsWith(path) ? 'active' : '';
  };

  const isProfileActive = location.pathname.startsWith('/freelancer') || location.pathname.startsWith('/profile');

  useEffect(() => {
    if (isSidebarMinimized) {
      document.body.classList.add('sidebar-minimized');
    } else {
      document.body.classList.remove('sidebar-minimized');
    }
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 300);
  }, [isSidebarMinimized]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen mode: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => {
          console.error(`Error attempting to exit fullscreen mode: ${err.message}`);
        });
      }
    }
  };

  return (
    <>
      <div className={`sidebar-wrapper ${isMobileSidebarOpen ? 'show' : ''}`} id="sidebar">
        <Link to="/" className="sidebar-brand text-decoration-none d-flex align-items-center gap-1" style={{ padding: '10px 0' }}>
          <img src="/racketbaseSVG.svg" alt="RaketBase Logo" style={{ height: '50px', objectFit: 'contain', marginTop: '-8px' }} />
          <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '24px', color: '#fff', letterSpacing: '0.5px', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontWeight: 800 }}>RAKET</span>
            <span style={{ fontWeight: 400 }}>BASE</span>
          </div>
        </Link>
        <div className="flex-grow-1 overflow-y-auto mt-4">
          <div className="sidebar-menu-section">
            <div className="sidebar-menu-title">Menu</div>
            <ul className="sidebar-menu-list">
              <li className="sidebar-menu-item">
                <Link to="/dashboard" onClick={() => setIsMobileSidebarOpen(false)} className={`sidebar-menu-link ${isActive('/dashboard')}`}>
                  <i className="bi bi-grid-fill"></i><span>Dashboard</span>
                </Link>
              </li>
              <li className="sidebar-menu-item">
                <Link to="/messages" onClick={() => setIsMobileSidebarOpen(false)} className={`sidebar-menu-link ${isActive('/messages')}`}>
                  <i className="bi bi-chat-dots"></i><span>Messages</span>
                </Link>
              </li>
              <li className="sidebar-menu-item">
                <Link to="/top-users" onClick={() => setIsMobileSidebarOpen(false)} className={`sidebar-menu-link ${isActive('/top-users')}`}>
                  <i className="bi bi-star"></i><span>Top Freelancers</span>
                </Link>
              </li>
              <li className="sidebar-menu-item">
                <Link to={`/profile/${user.user_id || user.id}`} onClick={() => setIsMobileSidebarOpen(false)} className={`sidebar-menu-link ${isProfileActive ? 'active' : ''}`}>
                  <i className="bi bi-person"></i><span>My Account</span>
                </Link>
              </li>
            </ul>
          </div>
          <div className="sidebar-menu-section">
            <div className="sidebar-menu-title">Jobs</div>
            <ul className="sidebar-menu-list">
              <li className="sidebar-menu-item">
                <Link to="/explore" onClick={() => setIsMobileSidebarOpen(false)} className={`sidebar-menu-link ${isActive('/explore') || isActive('/jobs') ? 'active' : ''}`}>
                  <i className="bi bi-search"></i><span>Explore Jobs</span>
                </Link>
              </li>
              {user.active_role === "freelancer" && (
                <li className="sidebar-menu-item">
                  <Link to="/my-proposals" onClick={() => setIsMobileSidebarOpen(false)} className={`sidebar-menu-link ${isActive('/my-proposals')}`}>
                    <i className="bi bi-file-earmark-text"></i><span>My Proposals</span>
                  </Link>
                </li>
              )}
              {user.active_role === 'customer' && (
                <>
                  <li className="sidebar-menu-item">
                    <Link to="/my-jobs" onClick={() => setIsMobileSidebarOpen(false)} className={`sidebar-menu-link ${isActive('/my-jobs') && !isActive('/jobs/create') ? 'active' : ''}`}>
                      <i className="bi bi-briefcase"></i><span>My Postings</span>
                    </Link>
                  </li>
                  <li className="sidebar-menu-item">
                    <Link to="/jobs/create" onClick={() => setIsMobileSidebarOpen(false)} className={`sidebar-menu-link ${isActive('/jobs/create')}`}>
                      <i className="bi bi-plus-circle"></i><span>Post a Job</span>
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>

      {isMobileSidebarOpen && (
        <div 
          className="sidebar-overlay d-xl-none" 
          onClick={() => setIsMobileSidebarOpen(false)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1025 }}
        ></div>
      )}

      <div className={`main-wrapper d-flex flex-column ${location.pathname.startsWith('/messages') ? 'messages-wrapper' : ''}`} style={location.pathname.startsWith('/messages') ? { height: "100vh", overflow: "hidden", padding: 0 } : { minHeight: "100vh" }}>
        <header className={`navbar-custom flex-shrink-0 ${location.pathname.startsWith('/messages') ? 'messages-navbar' : ''}`} style={{ position: "sticky", top: 0, zIndex: 1020 }}>
          <div className="navbar-left">
            <button className="btn-desktop-toggle d-none d-xl-flex align-items-center justify-content-center me-3" 
              onClick={() => setIsSidebarMinimized(!isSidebarMinimized)} aria-label="Minimize Sidebar">
              <i className={isSidebarMinimized ? "bi bi-chevron-bar-right" : "bi bi-chevron-bar-left"}></i>
            </button>
            <button className="sidebar-toggle-btn me-2 d-xl-none" id="sidebar-toggle" onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}>
              <i className="bi bi-list"></i>
            </button>
          </div>

          <div className="navbar-search-wrapper mx-3">
            {(location.pathname.includes('/explore') || location.pathname.includes('/top-users') || location.pathname.includes('/messages') || location.pathname.includes('/my-proposals')) && (
              <>
                <input type="text" className="navbar-search-input" placeholder="Search..." />
                <button className="navbar-search-btn"><i className="bi bi-search"></i></button>
              </>
            )}
          </div>

          <div className="navbar-actions d-flex align-items-center gap-3">
            <button className="navbar-action-btn me-1 d-none d-md-flex align-items-center justify-content-center" onClick={toggleFullscreen} aria-label="Toggle Fullscreen">
              <i className={isFullscreen ? "bi bi-fullscreen-exit" : "bi bi-arrows-fullscreen"}></i>
            </button>
            <div className="d-none d-md-flex align-items-center gap-2 px-3 py-1 bg-light rounded-pill border">
              <span className="small text-muted fw-medium text-capitalize">{user?.active_role || 'freelancer'} Mode</span>
            </div>
            <div className="dropdown">
              <button className="navbar-profile-btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                <img src={user?.avatar_url || "https://ui-avatars.com/api/?name=User&background=random"} alt="Profile" className="navbar-profile-img" />
                <span className="navbar-profile-name d-none d-md-inline">{user?.first_name || 'User'}</span>
                <i className="bi bi-chevron-down navbar-profile-caret"></i>
              </button>
              <ul className="dropdown-menu dropdown-menu-end dropdown-menu-profile">
                <li className="dropdown-header">
                  <div className="fw-bold text-dark text-truncate" title={`${user?.first_name || 'User'} ${user?.last_name || ''}`}>{user?.first_name || 'User'} {user?.last_name || ''}</div>
                  <div className="small text-muted text-truncate" title={user?.email || 'user@example.com'}>{user?.email || 'user@example.com'}</div>
                </li>
                <li><Link className="dropdown-item" to={`/profile/${user?.user_id || user?.id}`}><i className="bi bi-person"></i> My Profile</Link></li>
                <li><Link className="dropdown-item" to="#"><i className="bi bi-gear"></i> Settings</Link></li>
                <li><hr className="dropdown-divider" /></li>
                <li><Link className="dropdown-item text-danger" to="/login" onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); }}><i className="bi bi-box-arrow-right"></i> Logout</Link></li>
              </ul>
            </div>
          </div>
        </header>

        {/* Page Content Rendered Here */}
        <Outlet />

      </div>
    </>
  );
}
