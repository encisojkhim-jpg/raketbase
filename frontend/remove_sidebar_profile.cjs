const fs = require('fs');
const files = ["Dashboard.jsx", "Explore.jsx", "FreelancerProfile.jsx", "FreelancerProfileView.jsx", "Messages.jsx", "MyProposals.jsx", "TopUsers.jsx"];

for (let file of files) {
  let path = `c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/${file}`;
  if (!fs.existsSync(path)) continue;
  let content = fs.readFileSync(path, 'utf8');
  
  // Remove sidebar profile
  const sidebarRegex = /<div className="sidebar-profile">[\s\S]*?<div className="sidebar-profile-info">[\s\S]*?<\/div>\s*<\/div>/g;
  content = content.replace(sidebarRegex, '');

  fs.writeFileSync(path, content);
}
console.log('Removed sidebar profile');
