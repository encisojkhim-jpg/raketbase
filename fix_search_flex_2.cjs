const fs = require('fs');
let pathCss = 'c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/public/assets/css/main.css';
let css = fs.readFileSync(pathCss, 'utf8');

css = css.replace(/width: 480px;\s+max-width: 100%;/, 'flex-grow: 1;\n    width: 100%;\n    max-width: 750px;');

fs.writeFileSync(pathCss, css);
