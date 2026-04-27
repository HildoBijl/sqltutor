import { useEffect, useState } from 'react';

const ADMIN_MODE_STORAGE_KEY = 'admin';
const ADMIN_MODE_CHANGE_EVENT = 'admin-mode-change';

function canUseWindow(): boolean {
  return typeof window !== 'undefined';
}

export function isAdminModeEnabled(): boolean {
  if (!canUseWindow()) {
    return false;
  }

  try {
    return Boolean(window.localStorage.getItem(ADMIN_MODE_STORAGE_KEY));
  } catch {
    return false;
  }
}

export function setAdminModeEnabled(enabled: boolean): void {
  if (!canUseWindow()) {
    return;
  }

  try {
    if (enabled) {
      window.localStorage.setItem(ADMIN_MODE_STORAGE_KEY, 'true');
    } else {
      window.localStorage.removeItem(ADMIN_MODE_STORAGE_KEY);
    }

    window.dispatchEvent(
      new CustomEvent(ADMIN_MODE_CHANGE_EVENT, { detail: { enabled } }),
    );
  } catch (error) {
    console.error('Failed to update admin mode:', error);
  }
}

export function toggleAdminMode(): boolean {
  const next = !isAdminModeEnabled();
  setAdminModeEnabled(next);
  return next;
}

export function useAdminMode(): boolean {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => isAdminModeEnabled());

  useEffect(() => {
    if (!canUseWindow()) {
      return;
    }

    const syncAdminMode = () => {
      setIsAdmin(isAdminModeEnabled());
    };

    syncAdminMode();
    window.addEventListener('storage', syncAdminMode);
    window.addEventListener(ADMIN_MODE_CHANGE_EVENT, syncAdminMode);

    return () => {
      window.removeEventListener('storage', syncAdminMode);
      window.removeEventListener(ADMIN_MODE_CHANGE_EVENT, syncAdminMode);
    };
  }, []);

  return isAdmin;
}

