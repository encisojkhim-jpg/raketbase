const fs = require('fs');
let path = 'c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/Explore.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /<div className=\{\`col-xl-3 col-lg-4 order-1 order-lg-1 \$\{\!filtersOpen \? \'d-none\' : \'\'\}\`\}>/,
  '<div className={`col-xl-3 col-lg-4 order-1 order-lg-1 ${!filtersOpen ? \'d-none\' : \'\'}`} style={{ position: "sticky", top: "100px", zIndex: 10 }}>'
);

fs.writeFileSync(path, content);
console.log('Made Explore filters sticky');
