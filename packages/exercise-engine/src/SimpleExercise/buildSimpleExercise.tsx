import type { AnyExerciseDefinition } from '../Exercise';
import { emptySimpleExerciseState, isSimpleExerciseGivenUp, isSimpleExerciseSolved } from './logic';
import { SimpleExerciseComponent } from './SimpleExerciseComponent';
import type { SimpleExerciseSpecification } from './specifications';
import type { SimpleExerciseCheckResult, SimpleExerciseFeedbackType } from './types';

/** The report a SimpleExercise action stores, used to rebuild feedback. */
export interface SimpleExerciseReport {
  message: string;
  type: SimpleExerciseFeedbackType;
  result?: unknown;
}

/** Turns a simple exercise specification into a generic ExerciseDefinition. */
export function buildSimpleExercise<
  Parameters extends Record<string, unknown>,
  Input,
  CheckResult = SimpleExerciseCheckResult,
>(spec: SimpleExerciseSpecification<Parameters, Input, CheckResult>): AnyExerciseDefinition {
  const isComplete = (state: Record<string, unknown>) =>
    isSimpleExerciseSolved(state) || isSimpleExerciseGivenUp(state);

  const reduce: AnyExerciseDefinition['reduce'] = async (parameters, previousState, action, moduleContext) => {
    if (isSimpleExerciseSolved(previousState) || isSimpleExerciseGivenUp(previousState)) {
      return { state: previousState };
    }
    if (action.type === 'give-up') {
      return { state: { givenUp: true } };
    }

    const input = (action as { input: Input }).input;
    const params = parameters as Parameters;
    try {
      const validation = await spec.validateInput?.({ parameters: params, input, moduleContext });
      if (validation && !validation.valid) {
        const report: SimpleExerciseReport = {
          message: validation.feedback ?? 'Please double-check your input before submitting.',
          type: validation.feedbackType ?? 'warning',
        };
        return { state: emptySimpleExerciseState, report };
      }

      const result = await spec.checkInput({ parameters: params, input, moduleContext });
      const correct = spec.isCorrect
        ? spec.isCorrect(result)
        : Boolean((result as SimpleExerciseCheckResult).correct);
      const checkResult = result as SimpleExerciseCheckResult;
      const report: SimpleExerciseReport = {
        message: spec.getFeedback?.(result) ??
          checkResult.feedback ??
          (correct ? 'Correct!' : 'Not quite right. Try again.'),
        type: checkResult.feedbackType ?? (correct ? 'success' : 'error'),
        result,
      };
      return { state: correct ? { solved: true } : emptySimpleExerciseState, report };
    } catch (error) {
      const report: SimpleExerciseReport = {
        message: error instanceof Error ? error.message : 'Unable to check your answer. Please try again.',
        type: 'error',
      };
      return { state: emptySimpleExerciseState, report };
    }
  };

  return {
    exerciseId: spec.exerciseId,
    version: spec.version,
    generateParameters: spec.generateParameters as AnyExerciseDefinition['generateParameters'],
    initialState: emptySimpleExerciseState,
    isComplete,
    isSolved: isSimpleExerciseSolved,
    getSolutionInput: spec.getSolutionInput as AnyExerciseDefinition['getSolutionInput'],
    reduce,
    Component: () => <SimpleExerciseComponent spec={spec} />,
  };
}
