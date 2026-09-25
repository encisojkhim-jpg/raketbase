const fs = require('fs');
let path = 'c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/TopUsers.jsx';
let content = fs.readFileSync(path, 'utf8');

// The boilerplate to remove starts after `<>` and ends after `</header>`.
let fragmentIdx = content.indexOf('<>');
let headerEnd = content.indexOf('</header>');
let boilerplate = content.substring(fragmentIdx + 2, headerEnd + 9);
content = content.replace(boilerplate, '\n');

// Also remove `<div className="main-wrapper">`'s closing tag, which is the last `</div>` before `</>` of the main component.
// The main component ends at line 228 with `</>`. Let's find the `</>` right before `function FiltersSidebar`.
let filterStart = content.indexOf('function FiltersSidebar');
let fragmentEnd = content.lastIndexOf('</>', filterStart);
let mainClose = content.lastIndexOf('</div>', fragmentEnd);

content = content.substring(0, mainClose) + content.substring(mainClose + 6);
content = content.replace(/\/explore\/\$\{/g, '/jobs/${');
content = content.replace(/\/freelancer\/\$\{/g, '/profile/${');

fs.writeFileSync(path, content);
console.log('TopUsers stripped safely');

