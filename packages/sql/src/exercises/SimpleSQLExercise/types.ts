import type { ExerciseId, ExerciseVersion, GenerateExerciseParametersContext } from '@sqlvalley/exercise-engine';
import type { SimpleExerciseCheckResult, SimpleExerciseFeedbackType } from '@sqlvalley/exercise-engine';
import type { CompareOptions } from '@sqlvalley/sql-grading';

export type SQLTemplateValue<Parameters extends Record<string, unknown>> =
  string | ((parameters: Parameters) => string);

export interface SQLExerciseScenario<Parameters extends Record<string, unknown>> {
  id: string;
  label?: string;
  parameters?: Partial<Parameters>;
  problem?: SQLTemplateValue<Parameters>;
  solution?: SQLTemplateValue<Parameters>;
  practiceIntro?: SQLTemplateValue<Parameters>;
  successPayoff?: SQLTemplateValue<Parameters>;
}

export interface SQLExerciseRuntimeVariant {
  seed: string;
  subject: 'SQL';
  scenarioId?: string;
  promptDetail: string;
  practiceIntro: string;
  successPayoff: string;
  tables: string[];
  skillFocus: string[];
  generatedProblem?: string;
  generatedSolution?: string;
}

export interface SQLExerciseRuntimeParameters {
  __sqlExercise?: SQLExerciseRuntimeVariant;
}

export interface SimpleSQLExerciseDefinition<Parameters extends Record<string, unknown>> {
  exerciseId: ExerciseId;
  version: ExerciseVersion;
  generateParameters?: (
    moduleContext: unknown,
    context: GenerateExerciseParametersContext<Parameters>,
  ) => Parameters;
  problem: SQLTemplateValue<Parameters>;
  solution: SQLTemplateValue<Parameters>;
  comparisonOptions?: CompareOptions;
  subject?: 'SQL';
  tables?: readonly string[];
  skillFocus?: readonly string[];
  character?: string;
  scenarios?: readonly SQLExerciseScenario<Parameters>[];
  promptDetails?: readonly SQLTemplateValue<Parameters>[];
  practiceIntros?: readonly SQLTemplateValue<Parameters>[];
  successPayoffs?: readonly SQLTemplateValue<Parameters>[];
}

export interface SimpleSQLCheckResult extends SimpleExerciseCheckResult {
  feedbackType: SimpleExerciseFeedbackType;
}

/** A SQL exercise definition plus a display title. Tables live on the SqlModuleProvider. */
export interface SimpleSQLExerciseSpec<Parameters extends Record<string, unknown>>
  extends SimpleSQLExerciseDefinition<Parameters> {
  title?: string;
}
