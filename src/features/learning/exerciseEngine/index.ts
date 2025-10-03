export type ExerciseStatus =
  | 'idle'
  | 'ready'
  | 'demo-ready'
  | 'validation-error'
  | 'incorrect'
  | 'correct';

export interface ValidationResult {
  ok: boolean;
  message?: string;
  code?: string;
  warnings?: string[];
}

export interface VerificationResult {
  correct: boolean;
  message?: string;
  expected?: unknown;
  solution?: string;
  details?: Record<string, unknown>;
}

export interface ExerciseAttempt<Input> {
  index: number;
  input: Input;
  normalizedInput: string;
  status: 'invalid' | 'incorrect' | 'correct';
  validation?: ValidationResult;
  verification?: VerificationResult;
  feedback: string;
  timestamp: number;
  repeatOf?: number;
}

export interface ExerciseHistoryEntry<Input, Result = unknown> {
  action: ExerciseAction<Input, Result>;
  timestamp: number;
  status: ExerciseStatus;
  attemptIndex?: number;
  feedback?: string | null;
  note?: string;
}

export interface ExerciseProgress<Exercise, Input, Demo = unknown, Result = unknown> {
  exercise: Exercise | null;
  status: ExerciseStatus;
  attempts: ExerciseAttempt<Input>[];
  history: ExerciseHistoryEntry<Input, Result>[];
  demo?: Demo;
  validation?: ValidationResult | null;
  verification?: VerificationResult | null;
  feedback?: string | null;
  solution?: string | null;
  lastAction?: ExerciseAction<Input, Result>;
  generatedAt?: number;
}

export type ExerciseAction<Input = unknown, Result = unknown> =
  | { type: 'generate'; seed?: number }
  | { type: 'reset'; keepExercise?: boolean }
  | { type: 'input'; input: Input; result?: Result | null }
  | { type: 'regenerate-demo' }
  | { type: 'hydrate'; state: ExerciseProgress<any, Input, any, Result> };

export interface ExerciseHelpers {
  selectRandomly<T>(items: readonly T[]): T;
  randomInt(min: number, max: number): number;
}

export interface CheckInputArgs<Exercise, Input, Result> {
  exercise: Exercise;
  input: Input;
  normalizedInput: string;
  result?: Result | null;
  previousAttempts: ExerciseAttempt<Input>[];
  helpers: ExerciseHelpers;
}

export type ValidateInputArgs<Exercise, Input, Result> = CheckInputArgs<Exercise, Input, Result>;

export interface SimpleExerciseConfig<Exercise, Input, Result, Demo = unknown> {
  generateExercise: (helpers: ExerciseHelpers) => Exercise;
  checkInput: (args: CheckInputArgs<Exercise, Input, Result>) => VerificationResult;
  validateInput?: (args: ValidateInputArgs<Exercise, Input, Result>) => ValidationResult;
  runDemo?: (args: { exercise: Exercise; helpers: ExerciseHelpers }) => Demo;
  deriveSolution?: (args: { exercise: Exercise; verification?: VerificationResult }) => string | null | undefined;
  normalizeInput?: (input: Input) => string;
  feedbackForRepeat?: (args: { previous: ExerciseAttempt<Input>; currentInput: Input }) => string | undefined;
  initialState?: Partial<ExerciseProgress<Exercise, Input, Demo, Result>>;
  helpers?: ExerciseHelpers;
}

const defaultHelpers: ExerciseHelpers = {
  selectRandomly: (items) => items[Math.floor(Math.random() * items.length)],
  randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
};

function defaultNormalizeInput(input: unknown): string {
  if (input === null || input === undefined) return '';
  return String(input)
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/;$/, '');
}

function defaultRepeatFeedback<Input>(args: { previous: ExerciseAttempt<Input>; currentInput: Input }): string {
  const base = args.previous.status === 'correct'
    ? 'You already solved the exercise with this input.'
    : 'You already tried this exact input before.';
  const prior = args.previous.feedback;
  if (!prior) return base;
  if (prior === base) return base;
  return `${base} Earlier feedback: ${prior}`;
}

function validationOk(): ValidationResult {
  return { ok: true };
}

export function createInitialProgress<Exercise, Input, Demo = unknown, Result = unknown>(
  overrides?: Partial<ExerciseProgress<Exercise, Input, Demo, Result>>
): ExerciseProgress<Exercise, Input, Demo, Result> {
  return {
    exercise: null,
    status: 'idle',
    attempts: [],
    history: [],
    demo: undefined,
    validation: null,
    verification: null,
    feedback: null,
    solution: null,
    lastAction: undefined,
    generatedAt: undefined,
    ...overrides,
  };
}

