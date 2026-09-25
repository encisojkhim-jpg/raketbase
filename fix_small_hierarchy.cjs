const fs = require('fs');
let path = 'c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/public/assets/css/main.css';
let content = fs.readFileSync(path, 'utf8');
content = content.replace(/\.small, small \{\s+font-size: 1em !important;\s+\}/, '.small, small {\n    font-size: 0.95em !important;\n}');
fs.writeFileSync(path, content);
