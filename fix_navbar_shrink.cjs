const fs = require('fs');
let layoutPath = 'c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/components/Layout.jsx';
let layout = fs.readFileSync(layoutPath, 'utf8');

layout = layout.replace(/<header className="navbar-custom"/, '<header className="navbar-custom flex-shrink-0"');

fs.writeFileSync(layoutPath, layout);
console.log('Fixed navbar shrink');