export function createSimpleExerciseReducer<Exercise, Input, Result, Demo = unknown>(
  config: SimpleExerciseConfig<Exercise, Input, Result, Demo>
) {
  const helpers = config.helpers || defaultHelpers;
  const normalizeInput = config.normalizeInput || defaultNormalizeInput;
  const repeatFeedback = config.feedbackForRepeat || defaultRepeatFeedback;
  const initialState = createInitialProgress<Exercise, Input, Demo, Result>(config.initialState);

  return function reducer(
    state: ExerciseProgress<Exercise, Input, Demo, Result> = initialState,
    action: ExerciseAction<Input, Result>
  ): ExerciseProgress<Exercise, Input, Demo, Result> {
    const now = Date.now();

    if (action.type === 'hydrate') {
      const hydrated = action.state as ExerciseProgress<Exercise, Input, Demo, Result>;
      return {
        ...state,
        ...hydrated,
        attempts: [...(hydrated.attempts || [])],
        history: [...(hydrated.history || [])],
        lastAction: hydrated.lastAction ?? action,
      };
    }

    switch (action.type) {
      case 'generate': {
        const exercise = config.generateExercise(helpers);
        const demo = config.runDemo ? config.runDemo({ exercise, helpers }) : undefined;
        const status: ExerciseStatus = demo ? 'demo-ready' : 'ready';
        const entry: ExerciseHistoryEntry<Input, Result> = {
          action,
          timestamp: now,
          status,
          feedback: null,
        };

        return {
          ...createInitialProgress<Exercise, Input, Demo, Result>(config.initialState),
          exercise,
          status,
          demo,
          generatedAt: now,
          history: [...state.history, entry],
          lastAction: action,
        };
      }

      case 'regenerate-demo': {
        if (!state.exercise || !config.runDemo) return state;
        const demo = config.runDemo({ exercise: state.exercise, helpers });
        const shouldPromote = state.status === 'idle' || state.status === 'ready';
        const status: ExerciseStatus = shouldPromote ? 'demo-ready' : state.status;
        const entry: ExerciseHistoryEntry<Input, Result> = {
          action,
          timestamp: now,
          status,
          feedback: null,
        };
        return {
          ...state,
          demo,
          status,
          history: [...state.history, entry],
          lastAction: action,
        };
      }

      case 'reset': {
        const base = createInitialProgress<Exercise, Input, Demo, Result>(config.initialState);
        if (action.keepExercise && state.exercise) {
          const hasDemo = state.demo !== undefined;
          base.exercise = state.exercise;
          base.status = hasDemo ? 'demo-ready' : 'ready';
          base.demo = state.demo;
          base.generatedAt = state.generatedAt;
        }
        const entry: ExerciseHistoryEntry<Input, Result> = {
          action,
          timestamp: now,
          status: base.status,
          feedback: null,
        };
        return {
          ...base,
          history: [...state.history, entry],
          lastAction: action,
        };
      }

      case 'input': {
        if (!state.exercise) {
          const feedback = 'Exercise is not ready yet. Generate an exercise first.';
          const entry: ExerciseHistoryEntry<Input, Result> = {
            action,
            timestamp: now,
            status: state.status,
            feedback,
          };
          return {
            ...state,
            feedback,
            history: [...state.history, entry],
            lastAction: action,
          };
        }

        const normalizedInput = normalizeInput(action.input);
        const attempts = state.attempts || [];
        const existingIdx = attempts.findIndex((attempt) => attempt.normalizedInput === normalizedInput);

        if (existingIdx >= 0) {
          const previous = attempts[existingIdx];
          const feedback = repeatFeedback({ previous, currentInput: action.input });
          const mappedStatus: ExerciseStatus = previous.status === 'correct'
            ? 'correct'
            : previous.status === 'invalid'
              ? 'validation-error'
              : 'incorrect';

          const entry: ExerciseHistoryEntry<Input, Result> = {
            action,
            timestamp: now,
            status: mappedStatus,
            feedback,
            attemptIndex: existingIdx,
            note: 'repeat',
          };

          return {
            ...state,
            feedback,
            status: mappedStatus,
            validation: previous.validation ?? state.validation,
            verification: previous.verification ?? state.verification,
            history: [...state.history, entry],
            lastAction: action,
          };
        }

        const validation = config.validateInput
          ? config.validateInput({
              exercise: state.exercise,
              input: action.input,
              normalizedInput,
              result: action.result,
              previousAttempts: attempts,
              helpers,
            })
          : validationOk();

        if (!validation.ok) {
          const feedback = validation.message || 'Please double-check your input before submitting.';
          const attempt: ExerciseAttempt<Input> = {
            index: attempts.length,
            input: action.input,
            normalizedInput,
            status: 'invalid',
            validation,
            feedback,
            timestamp: now,
          };
          const entry: ExerciseHistoryEntry<Input, Result> = {
            action,
            timestamp: now,
            status: 'validation-error',
            feedback,
            attemptIndex: attempt.index,
          };
          return {
            ...state,
            attempts: [...attempts, attempt],
            status: 'validation-error',
            validation,
            verification: null,
            feedback,
            history: [...state.history, entry],
            lastAction: action,
          };
        }

        const verification = config.checkInput({
          exercise: state.exercise,
          input: action.input,
          normalizedInput,
          result: action.result,
          previousAttempts: attempts,
          helpers,
        });

        const isCorrect = !!verification?.correct;
        const status: ExerciseStatus = isCorrect ? 'correct' : 'incorrect';
        const feedback = verification?.message || (isCorrect
          ? 'Great job! That answer is correct.'
          : 'Not quite there yet. Check the requirements and try again.');

        const attempt: ExerciseAttempt<Input> = {
          index: attempts.length,
          input: action.input,
          normalizedInput,
          status: isCorrect ? 'correct' : 'incorrect',
          validation,
          verification,
          feedback,
          timestamp: now,
        };

        const computedSolution = isCorrect
          ? config.deriveSolution?.({ exercise: state.exercise, verification }) ?? verification?.solution ?? null
          : state.solution;

        const entry: ExerciseHistoryEntry<Input, Result> = {
          action,
          timestamp: now,
          status,
          feedback,
          attemptIndex: attempt.index,
        };

        return {
          ...state,
          attempts: [...attempts, attempt],
          status,
          validation,
          verification,
          feedback,
          solution: computedSolution,
          history: [...state.history, entry],
          lastAction: action,
        };
      }

      default:
        return state;
    }
  };
}
