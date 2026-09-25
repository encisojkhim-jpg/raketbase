const fs = require('fs');
let pathCss = 'c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/public/assets/css/main.css';
let css = fs.readFileSync(pathCss, 'utf8');

const messageStyles = `
/* Messages Page Specific Overrides */
.messages-wrapper {
    padding: 0 !important;
}
.messages-navbar {
    margin-top: 0 !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
    margin-bottom: 0 !important;
    border-bottom: 1px solid var(--border-light) !important;
}
`;

if (!css.includes('.messages-wrapper {')) {
  css = css + '\n' + messageStyles;
  fs.writeFileSync(pathCss, css);
  console.log('Added message wrapper styles');
}
