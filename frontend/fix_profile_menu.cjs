const fs = require('fs');

const addition1 = `<li className="sidebar-menu-item">
                  <Link to="/messages" className="sidebar-menu-link">
                    <i className="bi bi-chat-dots"></i><span>Messages</span>
                  </Link>
                </li>
                <li className="sidebar-menu-item">
                  <Link to="/top-users" className="sidebar-menu-link">
                    <i className="bi bi-star"></i><span>Top Freelancers</span>
                  </Link>
                </li>
                `;

let path = 'c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/FreelancerProfileView.jsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('to="/messages"')) {
  // Use a more flexible regex that allows any characters after className="sidebar-menu-link
  const regex1 = /<li className="sidebar-menu-item">\s*<Link to=\{\`\/freelancer\/\$\{user\.user_id \|\| user\.id\}\`\} className=[^>]+>\s*<i className="bi bi-person"><\/i>\s*<span>My Account<\/span>/g;
  content = content.replace(regex1, addition1 + '$&');
  fs.writeFileSync(path, content);
  console.log('Fixed menus in FreelancerProfileView.jsx');
} else {
  console.log('Already has messages');
}

