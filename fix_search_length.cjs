const fs = require('fs');
let pathCss = 'c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/public/assets/css/main.css';
let css = fs.readFileSync(pathCss, 'utf8');

css = css.replace(/\.navbar-search-wrapper \{\n    width: 480px;/, '.navbar-search-wrapper {\n    width: 750px;');

fs.writeFileSync(pathCss, css);
console.log('Made search bar longer');
