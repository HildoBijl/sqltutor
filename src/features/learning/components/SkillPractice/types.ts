export type PracticeFeedbackType = 'success' | 'error' | 'info' | 'warning';

export interface PracticeFeedback {
  message: string;
  type: PracticeFeedbackType;
}

