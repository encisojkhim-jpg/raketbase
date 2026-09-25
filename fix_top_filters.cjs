const fs = require('fs');
let path = 'c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/TopUsers.jsx';
let content = fs.readFileSync(path, 'utf8');

// Fix stretch
content = content.replace(/className="row g-4 px-3 mb-4"/, 'className="row g-4 px-3 mb-4 align-items-start"');

// Make card bigger
content = content.replace(/className=\{\`card shadow-sm border-0 \$\{open \? \'d-block\' : \'d-none d-md-block\'\}\`\}/, 'className={`card shadow-sm border-0 ${open ? \'d-block\' : \'d-none d-md-block\'}`} style={{ padding: "1rem" }}');
content = content.replace(/<h5 className="fw-bold mb-3 d-flex justify-content-between align-items-center">/, '<h4 className="fw-bold mb-4 d-flex justify-content-between align-items-center">');

fs.writeFileSync(path, content);
console.log('Fixed TopUsers filters');
