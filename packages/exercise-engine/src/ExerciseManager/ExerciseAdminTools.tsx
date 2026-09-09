import { Box, Button, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { Lightbulb } from '@mui/icons-material';

interface ExerciseOption {
  id: string;
  label: string;
}

interface ExerciseAdminToolsProps {
  options: ExerciseOption[];
  selectedExerciseId: string;
  disabled: boolean;
  solutionDisabled: boolean;
  onExerciseSelect: (exerciseId: string) => void;
  onShowSolution: () => void;
}

export function ExerciseAdminTools({
  options,
  selectedExerciseId,
  disabled,
  solutionDisabled,
  onExerciseSelect,
  onShowSolution,
}: ExerciseAdminToolsProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
      <FormControl
        size="small"
        sx={{ minWidth: { xs: '100%', sm: 240 }, maxWidth: { xs: '100%', sm: 360 } }}
        disabled={disabled}
      >
        <InputLabel id="admin-exercise-select-label">Exercise</InputLabel>
        <Select
          labelId="admin-exercise-select-label"
          label="Exercise"
          value={selectedExerciseId}
          onChange={(event) => onExerciseSelect(String(event.target.value))}
          MenuProps={{ PaperProps: { sx: { maxHeight: 320 } } }}
        >
          {options.map((option) => (
            <MenuItem key={option.id} value={option.id} title={option.label}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button
        size="small"
        variant="outlined"
        startIcon={<Lightbulb />}
        disabled={solutionDisabled}
        onClick={onShowSolution}
      >
        Show Solution
      </Button>
    </Box>
  );
}
