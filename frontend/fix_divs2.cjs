const fs = require('fs');
const files = ["Dashboard.jsx", "Explore.jsx", "FreelancerProfile.jsx", "FreelancerProfileView.jsx", "Messages.jsx", "MyProposals.jsx", "TopUsers.jsx"];

for (let file of files) {
  let path = `c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/${file}`;
  if (!fs.existsSync(path)) continue;
  let content = fs.readFileSync(path, 'utf8');
  
  // Add back the missing </div>
  const regex = /<\/div>\s*<div className="main-wrapper">/g;
  content = content.replace(regex, '</div>\n        </div>\n\n        <div className="main-wrapper">');

  fs.writeFileSync(path, content);
}
console.log('Added back the missing div');
