const fs = require('fs');
let explorePath = 'c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/Explore.jsx';
let explore = fs.readFileSync(explorePath, 'utf8');

// The template card class already has padding, so when we use Bootstrap's card-body, it creates double padding.
// Let's add p-0 to card-body if it's inside a card.
explore = explore.replace(/className="card-body"/g, 'className="card-body p-0"');
explore = explore.replace(/className="card-body d-flex flex-column"/g, 'className="card-body d-flex flex-column p-0"');
explore = explore.replace(/style=\{\{ padding: "1rem" \}\}/g, 'style={{ padding: 0 }}');

fs.writeFileSync(explorePath, explore);
console.log('Fixed double padding in Explore');
