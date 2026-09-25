const fs = require('fs');
let explore = fs.readFileSync('c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/Explore.jsx', 'utf8');
let topUsers = fs.readFileSync('c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/TopUsers.jsx', 'utf8');

explore = explore.replace(/top: "100px"/, 'top: "130px"');
topUsers = topUsers.replace(/top: "100px"/, 'top: "130px"');

fs.writeFileSync('c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/Explore.jsx', explore);
fs.writeFileSync('c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/TopUsers.jsx', topUsers);
console.log('Fixed sticky offsets');
