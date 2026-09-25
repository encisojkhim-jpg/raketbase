const fs = require('fs');
let path = 'c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/MyProposals.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/className="btn btn-outline-dark btn-sm rounded-3 mt-3 px-4"/g, 'className="btn btn-outline-dark btn-sm rounded-pill mt-3 px-4"');

fs.writeFileSync(path, content);
console.log('Fixed empty state btn');
