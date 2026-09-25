const fs = require('fs');
let path = 'c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/public/assets/css/main.css';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/html \{\s+font-size: 18\.5px;\s+\}/, 'html {\n    font-size: 18.5px;\n}\n\n@media (max-width: 991px) {\n    html {\n        font-size: 17px;\n    }\n}\n\n@media (max-width: 767px) {\n    html {\n        font-size: 15px;\n    }\n}\n\n@media (max-width: 480px) {\n    html {\n        font-size: 14px;\n    }\n}');

fs.writeFileSync(path, content);
console.log('Added responsive root typography');
