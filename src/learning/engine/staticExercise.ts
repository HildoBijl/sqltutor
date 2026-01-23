import { compareQueryResults, type CompareOptions } from './resultComparison';
import type {
  ExecutionResult,
  QueryResult,
  Utils,
  ValidationResult,
  VerificationResult,
} from '@/curriculum/utils/types';

export interface StaticExercise {
  id: string;
  version?: number;
  prompt: string;
  solution: string;
  description?: string;
  comparisonOptions?: CompareOptions;
}

export interface ExerciseState {
  id: string;
  version: number;
  prompt: string;
  solution: string;
  description: string;
  comparisonOptions?: CompareOptions;
}

const MESSAGES = {
  validation: {
    syntaxError: 'SQL error: {error}',
    noResultSet: 'Query returned no data.',
  },
  verification: {
    correct: 'Correct!',
    mismatch: 'The query result does not match the expected output.',
    unknown: 'Unable to verify results. Please try again.',
  },
} as const;

const DEFAULT_VERSION = 1;

function formatMessage(template: string, context: Record<string, unknown>): string {
  return template.replace(/\{(\w+)\}/g, (_m, key) => {
    const value = context[key];
    return value === undefined || value === null ? '' : String(value);
  });
}

function normalizeVersion(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : DEFAULT_VERSION;
}

export function buildStaticExerciseModule(exercises: StaticExercise[]) {
  const DEFAULT_COMPARISON_OPTIONS: CompareOptions = {
    ignoreRowOrder: true,
    requireEqualColumnOrder: false,
    requireEqualColumnNames: false,
    caseSensitive: false,
  };
  const exerciseIndex = new Map(exercises.map((exercise) => [exercise.id, exercise]));

  function generate(utils: Utils): ExerciseState {
    const exercise = utils.selectRandomly(exercises as readonly StaticExercise[]);
    const description = (exercise.description ?? exercise.prompt).trim();
    return {
      id: exercise.id,
      version: normalizeVersion(exercise.version),
      prompt: exercise.prompt,
      description,
      solution: exercise.solution.trim(),
      comparisonOptions: exercise.comparisonOptions,
    };
  }

  function getDescription(exercise: ExerciseState): string {
    return exercise.description || exercise.prompt;
  }

  function validateOutput(
    _exercise: ExerciseState,
    result: ExecutionResult<QueryResult[]>,
  ): ValidationResult {
    if (!result.success) {
      return {
        ok: false,
        message: formatMessage(MESSAGES.validation.syntaxError, {
          error: result.error?.message || 'Unknown error',
        }),
      };
    }

    const firstResult = result.output?.[0];
    if (!firstResult || !Array.isArray(firstResult.columns) || !Array.isArray(firstResult.values)) {
      return { ok: false, message: MESSAGES.validation.noResultSet };
    }

    return { ok: true };
  }

  function verifyOutput(
    exercise: ExerciseState,
    output: QueryResult[] | undefined,
    database: any,
  ): VerificationResult {
    const actualResult = output?.[0];

    if (!actualResult || !Array.isArray(actualResult.columns) || !Array.isArray(actualResult.values)) {
      return {
        correct: false,
        message: MESSAGES.validation.noResultSet,
      };
    }

    if (!database || typeof database.exec !== 'function') {
      return {
        correct: false,
        message: MESSAGES.verification.unknown,
      };
    }

    let expectedResult: QueryResult | undefined;
    try {
      const result = database.exec(exercise.solution);
      expectedResult = result?.[0];
    } catch (error) {
      console.error('Failed to execute solution query:', error);
      return {
        correct: false,
        message: MESSAGES.verification.unknown,
      };
    }

    const comparison = compareQueryResults(expectedResult, actualResult, {
      ...DEFAULT_COMPARISON_OPTIONS,
      ...(exercise.comparisonOptions ?? {}),
    });

    return {
      correct: comparison.match,
      message: comparison.match ? MESSAGES.verification.correct : comparison.feedback || MESSAGES.verification.mismatch,
      details: comparison.details,
    };
  }

  function getSolution(exercise: ExerciseState): string {
    return exercise.solution;
  }

  function isExerciseValid(exercise: unknown): boolean {
    if (!exercise || typeof exercise !== 'object') return false;
    const exerciseId = (exercise as ExerciseState).id;
    if (typeof exerciseId !== 'string') return false;
    const entry = exerciseIndex.get(exerciseId);
    if (!entry) return false;
    const expectedVersion = normalizeVersion(entry.version);
    const currentVersion = normalizeVersion((exercise as ExerciseState).version);
    return expectedVersion === currentVersion;
  }

  return {
    generate,
    getDescription,
    validateOutput,
    verifyOutput,
    getSolution,
    isExerciseValid,
  };
}
