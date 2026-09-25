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
  
  const oldRegexDropdown = /<div className="navbar-actions">[\s\S]*?<\/ul>\s*<\/div>\s*<\/div>/;
  const oldRegexFlex = /<div className="navbar-actions d-flex align-items-center gap-3">[\s\S]*?<\/ul>\s*<\/div>\s*<\/div>/;
  const oldRegexFlex2 = /<div className="navbar-actions d-flex align-items-center gap-3">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;

  if (oldRegexDropdown.test(content)) {
    content = content.replace(oldRegexDropdown, standardNav);
  } else if (oldRegexFlex.test(content)) {
    content = content.replace(oldRegexFlex, standardNav);
  } else if (oldRegexFlex2.test(content)) {
    content = content.replace(oldRegexFlex2, standardNav);
  }

  fs.writeFileSync(path, content);
}
console.log('Standardized navbar actions');
