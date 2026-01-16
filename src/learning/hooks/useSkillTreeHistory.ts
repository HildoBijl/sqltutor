import { useEffect, useState } from 'react';

import {
  SKILL_TREE_CHANGE_EVENT,
  getSkillTreeHistory,
  type SkillTreeId,
} from '@/learning/utils/skillTreeTracking';

export function useSkillTreeHistory(): SkillTreeId[] {
  const [history, setHistory] = useState<SkillTreeId[]>(() => getSkillTreeHistory());

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncHistory = () => {
      setHistory(getSkillTreeHistory());
    };

    syncHistory();
    window.addEventListener('storage', syncHistory);
    window.addEventListener(SKILL_TREE_CHANGE_EVENT, syncHistory);

    return () => {
      window.removeEventListener('storage', syncHistory);
      window.removeEventListener(SKILL_TREE_CHANGE_EVENT, syncHistory);
    };
  }, []);

  return history;
}
