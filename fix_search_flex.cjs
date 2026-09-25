const fs = require('fs');
let pathCss = 'c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/public/assets/css/main.css';
let css = fs.readFileSync(pathCss, 'utf8');

css = css.replace(/\.navbar-search-wrapper \{\n    width: 750px;\n    max-width: 100%;/, '.navbar-search-wrapper {\n    flex-grow: 1;\n    width: 100%;\n    max-width: 750px;');

fs.writeFileSync(pathCss, css);
console.log('Made search bar flexible and longer');
