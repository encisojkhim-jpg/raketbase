const fs = require('fs');
let layoutPath = 'c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/components/Layout.jsx';
let layout = fs.readFileSync(layoutPath, 'utf8');

// 1. Re-add flex-shrink-0 and the conditional message-navbar class
layout = layout.replace(
  /<header className="navbar-custom" style=\{\{ position: "sticky", top: 0, zIndex: 1020 \}\}>/,
  '<header className={`navbar-custom flex-shrink-0 ${location.pathname.startsWith(\'/messages\') ? \'messages-navbar\' : \'\'}`} style={{ position: "sticky", top: 0, zIndex: 1020 }}>'
);

// 2. Re-add email truncation
layout = layout.replace(/<div className="small text-muted">\{user\?\.email \|\| \'user\@example\.com\'\}<\/div>/, '<div className="small text-muted text-truncate" title={user?.email || \'user@example.com\'}>{user?.email || \'user@example.com\'}</div>');
layout = layout.replace(/<div className="fw-bold text-dark">\{user\?\.first_name \|\| \'User\'\} \{user\?\.last_name \|\| \'\'\}<\/div>/, '<div className="fw-bold text-dark text-truncate" title={`${user?.first_name || \'User\'} ${user?.last_name || \'\'}`}>{user?.first_name || \'User\'} {user?.last_name || \'\'}</div>');

fs.writeFileSync(layoutPath, layout);
console.log('Restored Layout.jsx fixes');
