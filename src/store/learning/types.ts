/**
 * Learning store types.
 */

import type { StoredExerciseInstance } from '@sqlvalley/exercise-engine/storedState';

interface BaseModuleState {
  id: string;
  tab?: string;
  lastAccessed?: number;
  understood?: true;
}

export type ConceptModuleState = BaseModuleState;

export interface SkillModuleState extends BaseModuleState {
  numSolved: number;
  solvedExerciseIds: string[];
  exercises: StoredExerciseInstance[];
}

export type ModuleState = ConceptModuleState | SkillModuleState;

export type ModuleType = 'concept' | 'skill';

export interface LearningState {
  modules: Record<string, ModuleState>;
}
