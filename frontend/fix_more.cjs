const fs = require('fs');

function fixFile(file, regexStr, replacement) {
  let path = `c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/${file}`;
  let content = fs.readFileSync(path, 'utf8');
  let regex = new RegExp(regexStr, 'g');
  content = content.replace(regex, replacement);
  fs.writeFileSync(path, content);
}

// FreelancerProfileView.jsx: replace `</div>\s*</div>\s*</div>\s*\{\/\* -- Main Content` with TWO divs.
fixFile('FreelancerProfileView.jsx', '<\\/div>\\s*<\\/div>\\s*<\\/div>\\s*\\{\\/\\*', '</div>\n        </div>\n\n        {/*');

// Let's check TopUsers, Messages, MyProposals.
// TopUsers probably has `</div>\s*<div className="main-wrapper">` since it didn't match fix_divs2 if it was different. Wait, fix_divs2 DID run on TopUsers.
// If TopUsers has `Unexpected token }`, maybe it has an EXTRA `</div>` at the end? Or missing?
