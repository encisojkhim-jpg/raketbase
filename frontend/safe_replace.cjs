const fs = require('fs');
const files = ['Dashboard.jsx', 'Explore.jsx', 'FreelancerProfile.jsx', 'FreelancerProfileView.jsx', 'Messages.jsx', 'MyProposals.jsx', 'TopUsers.jsx'];

const standardNav = `<div className="navbar-actions d-flex align-items-center gap-3">
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
                    <div className="fw-bold text-dark">{user?.first_name || 'User'} {user?.last_name || ''}</div>
                    <div className="small text-muted">{user?.email || 'user@example.com'}</div>
                  </li>
                  <li><Link className="dropdown-item" to={\`/freelancer/\${user?.user_id || user?.id}\`}><i className="bi bi-person"></i> My Profile</Link></li>
                  <li><Link className="dropdown-item" to="#"><i className="bi bi-gear"></i> Settings</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><Link className="dropdown-item text-danger" to="/login" onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); }}><i className="bi bi-box-arrow-right"></i> Logout</Link></li>
                </ul>
              </div>
            </div>`;

for (let file of files) {
  let path = 'c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/' + file;
  if (!fs.existsSync(path)) continue;
  let content = fs.readFileSync(path, 'utf8');

  // 1. Remove .sidebar-profile block
  let sidebarStart = content.indexOf('<div className="sidebar-profile">');
  if (sidebarStart !== -1) {
    // Find the end of sidebar-wrapper safely by looking for `<div className="main-wrapper">`
    let mainWrapperStart = content.indexOf('<div className="main-wrapper">', sidebarStart);
    if (mainWrapperStart !== -1) {
      // The original layout is:
      // <div className="sidebar-profile"> ... </div>
      // </div>
      // <div className="main-wrapper">
      // Let's just find the exact block from `<div className="sidebar-profile">` up to the FIRST `</div>` AFTER `<div className="sidebar-profile-email">`'s closing tag.
      let emailMatch = content.indexOf('<div className="sidebar-profile-email">', sidebarStart);
      if (emailMatch !== -1) {
        let firstDivClose = content.indexOf('</div>', emailMatch); // closes email
        let secondDivClose = content.indexOf('</div>', firstDivClose + 6); // closes info
        let thirdDivClose = content.indexOf('</div>', secondDivClose + 6); // closes profile

        let blockToRemove = content.substring(sidebarStart, thirdDivClose + 6);
        content = content.replace(blockToRemove, '');
      }
    }
  }

  // 2. Fix header-container start (for Messages, TopUsers, MyProposals)
  content = content.replace(/<div className="header-container fixed-top" style=\{\{\s*position:\s*"sticky"\s*\}\}>\s*<header className="header navbar navbar-expand-sm expand-header">/g, '<header className="navbar-custom" style={{ position: "sticky", top: 0, zIndex: 1020 }}>');
  // Remove the `</div>` that closes header-container
  content = content.replace(/<\/header>\s*<\/div>/g, '</header>');

  // 3. Replace .navbar-actions block
  let navStart = content.indexOf('<div className="navbar-actions"');
  if (navStart === -1) navStart = content.indexOf('<div className="navbar-actions '); // catch d-flex
  if (navStart === -1) navStart = content.indexOf('<ul className="navbar-nav ms-auto');
  
  if (navStart !== -1) {
    let headerEnd = content.indexOf('</header>', navStart);
    if (headerEnd !== -1) {
      let navBlock = content.substring(navStart, headerEnd).trim();
      content = content.replace(navBlock, standardNav);
    }
  }

  fs.writeFileSync(path, content);
}
console.log('Safe edits complete');

