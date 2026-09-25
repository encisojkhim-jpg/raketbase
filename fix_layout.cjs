const fs = require('fs');
let path = 'c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/components/Layout.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/to=\{\`\/freelancer\/\$\{user\.user_id \|\| user\.id\}\`\}/g, 'to={`/profile/${user.user_id || user.id}`}');
content = content.replace(/<div className="main-wrapper">/, '<div className="main-wrapper d-flex flex-column" style={{ minHeight: "100vh" }}>');

fs.writeFileSync(path, content);
console.log('Fixed Layout.jsx');
