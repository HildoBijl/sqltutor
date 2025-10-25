import type { SkillExerciseModuleLike } from '../useSkillExerciseState';

type AnyFunction = (...args: any[]) => unknown;

function isCallable<T extends AnyFunction>(value: unknown): value is T {
  return typeof value === 'function';
}

function isExerciseMessages(
  value: unknown,
): value is NonNullable<SkillExerciseModuleLike['messages']> {
  return typeof value === 'object' && value !== null;
}

export function normalizeSkillExerciseModule(
  module: unknown,
): SkillExerciseModuleLike | null {
  if (!module || typeof module !== 'object') {
    return null;
  }

  const candidate = module as Partial<SkillExerciseModuleLike> & Record<string, unknown>;

  return {
    generate: isCallable<NonNullable<SkillExerciseModuleLike['generate']>>(candidate.generate)
      ? candidate.generate
      : undefined,
    validate: isCallable<NonNullable<SkillExerciseModuleLike['validate']>>(candidate.validate)
      ? candidate.validate
      : undefined,
    validateInput: isCallable<NonNullable<SkillExerciseModuleLike['validateInput']>>(candidate.validateInput)
      ? candidate.validateInput
      : undefined,
    validateOutput: isCallable<NonNullable<SkillExerciseModuleLike['validateOutput']>>(candidate.validateOutput)
      ? candidate.validateOutput
      : undefined,
    verifyOutput: isCallable<NonNullable<SkillExerciseModuleLike['verifyOutput']>>(candidate.verifyOutput)
      ? candidate.verifyOutput
      : undefined,
    getSolution: isCallable<NonNullable<SkillExerciseModuleLike['getSolution']>>(candidate.getSolution)
      ? candidate.getSolution
      : undefined,
    runDemo: isCallable<NonNullable<SkillExerciseModuleLike['runDemo']>>(candidate.runDemo)
      ? candidate.runDemo
      : undefined,
    solutionTemplate: typeof candidate.solutionTemplate === 'string' ? candidate.solutionTemplate : undefined,
    messages: isExerciseMessages(candidate.messages) ? candidate.messages : undefined,
  };
}

