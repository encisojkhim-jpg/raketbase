const fs = require('fs');
let path = 'c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/TopUsers.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/className="col-12 col-md-5 col-lg-4 col-xl-3 order-1 order-md-2"/, 'className="col-12 col-md-5 col-lg-4 col-xl-3 order-1 order-md-1"');
content = content.replace(/className="col-12 col-md-7 col-lg-8 col-xl-9 order-2 order-md-1"/, 'className="col-12 col-md-7 col-lg-8 col-xl-9 order-2 order-md-2"');

fs.writeFileSync(path, content);
console.log('Fixed TopUsers layout order');
