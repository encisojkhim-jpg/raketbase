const fs = require('fs');
let path = 'c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/public/assets/css/main.css';
let content = fs.readFileSync(path, 'utf8');

// Sidebar fonts
content = content.replace(/\.sidebar-menu-link \{\s+display: flex;\s+align-items: center;\s+gap: 0\.85rem;\s+padding: 0\.9rem 1rem;\s+font-size: 1\.05rem;/, '.sidebar-menu-link {\n    display: flex;\n    align-items: center;\n    gap: 0.85rem;\n    padding: 0.75rem 0.85rem;\n    font-size: 0.95rem;');
content = content.replace(/\.sidebar-menu-link i \{\s+font-size: 1\.3rem;/, '.sidebar-menu-link i {\n    font-size: 1.15rem;');
content = content.replace(/\.sidebar-menu-title \{\s+font-size: 0\.8rem;/, '.sidebar-menu-title {\n    font-size: 0.7rem;');

// Navbar fonts
content = content.replace(/\.navbar-profile-name \{\s+font-size: 0\.95rem;/, '.navbar-profile-name {\n    font-size: 0.875rem;');
content = content.replace(/\.dropdown-menu-profile \.dropdown-header \{\s+font-size: 0\.95rem;/, '.dropdown-menu-profile .dropdown-header {\n    font-size: 0.85rem;');
content = content.replace(/\.dropdown-menu-profile \.dropdown-item \{\s+font-size: 0\.95rem;/, '.dropdown-menu-profile .dropdown-item {\n    font-size: 0.875rem;');
content = content.replace(/\.dropdown-menu-profile \.dropdown-item i \{\s+font-size: 1\.15rem;/, '.dropdown-menu-profile .dropdown-item i {\n    font-size: 1rem;');

fs.writeFileSync(path, content);
console.log('Fixed main.css nav fonts back to normal');
