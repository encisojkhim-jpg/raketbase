const fs = require('fs');
let topUsersPath = 'c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/TopUsers.jsx';
let topUsers = fs.readFileSync(topUsersPath, 'utf8');

topUsers = topUsers.replace(/className="card-body"/g, 'className="card-body p-0"');
topUsers = topUsers.replace(/className="card-body d-flex flex-column align-items-center text-center"/g, 'className="card-body d-flex flex-column align-items-center text-center p-0"');

fs.writeFileSync(topUsersPath, topUsers);
console.log('Fixed double padding in TopUsers');
