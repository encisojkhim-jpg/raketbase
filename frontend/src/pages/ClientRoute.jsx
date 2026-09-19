import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useCurrentUser, wasJustSwitched } from '../utils/currentUser';
import { showToast } from '../utils/toast';

// Guards client-only pages (post a job, my postings). Anyone not currently in
// Client mode is sent to the dashboard. Because it reads the live user, this
// also fires the moment someone switches to Freelancer while on such a page.
export default function ClientRoute() {
  const user = useCurrentUser();
  const blocked = user.active_role !== 'customer';

  useEffect(() => {
    // A deliberate mode switch shows its own "Switched to..." toast instead.
    if (blocked && !wasJustSwitched()) {
      showToast('That page is only available in Client mode. Switch to Client to post jobs and manage postings.');
    }
  }, [blocked]);

  if (blocked) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
