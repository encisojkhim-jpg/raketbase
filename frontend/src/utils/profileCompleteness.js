// Decides whether a freelancer's profile is "complete" enough to be useful to a
// client reviewing a proposal. This only powers a soft nudge (see
// components/ProfileNudge.jsx) — it never blocks bidding.
export function isProfileComplete(user) {
  const hasBio = Boolean(user?.bio && user.bio.trim().length > 0);
  const hasSkills = Array.isArray(user?.skills) && user.skills.length > 0;
  return hasBio && hasSkills;
}
