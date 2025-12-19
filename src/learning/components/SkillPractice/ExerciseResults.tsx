import { useEffect, useState, type ReactNode } from 'react';

import { Box, Button, Collapse, Divider, Typography } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';

import { DataTable } from '@/components';
import type { QueryResultSet } from '../../types';
import { ExerciseSection } from './ExerciseSection';

interface ExerciseResultsProps {
  queryResult: ReadonlyArray<QueryResultSet> | null;
  queryError: Error | null;
  hasExecuted: boolean;
  isComplete: boolean;
}

function ResultsPlaceholder({ message }: { message: string }) {
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
    </Box>
  );
}

export function ExerciseResults({ queryResult, queryError, hasExecuted, isComplete }: ExerciseResultsProps) {
  const [expanded, setExpanded] = useState(() => !isComplete);
  let content: ReactNode = null;
  const emptyMessage = 'Query executed successfully but returned no rows.';

  useEffect(() => {
    setExpanded(!isComplete);
  }, [isComplete]);

  if (queryError) {
    content = <ResultsPlaceholder message="No results due to query error" />;
  } else if (queryResult && queryResult.length > 0) {
    const [firstResult] = queryResult;
    const hasRows = Boolean(firstResult?.values && firstResult.values.length > 0);

    content = hasRows ? (
      <DataTable data={firstResult} />
    ) : (
      <ResultsPlaceholder message={emptyMessage} />
    );
  } else {
    content = (
      <ResultsPlaceholder
        message={hasExecuted ? emptyMessage : 'Execute your query to preview results.'}
      />
    );
  }

  return (
    <ExerciseSection
      title="Query Results"
      showDivider={false}
      contentSx={{ p: 0 }}
      actions={
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
      }
    >
      <Collapse in={expanded} unmountOnExit>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ px: 2.5, pb: 2.5 }}>{content}</Box>
      </Collapse>
    </ExerciseSection>
  );
}
