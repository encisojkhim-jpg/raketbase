const fs = require('fs');
let topUsersPath = 'c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/TopUsers.jsx';
let topUsers = fs.readFileSync(topUsersPath, 'utf8');

topUsers = topUsers.replace(/className="card-body text-center position-relative"/g, 'className="card-body text-center position-relative p-0"');

fs.writeFileSync(topUsersPath, topUsers);
