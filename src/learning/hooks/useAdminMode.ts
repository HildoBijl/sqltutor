import { useEffect, useState } from 'react';

export function useAdminMode() {
  const [isAdmin, setIsAdmin] = useState(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(window.localStorage.getItem('admin'));
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncAdminFlag = () => {
      setIsAdmin(Boolean(window.localStorage.getItem('admin')));
    };

    syncAdminFlag();
    window.addEventListener('storage', syncAdminFlag);
    window.addEventListener('admin-mode-change', syncAdminFlag);

    return () => {
      window.removeEventListener('storage', syncAdminFlag);
      window.removeEventListener('admin-mode-change', syncAdminFlag);
    };
  }, []);

  return isAdmin;
}

