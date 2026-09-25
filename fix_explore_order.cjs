const fs = require('fs');
let path = 'c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/Explore.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/className=\{\`col-xl-8 col-lg-8 order-2 order-lg-1/, 'className={`col-xl-8 col-lg-8 order-2 order-lg-2');
content = content.replace(/className=\{\`col-xl-4 col-lg-4 order-1 order-lg-2/, 'className={`col-xl-4 col-lg-4 order-1 order-lg-1');

fs.writeFileSync(path, content);
console.log('Fixed Explore layout order');
