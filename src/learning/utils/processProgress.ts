import type { ModuleMeta } from '@/curriculum';
import type { ComponentState } from '@/learning/store';
import { EXERCISES_TO_COMPLETE } from '@/constants';

interface ProcessedProgress {
  completed: Set<string>;
  skillProgress: Record<string, number>;
  requiredCount: number;
}

export function processProgress(
  moduleItems: ModuleMeta[],
  components: Record<string, ComponentState>,
  requiredCount: number = EXERCISES_TO_COMPLETE,
): ProcessedProgress {
  const moduleById: Record<string, ModuleMeta> = {};
  for (const item of moduleItems) {
    moduleById[item.id] = item;
  }

  const baseCompleted: string[] = [];
  const skillProgress: Record<string, number> = {};

  for (const item of moduleItems) {
    const component = components[item.id];

    if (item.type === 'concept') {
      if (component?.type === 'concept' && component.understood === true) {
        baseCompleted.push(item.id);
      }
      continue;
    }

    if (item.type === 'skill') {
      const solved = component?.type === 'skill' ? component.numSolved ?? 0 : 0;
      if (solved > 0) {
        skillProgress[item.id] = solved;
      }
      if (solved >= requiredCount) {
        baseCompleted.push(item.id);
      }
    }
  }

  const completed = new Set<string>(baseCompleted);
  const visited = new Set<string>();

  const addPrerequisites = (id: string) => {
    if (visited.has(id)) return;
    visited.add(id);

    const item = moduleById[id];
    if (!item?.prerequisites?.length) return;

    for (const prereqId of item.prerequisites) {
      completed.add(prereqId);
      addPrerequisites(prereqId);
    }
  };

  for (const id of baseCompleted) {
    addPrerequisites(id);
  }

  return { completed, skillProgress, requiredCount };
}
