
const fs = require("fs");
const files = ["Dashboard.jsx", "Explore.jsx", "FreelancerProfile.jsx", "FreelancerProfileView.jsx"];
const addition = `<li className="sidebar-menu-item">
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
                </li>\n                `;

for (let file of files) {
  let path = `c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/${file}`;
  let content = fs.readFileSync(path, "utf8");
  
  // Find the <li className="sidebar-menu-item"> containing My Account
  const regex = /<li className="sidebar-menu-item">\s*<Link to=\{\`\/freelancer\/\$\{user\.user_id \|\| user\.id\}\`\} className="sidebar-menu-link">\s*<i className="bi bi-person"><\/i>\s*<span>My Account<\/span>/g;
  
  if (regex.test(content)) {
      content = content.replace(regex, addition + `$&`);
      fs.writeFileSync(path, content);
      console.log(`Updated ${file}`);
  } else {
      console.log(`Could not find target string in ${file}`);
  }
}

