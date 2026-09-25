const fs = require('fs');
let path = 'c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/public/assets/css/main.css';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/html \{\s+font-size: 17px;\s+\}/, 'html {\n    font-size: 18.5px;\n}');
content = content.replace(/body \{\s+background-color: var\(--bs-body-bg\);\s+color: var\(--text-main\);\s+font-family: var\(--bs-body-font-family\);\s+font-size: 1rem;/, 'body {\n    background-color: var(--bs-body-bg);\n    color: var(--text-main);\n    font-family: var(--bs-body-font-family);\n    font-size: 1.05rem;');

// Make small even bigger
content = content.replace(/\.small, small \{\s+font-size: 0\.95em !important;\s+\}/, '.small, small {\n    font-size: 1em !important;\n}');

fs.writeFileSync(path, content);
console.log('Massively increased global fonts');
