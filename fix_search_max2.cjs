const fs = require('fs');
let pathCss = 'c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/public/assets/css/main.css';
let css = fs.readFileSync(pathCss, 'utf8');

css = css.replace(/max-width: none;\s+position: relative;\s+margin: 0 1rem;/, 'max-width: 800px;\n    position: relative;\n    margin: 0 auto;');

fs.writeFileSync(pathCss, css);
console.log('Fixed search wrapper max width');
