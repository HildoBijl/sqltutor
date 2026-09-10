import { useCallback, useMemo, useState } from 'react';
import { Alert, Box } from '@mui/material';

import { useExercise } from '../Exercise';
import type { SimpleExerciseReport } from './buildSimpleExercise';
import { SimpleExerciseControlsContext } from './controlsContext';
import { ExerciseControls } from './ExerciseControls';
import { GiveUpDialog } from './GiveUpDialog';
import { isSimpleExerciseGivenUp, isSimpleExerciseSolved } from './logic';
import type { SimpleExerciseRenderSpec } from './specifications';
import type { SimpleExerciseStoredState } from './types';

interface SimpleExerciseComponentProps<
  Parameters extends Record<string, unknown>,
  Input,
  CheckResult,
> {
  spec: SimpleExerciseRenderSpec<Parameters, Input, CheckResult>;
}

/**
 * Renders the active exercise from context and handles submit/give-up. Feedback is
 * derived from the latest stored report, so it survives a reload without regrading.
 */
export function SimpleExerciseComponent<
  Parameters extends Record<string, unknown>,
  Input,
  CheckResult,
>({ spec }: SimpleExerciseComponentProps<Parameters, Input, CheckResult>) {
  const { data, controls } = useExercise();
  const { events, draftInput, pending, state } = data;

  const [feedbackCleared, setFeedbackCleared] = useState(false);
  const [giveUpOpen, setGiveUpOpen] = useState(false);
  const [solutionRevealed, setSolutionRevealed] = useState(false);

  const lastSubmittedInput = useMemo(() => {
    for (let i = events.length - 1; i >= 0; i -= 1) {
      if (events[i].action.type === 'input') return events[i].action.input as Input;
    }
    return undefined;
  }, [events]);
  const input = (draftInput !== undefined ? draftInput : lastSubmittedInput ?? spec.initialInput) as Input;

  const latestEvent = events[events.length - 1];
  const report = latestEvent?.action.type === 'input'
    ? (latestEvent.report as SimpleExerciseReport | undefined)
    : undefined;
  const feedback = !feedbackCleared && report ? report : null;
  const lastResult = (report?.result ?? null) as CheckResult | null;

  const handleInputChange = useCallback(
    (value: Input) => {
      controls.setDraftInput(value);
      setFeedbackCleared(true);
    },
    [controls],
  );

  const handleSubmit = useCallback(() => {
    setFeedbackCleared(false);
    void controls.submitAction({ type: 'input', input });
  }, [controls, input]);

  const handleGiveUp = useCallback(() => {
    setGiveUpOpen(false);
    setSolutionRevealed(true);
    void controls.submitAction({ type: 'give-up' });
  }, [controls]);

  const params = data.parameters as Parameters;
  const storedState = state as SimpleExerciseStoredState;
  const solved = isSimpleExerciseSolved(storedState);
  const givenUp = isSimpleExerciseGivenUp(storedState);
  const complete = solved || givenUp;
  const canSubmit = !complete && !pending && !(spec.isInputEmpty?.(input) ?? false);
  const { Prompt, Problem, Input: InputComponent, Solution, Payoff, Output } = spec;

  return (
    <Box>
      {Prompt ? <Prompt parameters={params} /> : null}
      <Problem parameters={params} />
      <InputComponent
        parameters={params}
        value={input}
        disabled={complete || pending}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
      />
      {feedback ? <Alert severity={feedback.type} sx={{ mt: 1.5 }}>{feedback.message}</Alert> : null}
      <SimpleExerciseControlsContext.Provider
        value={{
          solved,
          givenUp,
          canSubmit,
          canGiveUp: !complete && !pending,
          onSubmit: handleSubmit,
          onGiveUp: () => setGiveUpOpen(true),
          onNext: controls.startNewExercise,
        }}
      >
        <ExerciseControls />
      </SimpleExerciseControlsContext.Provider>
      {Output ? (
        <Output parameters={params} input={input} result={lastResult} state={storedState} />
      ) : null}
      {solved && lastResult && Payoff ? <Payoff parameters={params} result={lastResult} /> : null}
      {complete || solutionRevealed ? <Solution parameters={params} state={storedState} /> : null}
      <GiveUpDialog open={giveUpOpen} onConfirm={handleGiveUp} onCancel={() => setGiveUpOpen(false)} />
    </Box>
  );
}
