const fs = require('fs');
let layoutPath = 'c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/components/Layout.jsx';
let layout = fs.readFileSync(layoutPath, 'utf8');

// Change main-wrapper padding based on route
layout = layout.replace(
  /className=\{\`main-wrapper d-flex flex-column \$\{location\.pathname\.startsWith\(\'\/messages\'\) \? \'messages-wrapper\' : \'\'\}\`\} style=\{location\.pathname\.startsWith\(\'\/messages\'\) \? \{ height: "100vh", overflow: "hidden" \} : \{ minHeight: "100vh" \}\}/,
  'className={`main-wrapper d-flex flex-column ${location.pathname.startsWith(\'/messages\') ? \'messages-wrapper\' : \'\'}`} style={location.pathname.startsWith(\'/messages\') ? { height: "100vh", overflow: "hidden", padding: 0 } : { minHeight: "100vh" }}'
);

// Change navbar-custom margin-bottom based on route
layout = layout.replace(
  /<header className="navbar-custom flex-shrink-0" style=\{\{ position: "sticky", top: 0, zIndex: 1020 \}\}>/,
  '<header className="navbar-custom flex-shrink-0" style={{ position: "sticky", top: 0, zIndex: 1020, marginBottom: location.pathname.startsWith(\'/messages\') ? 0 : \'2rem\', marginTop: location.pathname.startsWith(\'/messages\') ? 0 : \'-2rem\', marginLeft: location.pathname.startsWith(\'/messages\') ? 0 : \'-2.5rem\', marginRight: location.pathname.startsWith(\'/messages\') ? 0 : \'-2.5rem\' }}>'
);

fs.writeFileSync(layoutPath, layout);
console.log('Fixed Layout spacing for messages');
