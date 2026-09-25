const fs = require('fs');
const files = ["Explore.jsx", "FreelancerProfile.jsx", "FreelancerProfileView.jsx"];
const dup1 = `<li className="sidebar-menu-item">
                  <Link to="/messages" className="sidebar-menu-link">
                    <i className="bi bi-chat-dots"></i>
                    <span>Messages</span>
                  </Link>
                </li>
                <li className="sidebar-menu-item">
                  <Link to="/top-users" className="sidebar-menu-link">
                    <i className="bi bi-star"></i>
                    <span>Top Freelancers</span>
                  </Link>
                </li>
                `;
const dup2 = `
                {user.active_role === "freelancer" && (
                  <li className="sidebar-menu-item">
                    <Link to="/my-proposals" className="sidebar-menu-link">
                      <i className="bi bi-file-earmark-text"></i>
                      <span>My Proposals</span>
                    </Link>
                  </li>
                )}`;

for (let file of files) {
  let path = `c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/${file}`;
  let content = fs.readFileSync(path, 'utf8');
  
  // Replace the first occurrence with empty string to remove the duplicate
  content = content.replace(dup1, '');
  content = content.replace(dup2, '');
  
  fs.writeFileSync(path, content);
}
console.log('Fixed duplicates');
