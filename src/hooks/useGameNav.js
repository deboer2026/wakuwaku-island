import { useEffect } from 'react';

export function useGameNav(navigate) {
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === 'goHome') { navigate('/'); return; }
      if (e.data?.type === 'goBack') {
        let internal = false;
        try { internal = sessionStorage.getItem('ww_nav_internal') === '1'; } catch { /* storage is optional */ }
        navigate(internal ? -1 : '/');
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [navigate]);
}
