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
    noResultSet:
      'Your output seems to be empty. Some records were expected here, so something has gone wrong.',
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

function formatSentence(value: string): string {
  let text = value.trim();
  if (!text) return text;
  const firstChar = text[0];
  if (firstChar === firstChar.toLowerCase()) {
    text = firstChar.toUpperCase() + text.slice(1);
  }
  if (!/[.!?]$/.test(text)) {
    text += '.';
  }
  return text;
}

const SQL_ERROR_PATTERNS: Array<{
  pattern: RegExp;
  format: (match: RegExpMatchArray) => string;
}> = [
  {
    pattern: /no such column:\s*("?)([^"\s]+)\1/i,
    format: (match) => `Did not recognize column "${match[2]}". Check spelling or table schema.`,
  },
  {
    pattern: /no such table:\s*("?)([^"\s]+)\1/i,
    format: (match) => `Did not recognize table "${match[2]}".`,
  },
  {
    pattern: /no such function:\s*("?)([^"\s]+)\1/i,
    format: (match) => `Did not recognize function "${match[2]}".`,
  },
  {
    pattern: /ambiguous column name:\s*("?)([^"\s]+)\1/i,
    format: (match) =>
      `Column name "${match[2]}" is ambiguous (appears in more than one table).`,
  },
  {
    pattern: /table\s+("?)([^"\s]+)\1\s+has no column named\s+("?)([^"\s]+)\3/i,
    format: (match) => `Table "${match[2]}" has no column named "${match[4]}".`,
  },
  {
    pattern: /misuse of aggregate(?: function)?:\s*([A-Za-z0-9_]+)\s*\(?/i,
    format: (match) => `Misuse of aggregate function "${match[1]}".`,
  },
  {
    pattern: /near\s+"([^"]+)":\s*syntax error/i,
    format: (match) => `Syntax error near "${match[1]}".`,
  },
  {
    pattern: /incomplete input/i,
    format: () => 'Syntax error: incomplete input.',
  },
];

function formatSqlErrorMessage(rawMessage: string): string {
  const message = rawMessage.replace(/\s+/g, ' ').trim();
  if (!message) {
    return formatSentence(formatMessage(MESSAGES.validation.syntaxError, { error: 'Unknown error' }));
  }

  for (const { pattern, format } of SQL_ERROR_PATTERNS) {
    const match = message.match(pattern);
    if (match) {
      return formatSentence(format(match));
    }
  }

  if (/syntax error/i.test(message)) {
    return formatSentence('Syntax error.');
  }

  return formatSentence(formatMessage(MESSAGES.validation.syntaxError, { error: message }));
}

export function buildStaticExerciseModule(exercises: StaticExercise[]) {
  const DEFAULT_COMPARISON_OPTIONS: CompareOptions = {
    ignoreRowOrder: true,
    requireEqualColumnOrder: false,
    requireEqualColumnNames: false,
    caseSensitive: false,
  };
  const exerciseIndex = new Map(exercises.map((exercise) => [exercise.id, exercise]));

  const toExerciseState = (exercise: StaticExercise): ExerciseState => {
    const description = (exercise.description ?? exercise.prompt).trim();
    return {
      id: exercise.id,
      version: normalizeVersion(exercise.version),
      prompt: exercise.prompt,
      description,
      solution: exercise.solution.trim(),
      comparisonOptions: exercise.comparisonOptions,
    };
  };

  function generate(utils: Utils): ExerciseState {
    const exercise = utils.selectRandomly(exercises as readonly StaticExercise[]);
    return toExerciseState(exercise);
  }

  function getDescription(exercise: ExerciseState): string {
    return exercise.description || exercise.prompt;
  }

  function validateOutput(
    _exercise: ExerciseState,
    result: ExecutionResult<QueryResult[]>,
  ): ValidationResult {
    if (!result.success) {
      const errorMessage = result.error?.message || 'Unknown error';
      return {
        ok: false,
        message: formatSqlErrorMessage(errorMessage),
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

  function listExercises() {
    return exercises.map((exercise) => ({
      id: exercise.id,
      label: (exercise.description ?? exercise.prompt).trim(),
    }));
  }

  function getExerciseById(id: string): ExerciseState | null {
    const exercise = exerciseIndex.get(id);
    if (!exercise) return null;
    return toExerciseState(exercise);
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
    listExercises,
    getExerciseById,
    isExerciseValid,
  };
}
