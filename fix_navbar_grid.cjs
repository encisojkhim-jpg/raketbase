const fs = require('fs');
let pathCss = 'c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/public/assets/css/main.css';
let css = fs.readFileSync(pathCss, 'utf8');

css = css.replace(/grid-template-columns: 1fr 480px 1fr !important;/, 'grid-template-columns: auto 1fr auto !important;');

fs.writeFileSync(pathCss, css);
console.log('Fixed navbar grid columns');
