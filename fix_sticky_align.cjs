const fs = require('fs');
let topUsers = fs.readFileSync('c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/TopUsers.jsx', 'utf8');
topUsers = topUsers.replace(
  /style=\{\{ position: "sticky", top: "130px", zIndex: 10 \}\}/,
  'style={{ position: "sticky", top: "130px", zIndex: 10, alignSelf: "flex-start" }}'
);
fs.writeFileSync('c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/TopUsers.jsx', topUsers);
console.log('Fixed TopUsers sticky alignSelf');
