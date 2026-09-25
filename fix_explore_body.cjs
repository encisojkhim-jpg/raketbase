const fs = require('fs');
let explorePath = 'c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/Explore.jsx';
let explore = fs.readFileSync(explorePath, 'utf8');

explore = explore.replace(/<div className="card-body d-flex flex-column">/g, '<div className="card-body d-flex flex-column p-0">');

fs.writeFileSync(explorePath, explore);
