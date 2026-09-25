const fs = require('fs');
let pathCss = 'c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/public/assets/css/main.css';
let css = fs.readFileSync(pathCss, 'utf8');

// Reduce navbar custom inner padding to match the wrapper
css = css.replace(/padding: 1\.25rem 2\.5rem;/, 'padding: 1rem 1.5rem;');

fs.writeFileSync(pathCss, css);
console.log('Fixed navbar inner padding');
