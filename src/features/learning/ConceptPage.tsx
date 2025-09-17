import { Suspense, useMemo, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Tabs,
  Tab,
  Alert,
  Paper,
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle,
  School,
  Lightbulb,
  MenuBook,
  Code,
} from '@mui/icons-material';

import { useComponentState } from '@/store';
import { useConceptDatabase } from '@/shared/hooks/useDatabase';
import { SQLEditor } from '@/shared/components/SQLEditor';
import { DataTable } from '@/shared/components/DataTable';
import { contentIndex, type ContentMeta } from '@/features/content';
import { useContent } from './hooks/useContent';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`concept-tabpanel-${index}`}
      aria-labelledby={`concept-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ConceptPage() {
  const { conceptId } = useParams<{ conceptId: string }>();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);

  // Use new store
  const [componentState, setComponentState] = useComponentState(conceptId || '');

  // Database for concept demonstrations
  const {
    executeQuery,
    queryResult,
    queryError,
    isExecuting,
    tableNames
  } = useConceptDatabase('companies');

  // Demo query state for interactive examples
  const [demoQuery, setDemoQuery] = useState('SELECT * FROM companies LIMIT 5;');

  const conceptMeta = useMemo<ContentMeta | undefined>(() => {
    if (!conceptId) return undefined;
    return contentIndex.find(item => item.type === 'concept' && item.id === conceptId);
  }, [conceptId]);

  useEffect(() => {
    if (componentState.type !== 'concept') {
      setComponentState({ type: 'concept' });
    }
  }, [componentState.type, setComponentState]);

  // Restore saved tab or default to theory (index 0)
  useEffect(() => {
    if (componentState.tab) {
      const tabIndex = ['theory', 'summary', 'examples', 'story'].indexOf(componentState.tab);
      if (tabIndex >= 0) setCurrentTab(tabIndex);
    } else {
      // Default to theory tab and save it
      setCurrentTab(0);
      setComponentState({ tab: 'theory' });
    }
  }, [componentState.tab, setComponentState]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    const tabNames = ['theory', 'summary', 'examples', 'story'];
    setComponentState({ tab: tabNames[newValue] });
  };

  const handleExecuteDemo = async () => {
    try {
      await executeQuery(demoQuery);
    } catch (error) {
      // Error is handled by the database hook
      console.error('Demo query failed:', error);
    }
  };

  if (!conceptMeta) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Concept not found
          <Button onClick={() => navigate('/learn')}>Return to learning</Button>
        </Alert>
      </Container>
    );
  }

  const isCompleted = componentState.understood || false;

  const handleComplete = () => {
    setComponentState({ understood: true });
  };

  const TheoryContent = useContent(conceptMeta?.id, 'Theory');
  const SummaryContent = useContent(conceptMeta?.id, 'Summary');
  const StoryContent = useContent(conceptMeta?.id, 'Story');

  const renderContent = (
    Component: ReturnType<typeof useContent>,
    emptyMessage: string,
  ) => {
    if (!Component) {
      return <Typography variant="body1" color="text.secondary">{emptyMessage}</Typography>;
    }
    return (
      <Suspense fallback={<Typography variant="body1" color="text.secondary">Loading content...</Typography>}>
        <Component />
      </Suspense>
    );
  };

  // Demo queries based on concept
  const getDemoQueries = (conceptId: string) => {
    const demoQueries: Record<string, string[]> = {
      'database': [
        'SELECT * FROM companies LIMIT 5;',
        'SELECT COUNT(*) as total_companies FROM companies;',
        'SELECT DISTINCT country FROM companies;'
      ],
      'database-table': [
        'SELECT company_name, country FROM companies LIMIT 5;',
        'SELECT * FROM companies WHERE country = "Netherlands";',
        'SELECT company_name, num_employees FROM companies ORDER BY num_employees DESC LIMIT 3;'
      ],
      'data-types': [
        'SELECT company_name, founded_year, num_employees FROM companies LIMIT 5;',
        'SELECT typeof(company_name), typeof(founded_year), typeof(num_employees) FROM companies LIMIT 1;'
      ]
    };
    return demoQueries[conceptId] || ['SELECT * FROM companies LIMIT 5;'];
  };

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/learn')}
          sx={{ mr: 2 }}
        >
          Back to Learning
        </Button>
        <School color="primary" sx={{ mr: 1 }} />
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          {conceptMeta.name}
          {isCompleted && <CheckCircle color="success" sx={{ ml: 1 }} />}
        </Typography>
      </Box>

      {/* Concept Info */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" color="text.secondary">
          {conceptMeta.description}
        </Typography>
      </Box>

      {/* Prerequisites */}
      {conceptMeta.prerequisites && conceptMeta.prerequisites.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <strong>Prerequisites:</strong> {conceptMeta.prerequisites.join(', ')}
        </Alert>
      )}

      {/* Content Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={currentTab} onChange={handleTabChange}>
            <Tab label="Theory" icon={<Lightbulb />} iconPosition="start" />
            <Tab label="Summary" icon={<MenuBook />} iconPosition="start" />
            <Tab label="Examples" icon={<Code />} iconPosition="start" />
            <Tab label="Story" icon={<MenuBook />} iconPosition="start" />
          </Tabs>
        </Box>

        <TabPanel value={currentTab} index={0}>
          <CardContent>
            <Typography variant="h5" gutterBottom>Theory</Typography>
            {renderContent(TheoryContent, 'Theory content coming soon.')}
          </CardContent>
        </TabPanel>

        <TabPanel value={currentTab} index={3}>
          <CardContent>
            <Typography variant="h5" gutterBottom>Story</Typography>
            {renderContent(StoryContent, 'Story coming soon.')}
          </CardContent>
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <CardContent>
            <Typography variant="h5" gutterBottom>Summary</Typography>
            {renderContent(SummaryContent, 'Summary coming soon.')}
          </CardContent>
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          <CardContent>
            <Typography variant="h5" gutterBottom>Interactive Examples</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Try these example queries to understand the concept better:
            </Typography>

            {/* Database Info */}
            {tableNames.length > 0 && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Available tables:</strong> {tableNames.join(', ')}
                </Typography>
              </Alert>
            )}

            {/* Demo Query Buttons */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Quick Examples:</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {getDemoQueries(conceptId || '').map((query, index) => (
                  <Button
                    key={index}
                    size="small"
                    variant="outlined"
                    onClick={() => setDemoQuery(query)}
                    sx={{ textTransform: 'none', fontFamily: 'monospace', fontSize: '0.75rem' }}
                  >
                    {query.length > 30 ? `${query.substring(0, 30)}...` : query}
                  </Button>
                ))}
              </Box>
            </Box>

            {/* SQL Editor */}
            <Paper sx={{ mb: 2 }}>
              <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
                <Button
                  startIcon={<Code />}
                  onClick={handleExecuteDemo}
                  disabled={!demoQuery.trim() || isExecuting}
                  variant="contained"
                  size="small"
                >
                  Run Example
                </Button>
              </Box>
              <SQLEditor
                value={demoQuery}
                onChange={setDemoQuery}
                height="150px"
                onExecute={handleExecuteDemo}
                showResults={false}
              />
            </Paper>

            {/* Results */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Results
              </Typography>
              {queryError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {queryError instanceof Error ? queryError.message : 'Query execution failed'}
                </Alert>
              )}
              {queryResult && queryResult.length > 0 ? (
                <DataTable data={queryResult[0]} maxRows={10} compact />
              ) : (
                <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
                  Run an example query to see results
                </Typography>
              )}
            </Paper>
          </CardContent>
        </TabPanel>
      </Card>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <div />

        <Box sx={{ display: 'flex', gap: 2 }}>
          {!isCompleted && (
            <Button
              variant="contained"
              onClick={handleComplete}
              startIcon={<CheckCircle />}
            >
              Mark as Complete
            </Button>
          )}
        </Box>
      </Box>
    </Container>
  );
}

