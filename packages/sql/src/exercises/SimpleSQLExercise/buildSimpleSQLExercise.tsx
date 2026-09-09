import { buildSimpleExercise, type AnyExerciseDefinition } from '@sqlvalley/exercise-engine';

import { normalizeSqlInput, validateSqlInput } from '@sqlvalley/sql-grading';
import type { SqlModuleContext } from '../SqlModule';
import { createSQLProblem, createSQLSolution, SQLExerciseInput, SQLExerciseOutput } from './views';
import type { SimpleSQLCheckResult, SimpleSQLExerciseSpec } from './types';

/**
 * Turns one SQL exercise into an ExerciseDefinition, on top of buildSimpleExercise.
 * Its checkInput delegates grading to the SQL module's grade() from moduleContext.
 */
export function buildSimpleSQLExercise<Parameters extends Record<string, unknown>>(
  spec: SimpleSQLExerciseSpec<Parameters>,
): AnyExerciseDefinition {
  const { exerciseId, version, generateParameters, comparisonOptions, title = 'Exercise' } = spec;

  return buildSimpleExercise<Parameters, string, SimpleSQLCheckResult>({
    exerciseId,
    version,
    generateParameters,
    initialInput: '',
    normalizeInput: normalizeSqlInput,
    isInputEmpty: (input) => !input.trim(),
    validateInput: ({ input }) => {
      const validation = validateSqlInput(input);
      return {
        valid: validation.ok,
        feedback: validation.message,
        feedbackType: validation.ok ? undefined : 'warning',
      };
    },
    checkInput: ({ parameters, input, moduleContext }) =>
      (moduleContext as SqlModuleContext).grade(
        input,
        resolveValue(spec.solution, parameters),
        comparisonOptions,
      ),
    Problem: createSQLProblem(title, (parameters) => resolveValue(spec.problem, parameters)),
    Input: SQLExerciseInput,
    Solution: createSQLSolution((parameters) => resolveValue(spec.solution, parameters)),
    Output: SQLExerciseOutput,
  });
}

function resolveValue<Parameters extends Record<string, unknown>>(
  value: string | ((parameters: Parameters) => string),
  parameters: Parameters,
): string {
  return typeof value === 'function' ? value(parameters) : value;
}
