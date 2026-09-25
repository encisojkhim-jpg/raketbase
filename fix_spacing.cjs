const fs = require('fs');
let pathCss = 'c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/public/assets/css/main.css';
let css = fs.readFileSync(pathCss, 'utf8');

// Reduce main wrapper padding
css = css.replace(/padding: 2rem 2\.5rem;/, 'padding: 1rem 1.5rem;');

// Reduce navbar custom negative margins to perfectly match the new wrapper padding
css = css.replace(/margin-top: -2rem;/, 'margin-top: -1rem;');
css = css.replace(/margin-left: -2\.5rem;/g, 'margin-left: -1.5rem;');
css = css.replace(/margin-right: -2\.5rem;/g, 'margin-right: -1.5rem;');
css = css.replace(/margin-bottom: 2rem;/, 'margin-bottom: 1.5rem;');

// Reduce card padding
css = css.replace(/\.card \{\n    background-color: var\(--card-background\);\n    border: none;\n    border-radius: var\(--radius-xxl\);\n    padding: 1\.75rem;/, '.card {\n    background-color: var(--card-background);\n    border: none;\n    border-radius: var(--radius-xxl);\n    padding: 1.25rem;');

fs.writeFileSync(pathCss, css);
console.log('Reduced spacing and padding');
