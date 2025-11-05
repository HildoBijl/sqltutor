import { useEffect, useState } from 'react';

import { contentIndex, type ContentMeta, skillExerciseLoaders } from '@/features/content';

import { normalizeSkillExerciseModule } from '../utils/normalizeSkillModule';
import type { SkillExerciseModuleLike } from '../useSkillExerciseState';

type SkillExerciseLoader = (typeof skillExerciseLoaders)[keyof typeof skillExerciseLoaders];
type SkillExerciseModule = Awaited<ReturnType<SkillExerciseLoader>>;

interface SkillContentState {
  isLoading: boolean;
  skillMeta: (ContentMeta & { database?: string }) | null;
  skillModule: SkillExerciseModuleLike | null;
  error: string | null;
}

const initialState: SkillContentState = {
  isLoading: true,
  skillMeta: null,
  skillModule: null,
  error: null,
};

export function useSkillContent(skillId?: string): SkillContentState {
  const [state, setState] = useState<SkillContentState>(initialState);

  useEffect(() => {
    if (!skillId) {
      setState({ isLoading: false, skillMeta: null, skillModule: null, error: null });
      return;
    }

    let cancelled = false;

    const updateState = (partial: Partial<SkillContentState>) => {
      if (cancelled) return;
      setState((prev) => ({ ...prev, ...partial }));
    };

    updateState({ isLoading: true, error: null });

    const entry =
      contentIndex.find((item) => item.type === 'skill' && item.id === skillId) || null;
    updateState({ skillMeta: entry });

    if (!entry) {
      updateState({
        skillModule: null,
        isLoading: false,
        error: 'Skill metadata could not be found.',
      });
      return () => {
        cancelled = true;
      };
    }

    const loader = skillId in skillExerciseLoaders
      ? (skillExerciseLoaders[
          skillId as keyof typeof skillExerciseLoaders
        ] as SkillExerciseLoader)
      : undefined;

    if (!loader) {
      updateState({
        skillModule: null,
        isLoading: false,
        error: 'No exercise module is registered for this skill.',
      });
      return () => {
        cancelled = true;
      };
    }

    loader()
      .then((mod: SkillExerciseModule) => {
        if (cancelled) return;
        updateState({ skillModule: normalizeSkillExerciseModule(mod), error: null });
      })
      .catch((error) => {
        console.error('Failed to load skill content:', error);
        updateState({
          skillModule: null,
          error: 'Failed to load skill exercises. Please try again later.',
        });
      })
      .finally(() => {
        updateState({ isLoading: false });
      });

    return () => {
      cancelled = true;
    };
  }, [skillId]);

  return state;
}
