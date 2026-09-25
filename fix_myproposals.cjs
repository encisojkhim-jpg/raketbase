const fs = require('fs');
let myProposalsPath = 'c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/MyProposals.jsx';
let myProposals = fs.readFileSync(myProposalsPath, 'utf8');

// Apply p-0 ONLY to Proposal cards
myProposals = myProposals.replace(
  /<div className="card shadow-sm border-0 mb-4 transition-all">\n\s*<div className="card-body">/g,
  '<div className="card shadow-sm border-0 mb-4 transition-all">\n      <div className="card-body p-0">'
);

fs.writeFileSync(myProposalsPath, myProposals);
console.log('Fixed MyProposals specific card padding');
