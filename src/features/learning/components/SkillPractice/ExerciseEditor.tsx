import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';

import { SQLEditor } from '@/shared/components/SQLEditor';

interface ExerciseEditorProps {
  query: string;
  onQueryChange: (value: string) => void;
  onExecute: (value?: string) => Promise<void> | void;
  onLiveExecute: (value: string) => Promise<void> | void;
  readOnly?: boolean;
  sx?: SxProps<Theme>;
}

export function ExerciseEditor({
  query,
  onQueryChange,
  onExecute,
  onLiveExecute,
  readOnly = false,
  sx,
}: ExerciseEditorProps) {
  return (
    <Box sx={sx}>
      <SQLEditor
        value={query}
        onChange={onQueryChange}
        height="200px"
        onExecute={onExecute}
        onLiveExecute={onLiveExecute}
        enableLiveExecution={!readOnly}
        liveExecutionDelay={150}
        showResults={false}
        readOnly={readOnly}
      />
    </Box>
  );
}
