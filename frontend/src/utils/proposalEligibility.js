// Decides why (if at all) the current user is blocked from bidding on a job.
// Returns 'own' | 'taken' | 'client_mode' | null. Backend enforces the same rules.
// Pass the user from useCurrentUser() so the result updates live on mode switch.
export function getProposalBlockReason(job, user) {
  const token = localStorage.getItem('token');
  if (!token || !job) return null; // logged-out users keep the existing "log in" flow

  const userId = user?.id || user?.user_id;
  if (userId && job.client_id === userId) return 'own';
  if (job.status && job.status !== 'open') return 'taken';
  if (user?.active_role !== 'freelancer') return 'client_mode';
  return null;
}
