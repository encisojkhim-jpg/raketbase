const fs = require('fs');
const files = ['Dashboard.jsx', 'Explore.jsx', 'FreelancerProfile.jsx', 'FreelancerProfileView.jsx'];

const addition1 = `<li className="sidebar-menu-item">
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

const addition2 = `
                {user.active_role === "freelancer" && (
                  <li className="sidebar-menu-item">
                    <Link to="/my-proposals" className="sidebar-menu-link">
                      <i className="bi bi-file-earmark-text"></i>
                      <span>My Proposals</span>
                    </Link>
                  </li>
                )}`;

for (let file of files) {
  let path = 'c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/' + file;
  if (!fs.existsSync(path)) continue;
  let content = fs.readFileSync(path, 'utf8');
  
  if (!content.includes('to="/messages"')) {
    // Insert before My Account
    const regex1 = /<li className="sidebar-menu-item">\s*<Link to=\{\`\/freelancer\/\$\{user\.user_id \|\| user\.id\}\`\} className="sidebar-menu-link">\s*<i className="bi bi-person"><\/i>\s*<span>My Account<\/span>/g;
    content = content.replace(regex1, addition1 + '$&');
  }

  if (!content.includes('to="/my-proposals"')) {
    // Insert after Explore Jobs
    const regex2 = /(<span>Explore Jobs<\/span>\s*<\/Link>\s*<\/li>)/;
    content = content.replace(regex2, `$1` + addition2);
  }

  fs.writeFileSync(path, content);
}
console.log('Menus inserted safely');

