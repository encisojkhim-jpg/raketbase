const fs = require('fs');
const files = ['Messages.jsx', 'TopUsers.jsx', 'MyProposals.jsx'];
files.forEach(file => {
  const path = 'c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/' + file;
  let content = fs.readFileSync(path, 'utf8');

  content = content.replace(/<div className="header-container fixed-top" style=\{\{\s*position:\s*"sticky"\s*\}\}>\s*<header className="header navbar navbar-expand-sm expand-header">/, '<header className="navbar-custom" style={{ position: "sticky", top: 0, zIndex: 1020 }}>');

  const oldNavRegex = /<ul className="navbar-nav ms-auto align-items-center">\s*<li className="nav-item">\s*<div className="d-flex align-items-center gap-2 px-3 py-1 bg-light rounded-pill border">\s*<span className="small text-muted fw-medium text-capitalize">\{user\?\.active_role\} Mode<\/span>\s*<\/div>\s*<\/li>\s*<li className="nav-item">\s*<Link to=\{`\/freelancer\/\$\{user\?\.user_id\}`\} className="nav-link d-flex align-items-center">\s*<img src=\{user\?\.avatar_url \|\| "https:\/\/ui-avatars\.com\/api\/\?name=User&background=random"\} alt="Profile" className="rounded-circle border" style=\{\{\s*width:\s*"36px",\s*height:\s*"36px",\s*objectFit:\s*"cover"\s*\}\} \/>\s*<\/Link>\s*<\/li>\s*<\/ul>/;

  const newNav = `<div className="navbar-actions d-flex align-items-center gap-3">
              <div>
                <div className="d-flex align-items-center gap-2 px-3 py-1 bg-light rounded-pill border">
                  <span className="small text-muted fw-medium text-capitalize">{user?.active_role} Mode</span>
                </div>
              </div>
              <div>
                <Link to={\`/freelancer/\${user?.user_id}\`} className="nav-link d-flex align-items-center">
                  <img src={user?.avatar_url || "https://ui-avatars.com/api/?name=User&background=random"} alt="Profile" className="rounded-circle border" style={{ width: "36px", height: "36px", objectFit: "cover" }} />
                </Link>
              </div>
            </div>`;

  content = content.replace(oldNavRegex, newNav);
  content = content.replace(/<\/header>\s*<\/div>/, '</header>');

  fs.writeFileSync(path, content);
});
console.log('Done');
