const fs = require('fs');
let content = fs.readFileSync('c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/Dashboard.jsx', 'utf8');

content = content.replace(/<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/>\s*\);\s*\}/, 
`</div>
          </div>
          </>
        )}
      </div>
    </>
  );
}`);

fs.writeFileSync('c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/Dashboard.jsx', content);
