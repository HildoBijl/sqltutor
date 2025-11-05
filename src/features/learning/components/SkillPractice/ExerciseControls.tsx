import { Box, Button } from '@mui/material';
import { ArrowForward, CheckCircle, Flag } from '@mui/icons-material';

interface ExerciseControlsProps {
  exerciseCompleted: boolean;
  hasGivenUp: boolean;
  canSubmit: boolean;
  canGiveUp: boolean;
  onSubmit: () => void;
  onGiveUp: () => void;
  onNext: () => void;
  leftActions?: React.ReactNode;
}

export function ExerciseControls({
  exerciseCompleted,
  hasGivenUp,
  canSubmit,
  canGiveUp,
  onSubmit,
  onGiveUp,
  onNext,
  leftActions,
}: ExerciseControlsProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 1,
        mb: 3,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        {leftActions}
      </Box>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {!exerciseCompleted ? (
          hasGivenUp ? (
            <Button
              variant="contained"
              size="medium"
              startIcon={<ArrowForward />}
              onClick={onNext}
              title="Move to the next exercise"
            >
              Next Exercise
            </Button>
          ) : (
            <>
              <Button
                variant="outlined"
                size="medium"
                startIcon={<Flag />}
                color="warning"
                onClick={onGiveUp}
                disabled={!canGiveUp}
              >
                Give Up
              </Button>
              <Button
                variant="contained"
                size="medium"
                startIcon={<CheckCircle />}
                onClick={onSubmit}
                disabled={!canSubmit}
              >
                Submit Answer
              </Button>
            </>
          )
        ) : (
          <Button
            variant="contained"
            size="medium"
            startIcon={<ArrowForward />}
            onClick={onNext}
            title="Proceed to the next exercise"
          >
            Next Exercise
          </Button>
        )}
      </Box>
    </Box>
  );
}
