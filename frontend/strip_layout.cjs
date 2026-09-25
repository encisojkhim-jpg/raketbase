const fs = require('fs');
const files = ['Dashboard.jsx', 'Explore.jsx', 'JobDetail.jsx', 'Profile.jsx', 'Messages.jsx', 'MyProposals.jsx', 'TopUsers.jsx'];

for (let file of files) {
  let path = 'c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/' + file;
  if (!fs.existsSync(path)) continue;
  let content = fs.readFileSync(path, 'utf8');

  // Find where the real page content starts
  // It usually starts after `</header>`
  let headerEndIndex = content.indexOf('</header>');
  
  if (headerEndIndex !== -1) {
    let startIdx = headerEndIndex + 9; // after </header>

    // Find the return statement
    let returnIdx = content.indexOf('return (');
    if (returnIdx === -1) returnIdx = content.indexOf('return(');
    
    // Find the fragment open `<>` after return
    let fragmentIdx = content.indexOf('<>', returnIdx);
    
    if (fragmentIdx !== -1 && fragmentIdx < headerEndIndex) {
      // The boilerplate goes from `fragmentIdx + 2` down to `startIdx`
      let boilerplate = content.substring(fragmentIdx + 2, startIdx);
      content = content.replace(boilerplate, '\n');
    }

    // Now remove the `</div>` closing `main-wrapper` right before the end
    // It's the `</div>` before `</>`
    let endFragment = content.lastIndexOf('</>');
    if (endFragment !== -1) {
      let mainWrapperClose = content.lastIndexOf('</div>', endFragment);
      if (mainWrapperClose !== -1) {
        content = content.substring(0, mainWrapperClose) + content.substring(mainWrapperClose + 6);
      }
    }

    // Rename FreelancerProfile to JobDetail
    if (file === 'JobDetail.jsx') {
      content = content.replace('function FreelancerProfile', 'function JobDetail');
    }
    // Rename FreelancerProfileView to Profile
    if (file === 'Profile.jsx') {
      content = content.replace('function FreelancerProfileView', 'function Profile');
    }
    
    // In all files, replace links:
    content = content.replace(/\/explore\/\$\{/g, '/jobs/${');
    content = content.replace(/\/freelancer\/\$\{/g, '/profile/${');
    content = content.replace(/\/public-profile\/\$\{/g, '/profile/${');

    fs.writeFileSync(path, content);
  }
}
console.log('Stripped boilerplate and merged references');

