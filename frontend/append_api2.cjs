
const fs = require("fs");
const addition = `
// Proposals API (withdraw)
export function withdrawProposal(proposalId) { return request(\`/proposals/\${proposalId}/withdraw\`, { method: "PATCH" }); }
export function unwithdrawProposal(proposalId) { return request(\`/proposals/\${proposalId}/unwithdraw\`, { method: "PATCH" }); }
`;
fs.appendFileSync("c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/services/api.js", addition);
console.log("Appended to api.js again");

