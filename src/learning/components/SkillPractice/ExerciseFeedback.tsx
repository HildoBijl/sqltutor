import { Alert } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';

import type { PracticeFeedback } from './types';

interface ExerciseFeedbackProps {
  feedback: PracticeFeedback | null;
  queryError: Error | null;
  sx?: SxProps<Theme>;
}

export function ExerciseFeedback({ feedback, queryError, sx }: ExerciseFeedbackProps) {
  const alertSx = sx ? { mb: 0, ...sx } : { mb: 0 };

  if (feedback) {
    return (
      <Alert severity={feedback.type} sx={alertSx}>
        {feedback.message}
      </Alert>
    );
  }

  if (queryError) {
    const message =
      queryError instanceof Error ? queryError.message : 'Query execution failed';
    return (
      <Alert severity="warning" sx={alertSx}>
        {message}
      </Alert>
    );
  }

  return null;
}
