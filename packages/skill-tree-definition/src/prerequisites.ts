import type { SkillTree } from './types';

// Get the full transitive prerequisite chain of a module, in learn order:
// each direct prerequisite is followed by its own prerequisites.
export function getPrerequisites<Id extends string>(
  skillTree: SkillTree<Id>,
  moduleId: Id,
): Set<Id> {
  const prerequisites = new Set<Id>();

  const collect = (id: Id) => {
    for (const prerequisiteId of skillTree[id]?.prerequisites ?? []) {
      if (!prerequisites.has(prerequisiteId)) {
        prerequisites.add(prerequisiteId);
        collect(prerequisiteId);
      }
    }
  };
  collect(moduleId);

  return prerequisites;
}

// Get all modules on the path towards a goal: its prerequisites plus the goal itself.
export function getGoalPath<Id extends string>(
  skillTree: SkillTree<Id>,
  goalId: Id,
): Set<Id> {
  const path = getPrerequisites(skillTree, goalId);
  path.add(goalId);
  return path;
}

export function arePrerequisitesCompleted<Id extends string>(
  skillTree: SkillTree<Id>,
  moduleId: Id,
  isCompleted: (id: Id) => boolean,
): boolean {
  return skillTree[moduleId]?.prerequisites.every((id) => isCompleted(id)) ?? true;
}

// A module is ready to learn when it is not yet completed itself,
// but all of its direct prerequisites are.
export function isReadyToLearn<Id extends string>(
  skillTree: SkillTree<Id>,
  moduleId: Id,
  isCompleted: (id: Id) => boolean,
): boolean {
  return (
    !isCompleted(moduleId) &&
    arePrerequisitesCompleted(skillTree, moduleId, isCompleted)
  );
}

export interface GoalProgress<Id extends string = string> {
  completedCount: number;
  totalCount: number;
  nextStepId: Id | null;
  nextStepName: string | null;
}

// Summarize progress towards a goal module: how much of its path is
// completed, and which module on the path is the next one to learn.
export function getGoalProgress<Id extends string>(
  skillTree: SkillTree<Id>,
  goalId: Id,
  isCompleted: (id: Id) => boolean,
): GoalProgress<Id> {
  const path = [...getGoalPath(skillTree, goalId)];
  const nextStepId =
    path.find((id) => isReadyToLearn(skillTree, id, isCompleted)) ?? null;

  return {
    completedCount: path.filter((id) => isCompleted(id)).length,
    totalCount: path.length,
    nextStepId,
    nextStepName: nextStepId ? (skillTree[nextStepId]?.name ?? null) : null,
  };
}
