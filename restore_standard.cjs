const fs = require('fs');
let pathCss = 'c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/public/assets/css/main.css';
let css = fs.readFileSync(pathCss, 'utf8');

// Fix html font size media queries
const oldHtmlRegex = /html \{\n    font-size: 18\.5px;\n\}\n\n@media \(max-width: 991px\) \{\n    html \{\n        font-size: 17px;\n    \}\n\}\n\n@media \(max-width: 767px\) \{\n    html \{\n        font-size: 15px;\n    \}\n\}\n\n@media \(max-width: 480px\) \{\n    html \{\n        font-size: 14px;\n    \}\n\}/;

const newHtml = `html {
    font-size: 16px;
}

@media (max-width: 767px) {
    html {
        font-size: 15px;
    }
}

@media (max-width: 480px) {
    html {
        font-size: 14px;
    }
}`;

css = css.replace(oldHtmlRegex, newHtml);

// Fix body font size
css = css.replace(/body \{\n    background-color: var\(--bs-body-bg\);\n    color: var\(--text-main\);\n    font-family: var\(--bs-body-font-family\);\n    font-size: 1\.05rem;/, 'body {\n    background-color: var(--bs-body-bg);\n    color: var(--text-main);\n    font-family: var(--bs-body-font-family);\n    font-size: 0.95rem;');

// Fix small font size
css = css.replace(/\.small, small \{\n    font-size: 0\.95em !important;\n\}/, '.small, small {\n    font-size: 0.875em !important;\n}');

fs.writeFileSync(pathCss, css);
console.log('Restored standard laptop sizes');
