import type { ExerciseId, ExerciseVersion } from '@sqlvalley/exercise-engine';
import type { SimpleExerciseCheckResult, SimpleExerciseFeedbackType } from '@sqlvalley/exercise-engine';
import type { CompareOptions } from '@sqlvalley/sql-grading';

export interface SimpleSQLExerciseDefinition<Parameters extends Record<string, unknown>> {
  exerciseId: ExerciseId;
  version: ExerciseVersion;
  generateParameters: (
    moduleContext: unknown,
    context?: { previousParameters?: Parameters | null },
  ) => Parameters;
  problem: string | ((parameters: Parameters) => string);
  solution: string | ((parameters: Parameters) => string);
  comparisonOptions?: CompareOptions;
}

export interface SimpleSQLCheckResult extends SimpleExerciseCheckResult {
  feedbackType: SimpleExerciseFeedbackType;
}

/** A SQL exercise definition plus a display title. Tables live on the SqlModuleProvider. */
export interface SimpleSQLExerciseSpec<Parameters extends Record<string, unknown>>
  extends SimpleSQLExerciseDefinition<Parameters> {
  title?: string;
}
