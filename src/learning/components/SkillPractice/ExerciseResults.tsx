import { useEffect, useState, type ReactNode } from 'react';

import { Box, Button, Collapse, Divider, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';

import { DataTable, Warning } from '@/components';
import type { QueryResultSet } from '../../types';
import { ExerciseSection } from './ExerciseSection';
import type { DatasetSize } from '@/mockData';

interface ExerciseResultsProps {
  queryResult: ReadonlyArray<QueryResultSet> | null;
  queryError: Error | null;
  hasExecuted: boolean;
  isComplete: boolean;
  datasetSize: DatasetSize;
  onDatasetSizeChange: (size: DatasetSize) => void;
  datasetWarning?: string | null;
}

function ResultsPlaceholder({ message, children }: { message: string; children?: ReactNode }) {
  return (
    <Box
      sx={{
        px: 3,
        py: 6,
        textAlign: 'center',
        bgcolor: 'action.hover',
        borderRadius: 1,
      }}
    >
      <Typography color="text.secondary">{message}</Typography>
      {children ? <Box sx={{ mt: 2, textAlign: 'left' }}>{children}</Box> : null}
    </Box>
  );
}

export function ExerciseResults({
  queryResult,
  queryError,
  hasExecuted,
  isComplete,
  datasetSize,
  onDatasetSizeChange,
  datasetWarning,
}: ExerciseResultsProps) {
  const [expanded, setExpanded] = useState(() => !isComplete);
  let content: ReactNode = null;
  const emptyMessage = 'Query executed successfully but returned no rows.';
  const hasResultSet = Boolean(queryResult && queryResult.length > 0);
  const hasRows = Boolean(hasResultSet && queryResult?.[0]?.values && queryResult[0].values.length > 0);
  const isEmptyResult = hasExecuted && !queryError && (!hasResultSet || !hasRows);
  const showWarning = Boolean(datasetWarning && isEmptyResult);

  useEffect(() => {
    setExpanded(!isComplete);
  }, [isComplete]);

  if (queryError) {
    content = <ResultsPlaceholder message="No results due to query error" />;
  } else if (hasResultSet) {
    const [firstResult] = queryResult ?? [];

    content = hasRows ? (
      <DataTable data={firstResult} />
    ) : (
      <ResultsPlaceholder message={emptyMessage}>
        {showWarning ? <Warning>{datasetWarning}</Warning> : null}
      </ResultsPlaceholder>
    );
  } else {
    content = (
      <ResultsPlaceholder message={hasExecuted ? emptyMessage : 'Execute your query to preview results.'}>
        {showWarning ? <Warning>{datasetWarning}</Warning> : null}
      </ResultsPlaceholder>
    );
  }

  return (
    <ExerciseSection
      title="Query Results"
      showDivider={false}
      contentSx={{ p: 0 }}
      actions={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={datasetSize}
            onChange={(_event, nextValue) => {
              if (!nextValue) return;
              onDatasetSizeChange(nextValue as DatasetSize);
            }}
            sx={{
              flexWrap: 'wrap',
              '& .MuiToggleButton-root': {
                px: 1,
                py: 0.25,
                textTransform: 'none',
              },
            }}
          >
            <ToggleButton value="small">Use small data set</ToggleButton>
            <ToggleButton value="full">Use full data set</ToggleButton>
          </ToggleButtonGroup>
          <Button
            size="small"
            color="primary"
            variant="text"
            onClick={() => setExpanded((prev) => !prev)}
            endIcon={expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
            sx={{ textTransform: 'none', fontWeight: 500, px: 1 }}
          >
            {expanded ? 'Hide' : 'Show'}
          </Button>
        </Box>
      }
    >
      <Collapse in={expanded} unmountOnExit>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ px: 2.5, pb: 2.5 }}>{content}</Box>
      </Collapse>
    </ExerciseSection>
  );
}
