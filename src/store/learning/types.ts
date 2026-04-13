/**
 * Learning store types.
 */

export type StoredExerciseAction = Record<string, unknown>;
export type StoredExerciseState = Record<string, unknown>;

export interface StoredExerciseEvent {
  timestamp: number;
  action: StoredExerciseAction;
  resultingState: StoredExerciseState;
}

export interface StoredExerciseInstance {
  exerciseId: string;
  version: number;
  parameters: Record<string, unknown>;
  createdAt: number;
  events: StoredExerciseEvent[];
  draftInput: unknown;
}

interface BaseModuleState {
  id: string;
  tab?: string;
  lastAccessed?: number;
  understood?: true;
}

export interface ConceptModuleState extends BaseModuleState {}

export interface SkillModuleState extends BaseModuleState {
  numSolved: number;
  exercises: StoredExerciseInstance[];
}

export type ModuleState = ConceptModuleState | SkillModuleState;

export type ModuleType = 'concept' | 'skill';

export interface LearningState {
  modules: Record<string, ModuleState>;
}
