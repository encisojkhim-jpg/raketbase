const fs = require('fs');
let myProposalsPath = 'c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/MyProposals.jsx';
let myProposals = fs.readFileSync(myProposalsPath, 'utf8');

myProposals = myProposals.replace(/className="card-body p-4"/g, 'className="card-body p-0"');

fs.writeFileSync(myProposalsPath, myProposals);
