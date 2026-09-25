const fs = require('fs');
let layoutPath = 'c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/components/Layout.jsx';
let layout = fs.readFileSync(layoutPath, 'utf8');

layout = layout.replace(/<div className="small text-muted">\{user\?\.email \|\| \'user\@example\.com\'\}<\/div>/, '<div className="small text-muted text-truncate" title={user?.email || \'user@example.com\'}>{user?.email || \'user@example.com\'}</div>');
layout = layout.replace(/<div className="fw-bold text-dark">\{user\?\.first_name \|\| \'User\'\} \{user\?\.last_name \|\| \'\'\}<\/div>/, '<div className="fw-bold text-dark text-truncate" title={`${user?.first_name || \'User\'} ${user?.last_name || \'\'}`}>{user?.first_name || \'User\'} {user?.last_name || \'\'}</div>');

fs.writeFileSync(layoutPath, layout);
console.log('Fixed Layout truncation');
