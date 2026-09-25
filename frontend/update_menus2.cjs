
const fs = require("fs");
const addition = `<li className="sidebar-menu-item">
                  <Link to="/messages" className="sidebar-menu-link">
                    <i className="bi bi-chat-dots"></i><span>Messages</span>
                  </Link>
                </li>
                <li className="sidebar-menu-item">
                  <Link to="/top-users" className="sidebar-menu-link">
                    <i className="bi bi-star"></i><span>Top Freelancers</span>
                  </Link>
                </li>\n                `;

let path = `c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/FreelancerProfileView.jsx`;
let content = fs.readFileSync(path, "utf8");

const regex = /<li className="sidebar-menu-item">\s*<Link to=\{\`\/freelancer\/\$\{user\.user_id \|\| user\.id\}\`\} className=\{\`sidebar-menu-link/g;

if (regex.test(content)) {
    content = content.replace(regex, addition + `$&`);
    fs.writeFileSync(path, content);
    console.log(`Updated FreelancerProfileView.jsx`);
} else {
    console.log(`Could not find target string in FreelancerProfileView.jsx`);
}

