const fs = require('fs');
let topUsersPath = 'c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/TopUsers.jsx';
let topUsers = fs.readFileSync(topUsersPath, 'utf8');

// Restore left-side filters
topUsers = topUsers.replace(
  /<div className="col-xl-9 col-lg-8 order-2 order-lg-1">/,
  '<div className="col-xl-9 col-lg-8 order-2">'
);
topUsers = topUsers.replace(
  /<div className=\{\`col-xl-3 col-lg-4 order-1 order-lg-2 \$\{\!filtersOpen \? \'d-none\' : \'\'\}\`\}>/,
  '<div className={`col-xl-3 col-lg-4 order-1 sticky-filter ${!filtersOpen ? \'d-none\' : \'\'}`}>'
);

// Apply p-0 ONLY to UserCards
topUsers = topUsers.replace(
  /<div className="card h-100 shadow-sm border-0 transition-all cursor-pointer hover-card" onClick=\{onOpen\}>\n\s*<div className="card-body d-flex flex-column align-items-center text-center">/g,
  '<div className="card h-100 shadow-sm border-0 transition-all cursor-pointer hover-card" onClick={onOpen}>\n      <div className="card-body d-flex flex-column align-items-center text-center p-0">'
);

fs.writeFileSync(topUsersPath, topUsers);
console.log('Fixed TopUsers filters and specific card padding');
