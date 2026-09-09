import type { Module, SkillTree } from './types';

export function getModules<Id extends string>(skillTree: SkillTree<Id>): Module<Id>[] {
  return Object.values(skillTree) as Module<Id>[];
}
