import type { ComponentType } from 'react';

import type { ExerciseId, ExerciseVersion } from '../storedState';
import type {
  SimpleExerciseCheckResult,
  SimpleExerciseInputProps,
  SimpleExerciseOutputProps,
  SimpleExerciseProblemProps,
  SimpleExerciseSolutionProps,
  SimpleExerciseValidationResult,
} from './types';

/** The render side of a simple exercise: what SimpleExerciseComponent needs. */
export interface SimpleExerciseRenderSpec<
  Parameters extends Record<string, unknown>,
  Input,
  CheckResult = SimpleExerciseCheckResult,
> {
  initialInput: Input;
  normalizeInput?: (input: Input) => string;
  isInputEmpty?: (input: Input) => boolean;
  getSolutionInput?: (parameters: Parameters) => Input;
  Problem: ComponentType<SimpleExerciseProblemProps<Parameters>>;
  Input: ComponentType<SimpleExerciseInputProps<Parameters, Input>>;
  Solution: ComponentType<SimpleExerciseSolutionProps<Parameters>>;
  Prompt?: ComponentType<SimpleExerciseProblemProps<Parameters>>;
  Payoff?: ComponentType<{ parameters: Parameters; result: CheckResult }>;
  Output?: ComponentType<SimpleExerciseOutputProps<Parameters, Input, CheckResult>>;
}

/** Everything needed to describe a single simple exercise, fed to buildSimpleExercise. */
export interface SimpleExerciseSpecification<
  Parameters extends Record<string, unknown>,
  Input,
  CheckResult = SimpleExerciseCheckResult,
> extends SimpleExerciseRenderSpec<Parameters, Input, CheckResult> {
  exerciseId: ExerciseId;
  version: ExerciseVersion;
  generateParameters: (
    moduleContext: unknown,
    context?: { previousParameters?: Parameters | null },
  ) => Parameters;
  validateInput?: (
    args: { parameters: Parameters; input: Input; moduleContext: unknown },
  ) => SimpleExerciseValidationResult | Promise<SimpleExerciseValidationResult>;
  checkInput: (
    args: { parameters: Parameters; input: Input; moduleContext: unknown },
  ) => CheckResult | Promise<CheckResult>;
  isCorrect?: (result: CheckResult) => boolean;
  getFeedback?: (result: CheckResult) => string | undefined;
}
