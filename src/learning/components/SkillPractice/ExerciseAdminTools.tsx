import { Box, Button } from '@mui/material';
import { Lightbulb } from '@mui/icons-material';

interface ExerciseAdminToolsProps {
  isAdmin?: boolean;
  disabled?: boolean;
  onShowSolution: () => void;
}

export function ExerciseAdminTools({ isAdmin, disabled, onShowSolution }: ExerciseAdminToolsProps) {
  if (!isAdmin) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
      <Button
        size="small"
        onClick={onShowSolution}
        startIcon={<Lightbulb />}
        disabled={disabled}
        variant="outlined"
      >
        Show Solution
      </Button>
    </Box>
  );
}

