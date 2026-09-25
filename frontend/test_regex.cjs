const fs = require('fs');
let content = fs.readFileSync('c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/Explore.jsx', 'utf8');

const regex = /<div className="sidebar-profile">\s*<img src=\{[^\}]+\}\s*alt="Profile"\s*className="sidebar-profile-img"\s*\/>\s*<div className="sidebar-profile-info">\s*<div className="sidebar-profile-name">[^<]+<\/div>\s*<div className="sidebar-profile-email">[^<]+<\/div>\s*<\/div>\s*<\/div>/g;

if (regex.test(content)) {
  console.log('Match found!');
} else {
  console.log('No match.');
}
