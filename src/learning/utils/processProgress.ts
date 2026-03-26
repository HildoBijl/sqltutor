import type { Module } from '@/curriculum';
import type { ModuleState, SkillModuleState } from '@/store';
import { EXERCISES_TO_COMPLETE } from '@/constants';

interface ProcessedProgress {
  completed: Set<string>;
  skillProgress: Record<string, number>;
  requiredCount: number;
}

function isSkillModuleState(module: ModuleState | undefined): module is SkillModuleState {
  if (!module) return false;
  return (
    typeof (module as { numSolved?: unknown }).numSolved === 'number' ||
    Array.isArray((module as { exercises?: unknown }).exercises)
  );
}

export function processProgress(
  moduleItems: Module[],
  modules: Record<string, ModuleState>,
  requiredCount: number = EXERCISES_TO_COMPLETE,
): ProcessedProgress {
  const moduleById: Record<string, Module> = {};
  for (const item of moduleItems) {
    moduleById[item.id] = item;
  }

  const baseCompleted: string[] = [];
  const skillProgress: Record<string, number> = {};

  for (const item of moduleItems) {
    const module = modules[item.id];

    if (item.type === 'concept') {
      if (module && !isSkillModuleState(module) && module.understood === true) {
        baseCompleted.push(item.id);
      }
      continue;
    }

    if (item.type === 'skill') {
      const solved = isSkillModuleState(module) ? module.numSolved ?? 0 : 0;
      const understood = isSkillModuleState(module) ? module.understood === true : false;
      if (solved > 0) {
        skillProgress[item.id] = solved;
      }
      if (understood || solved >= requiredCount) {
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
