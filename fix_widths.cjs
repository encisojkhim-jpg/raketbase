const fs = require('fs');
let explore = fs.readFileSync('c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/Explore.jsx', 'utf8');
let topUsers = fs.readFileSync('c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/TopUsers.jsx', 'utf8');

// Explore:
explore = explore.replace(/className="col-xl-8 col-lg-8 order-2 order-lg-2"/, 'className="col-xl-9 col-lg-8 order-2 order-lg-2"');
explore = explore.replace(/className=\{\`col-xl-4 col-lg-4 order-1 order-lg-1/, 'className={`col-xl-3 col-lg-4 order-1 order-lg-1');

// TopUsers:
topUsers = topUsers.replace(/className="col-12 col-md-5 col-lg-4 col-xl-4 order-1 order-md-1"/, 'className="col-12 col-md-4 col-lg-3 col-xl-3 order-1 order-md-1"');
topUsers = topUsers.replace(/className="col-12 col-md-7 col-lg-8 col-xl-8 order-2 order-md-2"/, 'className="col-12 col-md-8 col-lg-9 col-xl-9 order-2 order-md-2"');

fs.writeFileSync('c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/Explore.jsx', explore);
fs.writeFileSync('c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/TopUsers.jsx', topUsers);
console.log('Fixed widths');
