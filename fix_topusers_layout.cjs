const fs = require('fs');
let topUsersPath = 'c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/TopUsers.jsx';
let topUsers = fs.readFileSync(topUsersPath, 'utf8');

topUsers = topUsers.replace(
  /<div className="col-12 col-md-3">/,
  '<div className="col-12 col-xl-3 col-lg-4 sticky-filter">'
);
topUsers = topUsers.replace(
  /<div className="col-12 col-md-9">/,
  '<div className="col-12 col-xl-9 col-lg-8">'
);

fs.writeFileSync(topUsersPath, topUsers);
