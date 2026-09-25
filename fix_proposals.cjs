const fs = require('fs');
let path = 'c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/MyProposals.jsx';
let content = fs.readFileSync(path, 'utf8');

// Header
content = content.replace(/<h1 className="fw-bold fs-3 mb-1">My Proposals<\/h1>/, '<h2 className="fw-bold mb-1">My Proposals</h2>');
content = content.replace(/Track every bid you've sent, and manage the ones still in play./, 'Track every bid you\'ve sent, and manage the ones still in play.'); // just in case

// Filter buttons
content = content.replace(/className=\{\`btn btn-sm rounded-pill px-3 py-1 \$\{/g, 'className={`btn rounded-pill px-4 py-2 flex-shrink-0 fw-medium ${');
content = content.replace(/isActive \? \'text-white border-0\' : \'btn-light border text-dark\'/g, 'isActive ? \'text-white border-0\' : \'category-filter-btn\'');

// Card Header link
content = content.replace(/className="fw-bold fs-5 text-dark text-decoration-none"/g, 'className="card-title fw-bold mb-1 text-dark text-decoration-none"');

// Action buttons
content = content.replace(/className="btn btn-outline-danger btn-sm rounded-3 px-3 py-2"/g, 'className="btn btn-outline-danger btn-sm rounded-pill px-4 py-2"');
content = content.replace(/className="btn btn-dark btn-sm rounded-3 px-3 py-2 fw-medium"/g, 'className="btn btn-dark btn-sm rounded-pill px-4 py-2 fw-medium"');
content = content.replace(/className="btn btn-outline-dark btn-sm rounded-3 px-3 py-2 fw-medium"/g, 'className="btn btn-outline-dark btn-sm rounded-pill px-4 py-2 fw-medium"');
content = content.replace(/className="btn btn-outline-secondary btn-sm rounded-3 px-3 py-2 fw-medium"/g, 'className="btn btn-outline-secondary btn-sm rounded-pill px-4 py-2 fw-medium"');

fs.writeFileSync(path, content);
console.log('Fixed MyProposals ui');
