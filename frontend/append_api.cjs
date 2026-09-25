
const fs = require("fs");
const addition = `
// Messages API
export function getConversations() { return request("/conversations"); }
export function getConversationMessages(id) { return request(\`/conversations/\${id}/messages\`); }
export function sendMessage(id, payload) {
  const formData = new FormData();
  if (payload.content) formData.append("content", payload.content);
  if (payload.file) formData.append("file", payload.file);
  const token = localStorage.getItem("token");
  return fetch(\`\${API_URL}/conversations/\${id}/messages\`, {
    method: "POST",
    headers: { Authorization: \`Bearer \${token}\` },
    body: formData
  }).then(async r => {
    const data = await r.json().catch(()=>({}));
    if(!r.ok) throw new Error(data.message || data.error);
    return data;
  });
}
export function getAttachmentDownloadUrl(id, messageId) {
  return request(\`/conversations/\${id}/messages/\${messageId}/download\`);
}
export function confirmDeleteConversation(id) {
  return request(\`/conversations/\${id}/delete-confirm\`, { method: "POST" });
}
export function cancelDeleteConversation(id) {
  return request(\`/conversations/\${id}/delete-cancel\`, { method: "POST" });
}

// Top Users API
export function getTopUsers() { return request("/top-users"); }

// Profile & Ratings API
export function getUserReviews(userId, role) {
  const query = role ? \`?role=\${role}\` : "";
  return request(\`/reviews/users/\${userId}\${query}\`);
}
export function uploadAvatar(file) {
  const formData = new FormData();
  formData.append("avatar", file);
  const token = localStorage.getItem("token");
  return fetch(\`\${API_URL}/auth/profile/avatar\`, {
    method: "POST",
    headers: { Authorization: \`Bearer \${token}\` },
    body: formData
  }).then(async r => {
    const data = await r.json().catch(()=>({}));
    if(!r.ok) throw new Error(data.message || data.error);
    return data;
  });
}
export function removeAvatar() {
  return request("/auth/profile/avatar", { method: "DELETE" });
}
`;
fs.appendFileSync("c:/Users/mspau/OneDrive/Documents/GitHub/raketbase/frontend/src/services/api.js", addition);
console.log("Appended to api.js");

