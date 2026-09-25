const fs = require('fs');
let path = 'c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/TopUsers.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /<div className="col-12 col-md-4 col-lg-3 col-xl-3 order-1 order-md-1">/,
  '<div className="col-12 col-md-4 col-lg-3 col-xl-3 order-1 order-md-1" style={{ position: "sticky", top: "100px", zIndex: 10 }}>'
);

fs.writeFileSync(path, content);
console.log('Made TopUsers filters sticky');
