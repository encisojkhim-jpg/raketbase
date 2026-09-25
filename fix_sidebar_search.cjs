const fs = require('fs');
let msgPath = 'c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/pages/Messages.jsx';
let msg = fs.readFileSync(msgPath, 'utf8');

msg = msg.replace(
  /\.msg-search input \{ width: 100%; background: #F4F6F5; border: 1\.5px solid transparent; border-radius: 12px; padding: 9px 14px 9px 38px; font-size: 13\.5px; outline: none; transition: all 0\.2s; color: #0B130F; \}/,
  '.msg-search input { width: 100%; background: #FFFFFF; border: 1px solid #E9EFEF; border-radius: 50rem; padding: 10.4px 20px 10.4px 38px; font-size: 14px; outline: none; transition: all 0.2s ease-in-out; color: #0B130F; }'
);
msg = msg.replace(
  /\.msg-search input:focus \{ background: #fff; border-color: #B4F105; box-shadow: 0 0 0 3px rgba\(180,241,5,0\.15\); \}/,
  '.msg-search input:focus { border-color: rgba(5, 28, 18, 0.25); box-shadow: 0 4px 12px rgba(11, 19, 15, 0.05); }'
);

fs.writeFileSync(msgPath, msg);
console.log('Fixed sidebar search bar style');
