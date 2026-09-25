
const fs = require("fs");
const files = ["Dashboard.jsx", "Explore.jsx", "FreelancerProfile.jsx", "FreelancerProfileView.jsx"];
const addition = `
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
  let content = fs.readFileSync(path, "utf8");
  
  // We want to insert after the Explore Jobs </li>
  const regex = /(<span>Explore Jobs<\/span>\s*<\/Link>\s*<\/li>)/;
  
  if (regex.test(content)) {
      content = content.replace(regex, `$1` + addition);
      fs.writeFileSync(path, content);
      console.log(`Updated ${file}`);
  } else {
      console.log(`Could not find Explore Jobs in ${file}`);
  }
}

