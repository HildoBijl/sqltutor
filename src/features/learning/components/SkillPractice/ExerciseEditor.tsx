import { Box } from '@mui/material';

import { SQLEditor } from '@/shared/components/SQLEditor';

interface ExerciseEditorProps {
  query: string;
  onQueryChange: (value: string) => void;
  onExecute: (value?: string) => Promise<void> | void;
  onLiveExecute: (value: string) => Promise<void> | void;
}

export function ExerciseEditor({
  query,
  onQueryChange,
  onExecute,
  onLiveExecute,
}: ExerciseEditorProps) {
  return (
    <Box sx={{ mb: 2 }}>
      <SQLEditor
        value={query}
        onChange={onQueryChange}
        height="200px"
        onExecute={onExecute}
        onLiveExecute={onLiveExecute}
        enableLiveExecution
        liveExecutionDelay={150}
        showResults={false}
      />
    </Box>
  );
}

