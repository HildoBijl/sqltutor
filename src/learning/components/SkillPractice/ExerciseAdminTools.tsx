import { Box, Button, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { Lightbulb } from '@mui/icons-material';

interface ExerciseAdminToolsProps {
  isAdmin?: boolean;
  solutionDisabled?: boolean;
  selectionDisabled?: boolean;
  onShowSolution: () => void;
  exerciseOptions?: { id: string; label: string }[];
  selectedExerciseId?: string | null;
  onExerciseSelect?: (exerciseId: string) => void;
}

export function ExerciseAdminTools({
  isAdmin,
  solutionDisabled,
  selectionDisabled,
  onShowSolution,
  exerciseOptions,
  selectedExerciseId,
  onExerciseSelect,
}: ExerciseAdminToolsProps) {
  if (!isAdmin) {
    return null;
  }

  const options = exerciseOptions ?? [];
  const maxLabelLength = 72;
  const truncateLabel = (label: string) => {
    const normalized = label.replace(/\s+/g, ' ').trim();
    if (normalized.length <= maxLabelLength) return normalized;
    return `${normalized.slice(0, maxLabelLength - 3).trimEnd()}...`;
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1 }}>
      {options.length > 0 ? (
        <FormControl
          size="small"
          sx={{ minWidth: { xs: '100%', sm: 240 }, maxWidth: { xs: '100%', sm: 360 } }}
          disabled={selectionDisabled || !onExerciseSelect}
        >
          <InputLabel id="admin-exercise-select-label" shrink>
            Exercise
          </InputLabel>
          <Select
            labelId="admin-exercise-select-label"
            label="Exercise"
            value={selectedExerciseId ?? ''}
            displayEmpty
            MenuProps={{
              PaperProps: {
                sx: {
                  maxHeight: 320,
                  width: { xs: 'calc(100vw - 32px)', sm: 520 },
                },
              },
            }}
            renderValue={(selected) => {
              const value = String(selected);
              const match = options.find((option) => option.id === value);
              if (!match) {
                return (
                  <Box sx={{ minWidth: 0 }}>
                    <Box sx={{ typography: 'body2', color: 'text.secondary' }}>Choose exercise</Box>
                  </Box>
                );
              }
              const display = truncateLabel(match.label);
              return (
                <Box sx={{ minWidth: 0 }}>
                  <Box sx={{ typography: 'body2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={match.label}>
                    {display}
                  </Box>
                </Box>
              );
            }}
            onChange={(event) => {
              const nextId = String(event.target.value);
              if (!nextId || !onExerciseSelect) return;
              onExerciseSelect(nextId);
            }}
          >
            {options.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                <Box
                  sx={{
                    width: '100%',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    typography: 'body2',
                  }}
                  title={option.label}
                >
                  {truncateLabel(option.label)}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : null}
      <Button
        size="small"
        onClick={onShowSolution}
        startIcon={<Lightbulb />}
        disabled={solutionDisabled}
        variant="outlined"
      >
        Show Solution
      </Button>
    </Box>
  );
}
