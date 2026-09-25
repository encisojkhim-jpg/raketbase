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

function getBalancedBlock(str, startIndex, openTag, closeTag) {
  let depth = 1;
  let i = startIndex + openTag.length;
  while (depth > 0 && i < str.length) {
    let openMatch = str.indexOf(openTag, i);
    let closeMatch = str.indexOf(closeTag, i);
    
    if (closeMatch === -1) return -1;
    
    if (openMatch !== -1 && openMatch < closeMatch) {
      depth++;
      i = openMatch + openTag.length;
    } else {
      depth--;
      i = closeMatch + closeTag.length;
    }
  }
  return i;
}

for (let file of files) {
  let path = 'c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/' + file;
  if (!fs.existsSync(path)) continue;
  let content = fs.readFileSync(path, 'utf8');

  // 1. Remove .sidebar-profile block safely
  let sidebarStart = content.indexOf('<div className="sidebar-profile">');
  if (sidebarStart !== -1) {
    let sidebarEnd = getBalancedBlock(content, sidebarStart, '<div', '</div');
    if (sidebarEnd !== -1) {
      let blockToRemove = content.substring(sidebarStart, sidebarEnd + 1); // +1 for the > in </div>
      content = content.replace(blockToRemove, '');
    }
  }

  // 2. Fix header container
  let hRegex = /<div className="header-container fixed-top" style=\{\{\s*position:\s*"sticky"\s*\}\}>\s*<header className="header navbar navbar-expand-sm expand-header">/g;
  content = content.replace(hRegex, '<header className="navbar-custom" style={{ position: "sticky", top: 0, zIndex: 1020 }}>');
  content = content.replace(/<\/header>\s*<\/div>/g, '</header>');

  // 3. Standardize .navbar-actions using balanced blocks
  let navStart = content.indexOf('<div className="navbar-actions'); // matches "navbar-actions" and "navbar-actions d-flex..."
  if (navStart === -1) navStart = content.indexOf('<ul className="navbar-nav ms-auto');
  
  if (navStart !== -1) {
    let openTag = content.substring(navStart, navStart + 4) === '<div' ? '<div' : '<ul';
    let closeTag = openTag === '<div' ? '</div' : '</ul';
    
    let navEnd = getBalancedBlock(content, navStart, openTag, closeTag);
    if (navEnd !== -1) {
      let navBlock = content.substring(navStart, navEnd + 1);
      content = content.replace(navBlock, standardNav);
    }
  }

  fs.writeFileSync(path, content);
}
console.log('Replaced perfectly');

