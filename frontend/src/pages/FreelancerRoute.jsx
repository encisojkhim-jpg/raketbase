import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useCurrentUser, wasJustSwitched } from '../utils/currentUser';
import { showToast } from '../utils/toast';

// Guards freelancer-only pages (profile, my proposals). Anyone not currently in
// Freelancer mode is sent to the dashboard. Because it reads the live user, this
// also fires the moment someone switches to Client while on such a page.
export default function FreelancerRoute() {
  const user = useCurrentUser();
  const blocked = user.active_role !== 'freelancer';

  useEffect(() => {
    // A deliberate mode switch shows its own "Switched to..." toast instead.
    if (blocked && !wasJustSwitched()) {
      showToast('That page is only available in Freelancer mode. Switch to Freelancer to manage your profile and proposals.');
    }
  }, [blocked]);

  if (blocked) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
