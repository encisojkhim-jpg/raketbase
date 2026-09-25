const fs = require('fs');
let explore = fs.readFileSync('c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/Explore.jsx', 'utf8');
let topUsers = fs.readFileSync('c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/TopUsers.jsx', 'utf8');

// Explore:
explore = explore.replace(/className="col-xl-8 col-lg-8 order-2 order-lg-1"/, 'className="col-xl-8 col-lg-8 order-2 order-lg-2"');
// Filter is already order-lg-1 due to my previous script

// TopUsers:
topUsers = topUsers.replace(/className="col-12 col-md-5 col-lg-4 col-xl-4 order-1 order-md-2"/, 'className="col-12 col-md-5 col-lg-4 col-xl-4 order-1 order-md-1"');
topUsers = topUsers.replace(/className="col-12 col-md-7 col-lg-8 col-xl-8 order-2 order-md-1"/, 'className="col-12 col-md-7 col-lg-8 col-xl-8 order-2 order-md-2"');

fs.writeFileSync('c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/Explore.jsx', explore);
fs.writeFileSync('c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/TopUsers.jsx', topUsers);
console.log('Fixed order correctly');
