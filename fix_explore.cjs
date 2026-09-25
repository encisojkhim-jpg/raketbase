const fs = require('fs');
let explorePath = 'c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/Explore.jsx';
let explore = fs.readFileSync(explorePath, 'utf8');

// Restore left-side filters
explore = explore.replace(
  /<div className="col-xl-9 col-lg-8 order-2 order-lg-1">/,
  '<div className="col-xl-9 col-lg-8 order-2">'
);
explore = explore.replace(
  /<div className=\{\`col-xl-3 col-lg-4 order-1 order-lg-2 \$\{\!filtersOpen \? \'d-none\' : \'\'\}\`\}>/,
  '<div className={`col-xl-3 col-lg-4 order-1 sticky-filter ${!filtersOpen ? \'d-none\' : \'\'}`}>'
);

// Apply p-0 ONLY to JobCards by targeting the specific card structure
explore = explore.replace(
  /<div className="card h-100 border transition-all" style=\{\{ cursor: \'pointer\' \}\} onClick=\{onOpen\}>\n\s*<div className="card-body d-flex flex-column">/g,
  '<div className="card h-100 border transition-all" style={{ cursor: \'pointer\' }} onClick={onOpen}>\n      <div className="card-body d-flex flex-column p-0">'
);

fs.writeFileSync(explorePath, explore);
console.log('Fixed Explore filters and specific job card padding');
