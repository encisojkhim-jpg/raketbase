const fs = require('fs');
let pathCss = 'c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/public/assets/css/main.css';
let css = fs.readFileSync(pathCss, 'utf8');

css = css.replace(/max-width: 750px;/, 'max-width: none;');
// Also make sure margin is nice
css = css.replace(/margin: 0 auto;/, 'margin: 0 1rem;');

fs.writeFileSync(pathCss, css);
console.log('Made search bar even longer');
