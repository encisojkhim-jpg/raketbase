const fs = require('fs');
let path = 'c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/public/assets/css/main.css';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/\.sidebar-menu-link \{\s+display: flex;\s+align-items: center;\s+gap: 0\.85rem;\s+padding: 0\.9rem 1rem;\s+font-size: 1\.15rem;/, '.sidebar-menu-link {\n    display: flex;\n    align-items: center;\n    gap: 0.85rem;\n    padding: 0.75rem 0.85rem;\n    font-size: 0.95rem;');
content = content.replace(/\.sidebar-menu-link i \{\s+font-size: 1\.3rem;/, '.sidebar-menu-link i {\n    font-size: 1.15rem;');
content = content.replace(/\.sidebar-menu-link i \{\s+font-size: 1\.15rem;/, '.sidebar-menu-link i {\n    font-size: 1.15rem;'); // just in case

fs.writeFileSync(path, content);
