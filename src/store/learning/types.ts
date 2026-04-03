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
