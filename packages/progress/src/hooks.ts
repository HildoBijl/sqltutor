import { useCallback, useMemo } from 'react';

import { getModules, type SkillTree } from '@sqlvalley/skill-tree-definition';

import {
  getRawModuleCompletion,
  processModuleCompletion,
} from './logic';
import type { ModuleProgressState } from './types';

function useRawModuleCompletion<Id extends string>(
  skillTree: SkillTree<Id>,
  moduleStates: Record<string, ModuleProgressState>,
) {
  return useMemo(
    () => getRawModuleCompletion(skillTree, moduleStates),
    [skillTree, moduleStates],
  );
}

export function useModuleCompletion<Id extends string>(
  skillTree: SkillTree<Id>,
  moduleStates: Record<string, ModuleProgressState>,
) {
  const rawCompletion = useRawModuleCompletion(skillTree, moduleStates);

  return useMemo(
    () => processModuleCompletion(skillTree, rawCompletion),
    [skillTree, rawCompletion],
  );
}

export function useModuleProgress<Id extends string>(
  skillTree: SkillTree<Id>,
  moduleStates: Record<string, ModuleProgressState>,
) {
  const modules = useMemo(() => getModules(skillTree), [skillTree]);
  const concepts = useMemo(
    () => modules.filter((module) => module.type === 'concept'),
    [modules],
  );
  const skills = useMemo(
    () => modules.filter((module) => module.type === 'skill'),
    [modules],
  );
  const processed = useModuleCompletion(skillTree, moduleStates);

  const isCompleted = useCallback(
    (id: Id) => processed.completed.has(id),
    [processed],
  );

  const getProgress = useCallback(
    (id: Id) => {
      const progress = processed.skillProgress[id];
      if (progress === undefined) return null;
      return `${progress}/${processed.requiredCount}`;
    },
    [processed],
  );

  const completedConcepts = useMemo(
    () =>
      concepts.filter((concept) => processed.completed.has(concept.id)).length,
    [concepts, processed],
  );

  const completedSkills = useMemo(
    () => skills.filter((skill) => processed.completed.has(skill.id)).length,
    [processed, skills],
  );

  return {
    concepts,
    skills,
    isCompleted,
    getProgress,
    completedConcepts,
    completedSkills,
  };
}
