import type { ExerciseAction, ExerciseStatus } from '@/features/learning/exerciseEngine';

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
