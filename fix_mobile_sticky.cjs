const fs = require('fs');
let pathCss = 'c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/public/assets/css/main.css';
let css = fs.readFileSync(pathCss, 'utf8');

if (!css.includes('.sticky-filter')) {
    css += '\n\n/* Desktop Sticky Filter */\n@media (min-width: 992px) {\n    .sticky-filter {\n        position: sticky;\n        top: 130px;\n        z-index: 10;\n        align-self: flex-start;\n    }\n}\n';
    fs.writeFileSync(pathCss, css);
}

let explore = fs.readFileSync('c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/Explore.jsx', 'utf8');
explore = explore.replace(
  /className=\{\`col-xl-3 col-lg-4 order-1 order-lg-1 \$\{\!filtersOpen \? \'d-none\' : \'\'\}\`\} style=\{\{ position: "sticky", top: "130px", zIndex: 10, alignSelf: "flex-start" \}\}/,
  'className={`col-xl-3 col-lg-4 order-1 order-lg-1 sticky-filter ${!filtersOpen ? \'d-none\' : \'\'}`}'
);
fs.writeFileSync('c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/Explore.jsx', explore);

let topUsers = fs.readFileSync('c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/TopUsers.jsx', 'utf8');
topUsers = topUsers.replace(
  /className="col-12 col-md-4 col-lg-3 col-xl-3 order-1 order-md-1" style=\{\{ position: "sticky", top: "130px", zIndex: 10, alignSelf: "flex-start" \}\}/,
  'className="col-12 col-md-4 col-lg-3 col-xl-3 order-1 order-md-1 sticky-filter"'
);
fs.writeFileSync('c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/TopUsers.jsx', topUsers);

console.log('Fixed mobile sticky filters');
