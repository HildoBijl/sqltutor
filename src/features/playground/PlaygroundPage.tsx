import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  ButtonGroup,
  Paper,
  Alert,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Container,
} from '@mui/material';
import {
  PlayArrow,
  Save,
  ContentCopy,
  Clear,
  Download,
  Refresh,
} from '@mui/icons-material';
import { SQLEditor } from '@/shared/components/SQLEditor';
import { DataTable } from '@/shared/components/DataTable';
import { usePlaygroundDatabase } from '@/shared/hooks/useDatabase';
import { schemas, getSchemaDescription, type SchemaKey } from '@/features/database/schemas';
import { useAppStore } from '@/store';

interface QueryHistory {
  query: string;
  timestamp: Date;
  success: boolean;
  rowCount?: number;
}

export default function PlaygroundPage() {
  const [selectedSchema, setSelectedSchema] = useState<SchemaKey>('companiesAndPositions');
  const [query, setQuery] = useState('SELECT * FROM companies LIMIT 10;');
  const [currentTab, setCurrentTab] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  // Use the new playground database hook
  const {
    executeQuery,
    queryResult,
    queryError,
    isExecuting,
    tableNames,
    resetDatabase,
    isReady
  } = usePlaygroundDatabase(selectedSchema);

  // Get saved queries from store
  const savedQueries = useAppStore(state => state.components.playground?.savedQueries || []);
  const updatePlayground = useAppStore(state => state.updateComponent);

  // Get history from store
  const history: QueryHistory[] = useAppStore(state =>
    state.components.playground?.history || []
  );

  const handleExecute = async () => {
    try {
      const result = await executeQuery(query);

      // Add to history
      const newHistoryEntry: QueryHistory = {
        query,
        timestamp: new Date(),
        success: true,
        rowCount: result?.[0]?.values?.length || 0,
      };

      updatePlayground('playground', {
        history: [newHistoryEntry, ...history.slice(0, 49)]
      });

      setMessage(`Query executed successfully (${result?.[0]?.values?.length || 0} rows)`);
    } catch (error) {
      const newHistoryEntry: QueryHistory = {
        query,
        timestamp: new Date(),
        success: false,
      };

      updatePlayground('playground', {
        history: [newHistoryEntry, ...history.slice(0, 49)]
      });

      setMessage(`Query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSaveQuery = () => {
    const name = prompt('Enter a name for this query:');
    if (name) {
      const newSavedQueries = [...savedQueries, { name, query }];
      updatePlayground('playground', { savedQueries: newSavedQueries });
      setMessage('Query saved successfully');
    }
  };

  const handleLoadQuery = (savedQuery: { name: string; query: string }) => {
    setQuery(savedQuery.query);
    setMessage(`Loaded: ${savedQuery.name}`);
  };

  const handleCopyQuery = async () => {
    try {
      await navigator.clipboard.writeText(query);
      setMessage('Query copied to clipboard');
    } catch (error) {
      setMessage('Failed to copy query');
    }
  };

  const handleClearQuery = () => {
    setQuery('');
  };

  const handleExportResults = () => {
    if (!queryResult || queryResult.length === 0) return;

    const data = queryResult[0];
    const csv = [
      data.columns.join(','),
      ...data.values.map((row: any[]) => row.map((cell: any) => JSON.stringify(cell)).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'query_results.csv';
    a.click();
    URL.revokeObjectURL(url);

    setMessage('Results exported as CSV');
  };

  const handleResetDatabase = () => {
    if (confirm('Are you sure you want to reset the database to its initial state? This will lose all your changes.')) {
      resetDatabase();
      setMessage('Database reset successfully');
    }
  };

  const handleSchemaChange = (newSchema: SchemaKey) => {
    setSelectedSchema(newSchema);
    // Update the default query based on the new schema
    const firstTable = getFirstTableFromSchema(newSchema);
    setQuery(`SELECT * FROM ${firstTable} LIMIT 10;`);
  };

  const handleDeleteSavedQuery = (index: number) => {
    const newSavedQueries = savedQueries.filter((_: any, i: number) => i !== index);
    updatePlayground('playground', { savedQueries: newSavedQueries });
    setMessage('Query deleted');
  };

  // Helper to get first table name from schema
  const getFirstTableFromSchema = (schemaKey: SchemaKey): string => {
    const schema = schemas[schemaKey];
    const match = schema.match(/CREATE TABLE (\w+)/);
    return match ? match[1] : 'companies';
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          SQL Playground
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Experiment with SQL queries on sample databases. Your changes persist until you reset.
        </Typography>
      </Box>

      {/* Database Selector */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <FormControl sx={{ minWidth: 250 }}>
          <InputLabel>Database Schema</InputLabel>
          <Select
            value={selectedSchema}
            onChange={(e) => handleSchemaChange(e.target.value as SchemaKey)}
            label="Database Schema"
          >
            {Object.keys(schemas).map(schema => (
              <MenuItem key={schema} value={schema}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {schema.charAt(0).toUpperCase() + schema.slice(1)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {getSchemaDescription(schema as SchemaKey)}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleResetDatabase}
          disabled={!isReady}
        >
          Reset Database
        </Button>
      </Box>

      {/* Available Tables */}
      {tableNames.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Available tables:</strong> {tableNames.join(', ')}
          </Typography>
        </Alert>
      )}

      {/* Messages */}
      {message && (
        <Alert
          severity="info"
          sx={{ mb: 2 }}
          onClose={() => setMessage(null)}
        >
          {message}
        </Alert>
      )}

      {/* SQL Editor */}
      <Paper sx={{ mb: 2 }}>
        <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
          <ButtonGroup size="small">
            <Button
              startIcon={<PlayArrow />}
              onClick={handleExecute}
              disabled={!query.trim() || isExecuting || !isReady}
              variant="contained"
            >
              Execute
            </Button>
            <Button startIcon={<Save />} onClick={handleSaveQuery}>
              Save
            </Button>
            <Button startIcon={<ContentCopy />} onClick={handleCopyQuery}>
              Copy
            </Button>
            <Button startIcon={<Clear />} onClick={handleClearQuery}>
              Clear
            </Button>
            {queryResult && queryResult.length > 0 && (
              <Button startIcon={<Download />} onClick={handleExportResults}>
                Export CSV
              </Button>
            )}
          </ButtonGroup>
        </Box>

        <SQLEditor
          value={query}
          onChange={setQuery}
          height="300px"
          onExecute={handleExecute}
          showResults={false}
        />
      </Paper>

      {/* Results/History Tabs */}
      <Paper>
        <Tabs value={currentTab} onChange={(_, v) => setCurrentTab(v)}>
          <Tab label="Results" />
          <Tab label="History" />
          <Tab label="Saved Queries" />
        </Tabs>

        <Box sx={{ p: 2 }}>
          {/* Results Tab */}
          {currentTab === 0 && (
            <>
              {queryError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {queryError instanceof Error ? queryError.message : 'Query execution failed'}
                </Alert>
              )}

              {queryResult && queryResult.length > 0 ? (
                <DataTable data={queryResult[0]} />
              ) : (
                <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                  Execute a query to see results
                </Typography>
              )}
            </>
          )}

          {/* History Tab */}
          {currentTab === 1 && (
            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              {history.length > 0 ? (
                history.map((item, index) => (
                  <Paper
                    key={index}
                    sx={{
                      p: 2,
                      mb: 1,
                      bgcolor: item.success ? 'action.hover' : 'error.light',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.selected' },
                    }}
                    onClick={() => setQuery(item.query)}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: 'monospace',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '70%'
                        }}
                      >
                        {item.query}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(item.timestamp).toLocaleString()}
                      </Typography>
                    </Box>
                    {item.success && item.rowCount !== undefined && (
                      <Typography variant="caption" color="text.secondary">
                        {item.rowCount} rows returned
                      </Typography>
                    )}
                  </Paper>
                ))
              ) : (
                <Typography color="text.secondary" align="center">
                  No query history yet
                </Typography>
              )}
            </Box>
          )}

          {/* Saved Queries Tab */}
          {currentTab === 2 && (
            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              {savedQueries.length > 0 ? (
                savedQueries.map((saved: any, index: number) => (
                  <Paper
                    key={index}
                    sx={{
                      p: 2,
                      mb: 1,
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Box sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={() => handleLoadQuery(saved)}>
                        <Typography variant="subtitle2" gutterBottom>
                          {saved.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: 'monospace',
                            color: 'text.secondary',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {saved.query}
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleDeleteSavedQuery(index)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </Paper>
                ))
              ) : (
                <Typography color="text.secondary" align="center">
                  No saved queries yet
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
}
