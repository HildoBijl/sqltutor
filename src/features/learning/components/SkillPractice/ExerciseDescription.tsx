import { Paper, Typography } from '@mui/material';

interface ExerciseDescriptionProps {
  title: string;
  description?: string;
  tableNames?: string[];
}

export function ExerciseDescription({ title, description, tableNames }: ExerciseDescriptionProps) {
  if (!description) {
    return null;
  }

  return (
    <Paper sx={{ p: 2, mb: 3, bgcolor: 'action.hover' }}>
      <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
        {title}
      </Typography>
      <Typography variant="body1">{description}</Typography>
      {tableNames && tableNames.length > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Available tables: {tableNames.join(', ')}
        </Typography>
      )}
    </Paper>
  );
}

