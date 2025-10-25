import { Box, Paper, Typography } from '@mui/material';

import { DataTable } from '@/shared/components/DataTable';
import type { QueryResultSet } from '../../types';

interface ExerciseResultsProps {
  queryResult: ReadonlyArray<QueryResultSet> | null;
  queryError: Error | null;
  hasExecuted: boolean;
}

function renderResultBody(queryResult: ReadonlyArray<QueryResultSet> | null) {
  if (queryResult && queryResult.length > 0) {
    const [firstResult] = queryResult;
    const hasRows = firstResult && firstResult.values && firstResult.values.length > 0;

    if (hasRows) {
      return <DataTable data={firstResult} />;
    }

    return (
      <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'action.hover' }}>
        <Typography color="text.secondary">Query executed successfully but returned no rows.</Typography>
      </Paper>
    );
  }

  return null;
}

export function ExerciseResults({ queryResult, queryError, hasExecuted }: ExerciseResultsProps) {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Query Results
      </Typography>
      {queryError ? (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'action.hover' }}>
          <Typography color="text.secondary">No results due to query error</Typography>
        </Paper>
      ) : queryResult && queryResult.length > 0 ? (
        renderResultBody(queryResult)
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'action.hover' }}>
          <Typography color="text.secondary">
            {hasExecuted ? 'Query executed successfully but returned no rows.' : 'Execute your query to preview results.'}
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
