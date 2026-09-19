// useThemeSync — applies the Client/Freelancer color palette app-wide.
// Sets <html data-mode="client|freelancer">, which index.css uses to swap
// --color-accent/--color-bg/--color-panel/--color-border via CSS variables.
// Runs on every render of the mounting component (via user + route changes)
// so it reacts to mode switches, login, and logout without a page reload.
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useCurrentUser } from './currentUser';

export function useThemeSync() {
  const user = useCurrentUser();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const root = document.documentElement;

    // Logged out (or on an auth page after logout): fall back to the
    // neutral default palette defined directly in @theme.
    if (!token) {
      root.removeAttribute('data-mode');
      return;
    }

    const mode = user.active_role === 'freelancer' ? 'freelancer' : 'client';
    root.setAttribute('data-mode', mode);
  }, [user, location.pathname]);
}
