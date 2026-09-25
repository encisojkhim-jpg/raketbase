const fs = require('fs');
let explore = fs.readFileSync('c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/Explore.jsx', 'utf8');
explore = explore.replace(
  /style=\{\{ position: "sticky", top: "130px", zIndex: 10 \}\}/,
  'style={{ position: "sticky", top: "130px", zIndex: 10, alignSelf: "flex-start" }}'
);
fs.writeFileSync('c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/Explore.jsx', explore);
console.log('Fixed Explore sticky alignSelf');
