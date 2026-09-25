const fs = require('fs');
let path = 'c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/TopUsers.jsx';
let content = fs.readFileSync(path, 'utf8');

let hEnd = content.indexOf('</header>');
if (hEnd !== -1) {
  let nextDiv = content.indexOf('</div>', hEnd);
  if (nextDiv !== -1 && nextDiv - hEnd < 20) {
    content = content.substring(0, nextDiv) + content.substring(nextDiv + 6);
    fs.writeFileSync(path, content);
  }
}
