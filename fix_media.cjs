const fs = require('fs');
let pathCss = 'c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/public/assets/css/main.css';
let css = fs.readFileSync(pathCss, 'utf8');

css = css.replace(/@media \(min-width: 992px\) \{\n    \.sticky-filter/, '@media (min-width: 768px) {\n    .sticky-filter');
fs.writeFileSync(pathCss, css);
console.log('Fixed media query to 768px');
