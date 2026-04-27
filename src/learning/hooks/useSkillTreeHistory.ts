import { useMemo } from 'react';

import {
  normalizeSkillTreeHistory,
  type SkillTreeId,
} from '@/learning/utils/skillTreeTracking';
import { useSkillTreeSettingsStore } from '@/store';

export function useSkillTreeHistory(): SkillTreeId[] {
  const history = useSkillTreeSettingsStore((state) => state.lastVisitedSkillTrees);
  return useMemo(() => normalizeSkillTreeHistory(history), [history]);
}
