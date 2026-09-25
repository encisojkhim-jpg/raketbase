const fs = require('fs');
let pathCss = 'c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/public/assets/css/main.css';
let css = fs.readFileSync(pathCss, 'utf8');

css = css.replace(/\.dropdown-menu-profile \{\n    width: 200px;/, '.dropdown-menu-profile {\n    min-width: 220px;\n    max-width: 280px;');

fs.writeFileSync(pathCss, css);
console.log('Fixed dropdown CSS');
