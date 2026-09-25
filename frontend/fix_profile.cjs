const fs = require('fs');
let path = 'c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/FreelancerProfileView.jsx';
let content = fs.readFileSync(path, 'utf8');
content = content.replace(/<\/div>\s*<\/div>\s*\{\/\* -- Main Content/g, '</div>\n        </div>\n      </div>\n\n      {/* -- Main Content');
fs.writeFileSync(path, content);
