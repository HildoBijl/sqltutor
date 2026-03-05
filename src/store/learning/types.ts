import type { ExerciseAction, ExerciseStatus } from '@/learning/engine'; // ToDo: remove cyclic dependency. The store should not depend on the learning tools.

import type { StoreSlice } from '../utils';

// Fundamental types for the Learning Store.

export interface LearningState {
  components: Record<string, ComponentState>;
}

export interface LearningPersisted {
  components?: Record<string, Partial<ComponentState> | ComponentState>;
}

export interface LearningActions {
  updateComponent: (id: string, data: Partial<ComponentState>) => void;
  getComponent: (id: string) => ComponentState;
  resetComponent: (id: string, type?: ComponentType) => void;
  getCurrentExerciseInstance: (skillId: string) => StoredExerciseInstance | null;
  getAllExerciseInstances: (skillId: string) => StoredExerciseInstance[];
  getExerciseHistory: (skillId: string, instanceId: string) => StoredExerciseEvent[];
}

export type LearningSlice = StoreSlice<LearningState, LearningPersisted, LearningActions>

// Types for components.

interface BaseComponentState {
  id: string;
  tab?: string;
  lastAccessed?: number;
}

export interface ConceptComponentState extends BaseComponentState {
  type: 'concept';
  understood?: boolean;
}

export interface SkillComponentState extends BaseComponentState {
  type: 'skill';
  numSolved: number;
  instances: Record<ExerciseInstanceId, StoredExerciseInstance>;
  currentInstanceId?: ExerciseInstanceId;
}

export interface PlaygroundComponentState extends BaseComponentState {
  type: 'playground';
  savedQueries?: SavedQuery[];
  history?: QueryHistory[];
}

export type ComponentState =
  | ConceptComponentState
  | SkillComponentState
  | PlaygroundComponentState;

export type ComponentType = ComponentState['type'];

// Types for exercises.

export type ExerciseInstanceId = string;

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

// Types for exercise attempts/submissions.

export interface StoredAttempt<Input = string> {
  index: number;
  input: Input;
  normalizedInput: string;
  status: 'invalid' | 'incorrect' | 'correct';
  timestamp: number;
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
