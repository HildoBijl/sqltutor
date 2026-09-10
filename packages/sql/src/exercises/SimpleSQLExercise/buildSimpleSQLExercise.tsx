import {
  buildSimpleExercise,
  createExerciseRng,
  pickRandomly,
  type AnyExerciseDefinition,
} from '@sqlvalley/exercise-engine';

import { normalizeSqlInput, validateSqlInput } from '@sqlvalley/sql-grading';
import type { SqlModuleContext } from '../SqlModule';
import {
  createSQLPayoff,
  createSQLPracticeIntro,
  createSQLProblem,
  createSQLSolution,
  SQLExerciseInput,
  SQLExerciseOutput,
} from './views';
import type {
  SimpleSQLCheckResult,
  SimpleSQLExerciseSpec,
  SQLExerciseRuntimeParameters,
  SQLExerciseRuntimeVariant,
  SQLTemplateValue,
} from './types';

const DEFAULT_PROMPT_DETAILS = [
  'Use the HeriShare records as your source.',
  'Return only the data requested here.',
  'Keep the result focused on this investigation step.',
  'Use SQL to produce the requested table.',
] as const;

function createDefaultPracticeIntros(purpose: string): readonly string[] {
  return [
    `Marcelle: This check matters because we need to ${purpose}`,
    `Paris: Keep this narrow; the immediate goal is to ${purpose}`,
    `Bob: Let the database handle this part. We need to ${purpose}`,
    `Elvis: Pull this view from the ledger so we can ${purpose}`,
  ];
}

function createDefaultSuccessPayoffs(purpose: string): readonly string[] {
  return [
    `Marcelle: Good, now we can say we know how to ${purpose}`,
    'Bob: Nice. That result gives us a cleaner footing for the next check.',
    'Paris: That is the slice we needed. Keep it handy for the follow-up.',
    'Elvis: That matches the shape I expected for this pass.',
  ];
}

/**
 * Turns one SQL exercise into an ExerciseDefinition, on top of buildSimpleExercise.
 * Its checkInput delegates grading to the SQL module's grade() from moduleContext.
 */
export function buildSimpleSQLExercise<Parameters extends Record<string, unknown>>(
  spec: SimpleSQLExerciseSpec<Parameters>,
): AnyExerciseDefinition {
  const { exerciseId, version, comparisonOptions, title = 'Exercise' } = spec;

  return buildSimpleExercise<Parameters & SQLExerciseRuntimeParameters, string, SimpleSQLCheckResult>({
    exerciseId,
    version,
    generateParameters: (moduleContext, context) => {
      const baseParameters = spec.generateParameters?.(moduleContext, context) ?? ({} as Parameters);
      const rng = createExerciseRng(context.attemptSeed);
      const scenario = pickRandomly(rng, spec.scenarios ?? []);
      const scenarioParameters = scenario?.parameters ?? {};
      const parameters = {
        ...baseParameters,
        ...scenarioParameters,
      } as Parameters;
      const generatedProblem = scenario?.problem ? resolveValue(scenario.problem, parameters) : undefined;
      const generatedSolution = scenario?.solution ? resolveValue(scenario.solution, parameters) : undefined;
      const purpose = summarizeProblemForNarrative(generatedProblem ?? resolveValue(spec.problem, parameters));
      const runtimeVariant: SQLExerciseRuntimeVariant = {
        seed: context.attemptSeed,
        subject: spec.subject ?? 'SQL',
        scenarioId: scenario?.id,
        promptDetail: resolveTemplateChoice(
          spec.promptDetails ?? DEFAULT_PROMPT_DETAILS,
          parameters,
          rng,
          '',
        ),
        practiceIntro: resolveTemplateChoice(
          scenario?.practiceIntro ? [scenario.practiceIntro] : spec.practiceIntros ?? createDefaultPracticeIntros(purpose),
          parameters,
          rng,
          '',
        ),
        successPayoff: resolveTemplateChoice(
          scenario?.successPayoff ? [scenario.successPayoff] : spec.successPayoffs ?? createDefaultSuccessPayoffs(purpose),
          parameters,
          rng,
          '',
        ),
        tables: [...(spec.tables ?? [])],
        skillFocus: [...(spec.skillFocus ?? [])],
        generatedProblem,
        generatedSolution,
      };

      return {
        ...parameters,
        __sqlExercise: runtimeVariant,
      };
    },
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
        getSolution(spec, parameters),
        comparisonOptions,
      ),
    Prompt: createSQLPracticeIntro((parameters) => getVariant(parameters).practiceIntro),
    Problem: createSQLProblem(title, (parameters) => getProblem(spec, parameters)),
    Input: SQLExerciseInput,
    Solution: createSQLSolution((parameters) => getSolution(spec, parameters)),
    Payoff: createSQLPayoff((parameters) => getVariant(parameters).successPayoff),
    Output: SQLExerciseOutput,
  }) as AnyExerciseDefinition;
}

function getProblem<Parameters extends Record<string, unknown>>(
  spec: SimpleSQLExerciseSpec<Parameters>,
  parameters: Parameters & SQLExerciseRuntimeParameters,
): string {
  const variant = getVariant(parameters);
  const problem = variant.generatedProblem ?? resolveValue(spec.problem, parameters);
  return variant.promptDetail ? `${problem} ${variant.promptDetail}` : problem;
}

function getSolution<Parameters extends Record<string, unknown>>(
  spec: SimpleSQLExerciseSpec<Parameters>,
  parameters: Parameters & SQLExerciseRuntimeParameters,
): string {
  return getVariant(parameters).generatedSolution ?? resolveValue(spec.solution, parameters).trim();
}

function getVariant(parameters: SQLExerciseRuntimeParameters): SQLExerciseRuntimeVariant {
  return parameters.__sqlExercise ?? {
    seed: '',
    subject: 'SQL',
    promptDetail: '',
    practiceIntro: '',
    successPayoff: '',
    tables: [],
    skillFocus: [],
  };
}

function summarizeProblemForNarrative(problem: string): string {
  const normalized = problem.trim().replace(/\s+/g, ' ').replace(/[.?!]+$/, '');
  if (!normalized) return 'verify the next slice of records.';

  const lowercased = normalized.charAt(0).toLowerCase() + normalized.slice(1);
  return lowercased.length > 130
    ? `${lowercased.slice(0, 127).trim()}...`
    : `${lowercased}.`;
}

function resolveTemplateChoice<Parameters extends Record<string, unknown>>(
  values: readonly SQLTemplateValue<Parameters>[],
  parameters: Parameters,
  rng: ReturnType<typeof createExerciseRng>,
  fallback: string,
): string {
  const picked = pickRandomly(rng, values);
  return picked ? resolveValue(picked, parameters) : fallback;
}

function resolveValue<Parameters extends Record<string, unknown>>(
  value: SQLTemplateValue<Parameters>,
  parameters: Parameters,
): string {
  return typeof value === 'function' ? value(parameters) : value;
}
