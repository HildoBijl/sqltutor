import { Alert } from '@mui/material';

import type { PracticeFeedback } from './types';

interface ExerciseFeedbackProps {
  feedback: PracticeFeedback | null;
  queryError: Error | null;
  onClose: () => void;
}

export function ExerciseFeedback({ feedback, queryError, onClose }: ExerciseFeedbackProps) {
  if (feedback) {
    return (
      <Alert severity={feedback.type} sx={{ mb: 3 }} onClose={onClose}>
        {feedback.message}
      </Alert>
    );
  }

  if (queryError) {
    const message =
      queryError instanceof Error ? queryError.message : 'Query execution failed';
    return (
      <Alert severity="warning" sx={{ mb: 3 }}>
        {message}
      </Alert>
    );
  }

  return null;
}
