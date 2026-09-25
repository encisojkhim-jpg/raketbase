const fs = require('fs');
let path = 'c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/components/Layout.jsx';
let content = fs.readFileSync(path, 'utf8');

// Replace the main-wrapper line
const search = '<div className="main-wrapper d-flex flex-column" style={{ minHeight: "100vh" }}>';
const replace = '<div className={`main-wrapper d-flex flex-column ${location.pathname.startsWith(\'/messages\') ? \'messages-wrapper\' : \'\'}`} style={location.pathname.startsWith(\'/messages\') ? { height: "100vh", overflow: "hidden" } : { minHeight: "100vh" }}>';
content = content.replace(search, replace);

fs.writeFileSync(path, content);
console.log('Fixed Layout.jsx styling for Messages');
