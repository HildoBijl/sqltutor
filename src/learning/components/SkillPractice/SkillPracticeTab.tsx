import { Alert, Box, Typography } from '@mui/material';

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
  if (practice.unavailableMessage) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Alert severity="info">{practice.unavailableMessage}</Alert>
      </Box>
    );
  }

  const description = practice.description;
  const isSolvedOrGivenUp = practice.exerciseCompleted || practice.hasGivenUp;
  const showSolution = isSolvedOrGivenUp && Boolean(practice.solution?.query);
  const hasFeedback = Boolean(practice.feedback || practice.queryError);

  return (
    <Box>
      {practice.currentExercise ? (
        <ExerciseDescription title={practice.title} description={description} tableNames={practice.tableNames} />
      ) : (
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Generating your next exercise...
        </Typography>
      )}

      <Box sx={{ mb: 3 }}>
        <ExerciseEditor
          query={practice.query}
          onQueryChange={actions.setQuery}
          onExecute={actions.submit}
          onLiveExecute={actions.liveExecute}
          readOnly={practice.exerciseCompleted || practice.hasGivenUp}
          completionSchema={practice.completionSchema}
        />

        {hasFeedback ? (
          <Box sx={{ mt: 1.5 }}>
            <ExerciseFeedback
              feedback={practice.feedback}
              queryError={practice.queryError}
            />
          </Box>
        ) : null}
      </Box>

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
          isAdmin ? (
            <ExerciseAdminTools
              isAdmin
              solutionDisabled={!practice.currentExercise || status.isExecuting}
              selectionDisabled={status.isExecuting || practice.exerciseOptions.length === 0}
              exerciseOptions={practice.exerciseOptions}
              selectedExerciseId={practice.selectedExerciseId}
              onExerciseSelect={actions.selectExercise}
              onShowSolution={() => {
                void actions.autoComplete();
              }}
            />
          ) : null
        }
      />

      <ExerciseSolution
        solution={practice.solution ?? undefined}
        show={showSolution}
      />

      <ExerciseResults
        queryResult={practice.queryResult}
        queryError={practice.queryError}
        hasExecuted={practice.hasExecutedQuery}
        isComplete={isSolvedOrGivenUp}
        datasetSize={practice.datasetSize}
        onDatasetSizeChange={actions.setDatasetSize}
        datasetWarning={practice.datasetWarning}
      />

      <GiveUpDialog
        open={dialogs.open}
        onConfirm={dialogs.confirmGiveUp}
        onCancel={dialogs.closeDialog}
      />
    </Box>
  );
}
