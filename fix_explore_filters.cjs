const fs = require('fs');
let path = 'c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/Explore.jsx';
let content = fs.readFileSync(path, 'utf8');

// Fix stretch
content = content.replace(/className="row g-4 px-3 mb-4"/, 'className="row g-4 px-3 mb-4 align-items-start"');

// Make card bigger
content = content.replace(/<div className="card shadow-sm border-0 mb-4">/, '<div className="card shadow-sm border-0 mb-4" style={{ padding: "1rem" }}>');
content = content.replace(/<h5 className="card-title mb-0">Filters<\/h5>/, '<h4 className="card-title mb-0 fw-bold">Filters</h4>');

fs.writeFileSync(path, content);
console.log('Fixed Explore filters');
