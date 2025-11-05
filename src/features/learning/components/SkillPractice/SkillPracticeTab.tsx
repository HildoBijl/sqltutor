import { Box, Typography } from '@mui/material';

import { ExerciseControls } from './ExerciseControls';
import { ExerciseDescription } from './ExerciseDescription';
import { ExerciseEditor } from './ExerciseEditor';
import { ExerciseFeedback } from './ExerciseFeedback';
import { ExerciseResults } from './ExerciseResults';
import { ExerciseSolution } from './ExerciseSolution';
import { GiveUpDialog } from './GiveUpDialog';
import { ExerciseAdminTools } from './ExerciseAdminTools';
import type { SkillExerciseControllerState } from '../../hooks/useSkillExerciseController';

interface SkillPracticeTabProps {
  practice: SkillExerciseControllerState['practice'];
  status: SkillExerciseControllerState['status'];
  actions: SkillExerciseControllerState['actions'];
  dialogs: SkillExerciseControllerState['dialogs']['giveUp'];
  isAdmin: boolean;
}

export function SkillPracticeTab({
  practice,
  status,
  actions,
  dialogs,
  isAdmin,
}: SkillPracticeTabProps) {
  const description = practice.currentExercise?.description ?? '';
  const showSolution = (practice.exerciseCompleted || practice.hasGivenUp) && Boolean(practice.solution);

  return (
    <Box>
      {practice.currentExercise ? (
        <ExerciseDescription title={practice.title} description={description} tableNames={practice.tableNames} />
      ) : (
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Generating your next exercise...
        </Typography>
      )}

      <ExerciseEditor
        query={practice.query}
        onQueryChange={actions.setQuery}
        onExecute={actions.submit}
        onLiveExecute={actions.liveExecute}
        readOnly={practice.exerciseCompleted || practice.hasGivenUp}
      />

      <ExerciseControls
        exerciseCompleted={practice.exerciseCompleted}
        hasGivenUp={practice.hasGivenUp}
        canSubmit={practice.canSubmit}
        canGiveUp={practice.canGiveUp}
        onSubmit={() => {
          void actions.submit();
        }}
        onGiveUp={dialogs.openDialog}
        onNext={actions.nextExercise}
        leftActions={
          isAdmin && !practice.exerciseCompleted && !practice.hasGivenUp && practice.canGiveUp ? (
            <ExerciseAdminTools
              isAdmin
              disabled={!practice.currentExercise || status.isExecuting}
              onShowSolution={() => {
                void actions.autoComplete();
              }}
            />
          ) : null
        }
      />

      <ExerciseFeedback
        feedback={practice.feedback}
        queryError={practice.queryError}
      />

      <ExerciseSolution
        solution={practice.solution ?? undefined}
        show={showSolution}
      />

      <ExerciseResults
        queryResult={practice.queryResult}
        queryError={practice.queryError}
        hasExecuted={practice.hasExecutedQuery}
      />

      <GiveUpDialog
        open={dialogs.open}
        onConfirm={dialogs.confirmGiveUp}
        onCancel={dialogs.closeDialog}
      />
    </Box>
  );
}
