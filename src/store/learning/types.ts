/**
 * Learning store types.
 */

import type { ExerciseAction, ExerciseStatus } from '@/learning/engine';

export type ExerciseInstanceId = string;

export interface StoredAttempt<Input = string> {
  index: number;
  input: Input;
  normalizedInput: string;
  status: 'invalid' | 'incorrect' | 'correct';
  timestamp: number;
}

export interface StoredExerciseState<Exercise = unknown, Input = string> {
  exercise: Exercise;
  status: ExerciseStatus;
  attempts: StoredAttempt<Input>[];
  generatedAt?: number;
}

export interface StoredExerciseEvent {
  timestamp: number;
  action: ExerciseAction<unknown, unknown>;
  resultingState: StoredExerciseState;
}

export interface StoredExerciseInstance {
  id: ExerciseInstanceId;
  skillId: string;
  createdAt: number;
  completedAt?: number;
  finalStatus: ExerciseStatus;
  events: StoredExerciseEvent[];
}

export interface QueryHistory {
  query: string;
  timestamp: number;
  success: boolean;
  rowCount?: number;
}

export interface SavedQuery {
  name: string;
  query: string;
}

interface BaseModuleState {
  id: string;
  tab?: string;
  lastAccessed?: number;
}

export interface ConceptModuleState extends BaseModuleState {
  type: 'concept';
  understood?: boolean;
}

export interface SkillModuleState extends BaseModuleState {
  type: 'skill';
  numSolved: number;
  instances: Record<ExerciseInstanceId, StoredExerciseInstance>;
  currentInstanceId?: ExerciseInstanceId;
}

export interface PlaygroundModuleState extends BaseModuleState {
  type: 'playground';
  savedQueries?: SavedQuery[];
  history?: QueryHistory[];
}

export type ModuleState =
  | ConceptModuleState
  | SkillModuleState
  | PlaygroundModuleState;

export type ModuleType = ModuleState['type'];

export interface LearningState {
  modules: Record<string, ModuleState>;
}
