const fs = require('fs');
let path = 'c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/components/Layout.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/\/freelancer\/\$\{/g, '/profile/${');
content = content.replace(/\/freelancer\//g, '/profile/');

fs.writeFileSync(path, content);
console.log('Fixed remaining links in Layout.jsx');
