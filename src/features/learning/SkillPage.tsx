import { Suspense, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  Alert,
  Snackbar,
  CircularProgress,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { PlayArrow, CheckCircle, ArrowBack, Refresh, ArrowForward, RestartAlt, MenuBook, Lightbulb, Edit, EmojiEvents, Storage } from '@mui/icons-material';

import { SQLEditor } from '@/shared/components/SQLEditor';
import { DataTable } from '@/shared/components/DataTable';
import { useComponentState, useAppStore } from '@/store';
import { useDatabase } from '@/shared/hooks/useDatabase';
import type { SchemaKey } from '@/features/database/schemas';
import { contentIndex, type ContentMeta, skillExerciseLoaders } from '@/features/content';
import { useContent } from './hooks/useContent';
import { useSkillExerciseState } from './useSkillExerciseState';
import { DataExplorerTab } from './components/DataExplorerTab';
import { SKILL_SCHEMAS } from '@/constants';

type SkillExerciseLoader = (typeof skillExerciseLoaders)[keyof typeof skillExerciseLoaders];
type SkillExerciseModule = Awaited<ReturnType<SkillExerciseLoader>>;

export default function SkillPage() {
  const { skillId } = useParams<{ skillId: string }>();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(1); // Always start with practice tab

  // State management
  const [componentState, setComponentState] = useComponentState(skillId || '');
  const focusedMode = useAppStore((state) => state.focusedMode);

  // Define available tabs, filtering out story in focused mode
  const allTabs = [
    { key: 'story', label: 'Story', icon: <MenuBook /> },
    { key: 'practice', label: 'Practice', icon: <Edit /> },
    { key: 'theory', label: 'Theory', icon: <Lightbulb /> },
    { key: 'data', label: 'Data Explorer', icon: <Storage /> },
  ];
  
  const availableTabs = allTabs.filter(tab => !(focusedMode && tab.key === 'story'));

  // Helper function to check current tab
  const isCurrentTab = (tabKey: string) => {
    const tab = availableTabs[currentTab];
    return tab ? tab.key === tabKey : false;
  };

  // Skill content + exercise state
  const [skillModule, setSkillModule] = useState<{
    generate?: (utils: any) => any;
    validate?: (input: string, state: any, result: any) => boolean;
    solutionTemplate?: string;
  } | null>(null);
  const { currentExercise, startNewExercise, submitInput } = useSkillExerciseState(
    skillId || '',
    skillModule,
  );
  const [query, setQuery] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const exerciseCompleted = !!currentExercise?.done;

  // Skill metadata
  const [skillMeta, setSkillMeta] = useState<(ContentMeta & { database?: SchemaKey }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Database setup - use skill schema mapping or fallback to default
  const skillSchema = (skillId && skillId in SKILL_SCHEMAS) 
    ? SKILL_SCHEMAS[skillId as keyof typeof SKILL_SCHEMAS] as SchemaKey
    : 'companies' as SchemaKey;
  
  const {
    executeQuery,
    queryResult,
    queryError,
    isReady: dbReady,
    isExecuting,
    tableNames,
    resetDatabase: resetExerciseDb,
  } = useDatabase({
    context: 'exercise',
    schema: skillSchema,
    resetOnSchemaChange: true,
    persistent: false,
  });

  // Required exercises to mark skill as complete
  const requiredCount = 3;
  const isCompleted = (componentState.numSolved || 0) >= requiredCount;

  useEffect(() => {
    if (!skillId) return;

    let cancelled = false;
    setIsLoading(true);

    const entry = contentIndex.find(item => item.type === 'skill' && item.id === skillId) || null;
    setSkillMeta(entry);

    if (!entry) {
      setSkillModule(null);
      setIsLoading(false);
      return;
    }

    const loader = (skillId in skillExerciseLoaders)
      ? skillExerciseLoaders[skillId as keyof typeof skillExerciseLoaders]
      : undefined;
    if (!loader) {
      setSkillModule(null);
      setIsLoading(false);
      return;
    }

    loader()
      .then((mod: SkillExerciseModule) => {
        if (cancelled) return;
        setSkillModule({
          generate: typeof mod.generate === 'function' ? mod.generate : undefined,
          validate: typeof mod.validate === 'function' ? mod.validate : undefined,
          solutionTemplate: typeof mod.solutionTemplate === 'string' ? mod.solutionTemplate : undefined,
        });
      })
      .catch((err: unknown) => {
        console.error('Failed to load skill content:', err);
        if (!cancelled) setSkillModule(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [skillId]);

  useEffect(() => {
    if (componentState.type !== 'skill') {
      setComponentState({ type: 'skill' });
    }
  }, [componentState.type, setComponentState]);

  // Cleanup exercise database when leaving the page
  useEffect(() => {
    return () => {
      resetExerciseDb();
    };
  }, [resetExerciseDb]);

  // Always default to practice tab
  useEffect(() => {
    const practiceIndex = availableTabs.findIndex(tab => tab.key === 'practice');
    if (practiceIndex >= 0) {
      setCurrentTab(practiceIndex);
      setComponentState({ tab: 'practice' });
    }
  }, [availableTabs.length, focusedMode]); // Only depend on tab count and focused mode changes

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    const selectedTab = availableTabs[newValue];
    if (selectedTab) {
      setComponentState({ tab: selectedTab.key });
    }
  };

  const TheoryContent = useContent(skillMeta?.id, 'Theory');
  const StoryContent = useContent(skillMeta?.id, 'Story');

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

  // Initialize first exercise when DB ready
  useEffect(() => {
    if (dbReady && !currentExercise) {
      startNewExercise();
    }
  }, [dbReady, currentExercise, startNewExercise]);

  // Also start when content module becomes available
  useEffect(() => {
    if (dbReady && skillModule && !currentExercise) {
      startNewExercise();
    }
  }, [dbReady, skillModule, currentExercise, startNewExercise]);

  // Handle live query execution (for preview results)
  const handleLiveExecute = async (liveQuery: string) => {
    if (!dbReady || !liveQuery.trim() || exerciseCompleted) return;
    
    try {
      await executeQuery(liveQuery);
      // Live execution just updates the query results without checking the answer
    } catch (error: any) {
      // Let the error be shown in the UI - the executeQuery already sets queryError state
      // No need to handle it here since the error will be displayed in the Results section
      console.debug('Live query execution failed:', error);
    }
  };

  // Check answer (for actual submission)
  const handleExecute = async (override?: string) => {
    const effectiveQuery = (override ?? query).trim();
    if (!currentExercise || !effectiveQuery) return;
    // Prevent counting multiple completions on the same exercise instance
    if (exerciseCompleted) {
      setFeedback({ message: 'Already completed. Click Next Exercise to continue.', type: 'info' });
      return;
    }
    if (!dbReady) {
      setFeedback({ message: 'Database is still loading. Please try again in a moment.', type: 'info' });
      return;
    }

    try {
      const result = await executeQuery(effectiveQuery);

      const outcome = submitInput(effectiveQuery, result);
      const isCorrect = !!outcome?.correct;
      if (isCorrect) {
        const currentNumSolved = componentState.numSolved || 0;
        const wasAlreadyCompleted = currentNumSolved >= requiredCount;
        const newNumSolved = currentNumSolved + 1; // submitInput will increment this
        
        // Show completion dialog if we just reached mastery
        if (!wasAlreadyCompleted && newNumSolved >= requiredCount) {
          setShowCompletionDialog(true);
        } else {
          // Only show regular feedback if not showing completion dialog
          setFeedback({
            message: `Excellent! Exercise completed successfully! (${Math.min(newNumSolved, requiredCount)}/${requiredCount})`,
            type: 'success'
          });
        }
      } else {
        setFeedback({
          message: 'Not quite right. Check your query and try again!',
          type: 'info'
        });
      }
    } catch (error: any) {
      setFeedback({
        message: `Query error: ${error?.message || 'Unknown error'}`,
        type: 'error',
      });
    }
  };

  // Reset database without changing the exercise instance
  const handleResetDatabase = () => {
    resetExerciseDb();
    setQuery('');
    setFeedback({ message: 'Database reset - try again!', type: 'info' });
  };

  // Autocomplete solution for the current exercise
  const handleAutoComplete = async () => {
    if (!currentExercise) return;

    // Prefer explicit expectedQuery if provided by generator
    let solution = currentExercise.expectedQuery;

    // Otherwise use solution template if available
    if (!solution && skillModule?.solutionTemplate) {
      solution = skillModule.solutionTemplate.replace(/{{(.*?)}}/g, (_m, p1) => {
        const key = String(p1).trim();
        const v = currentExercise.state?.[key];
        return v !== undefined && v !== null ? String(v) : '';
      });
    }

    if (!solution) {
      setFeedback({ message: 'No auto-solution available for this exercise.', type: 'info' });
      return;
    }

    setQuery(solution);
    setFeedback({ message: 'Solution inserted. Press Run & Check to execute.', type: 'info' });
  };

  // New exercise
  const handleNewExercise = () => {
    startNewExercise();
    setQuery('');
    setFeedback(null);
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!skillMeta) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Alert severity="error">
          Skill not found. <Button onClick={() => navigate('/learn')}>Return to learning</Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Button startIcon={<ArrowBack />} sx={{ mr: 2 }} onClick={() => navigate('/learn')}>
          Back to Learning
        </Button>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          {skillMeta.name}
          {isCompleted && <CheckCircle color="success" sx={{ ml: 1 }} />}
        </Typography>
        {/* Progress Indicator */}
        {isCurrentTab('practice') && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Progress:
            </Typography>
            <Box sx={{ 
              bgcolor: isCompleted ? 'success.main' : 'primary.main',
              color: 'white',
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              fontSize: '0.875rem',
              fontWeight: 500
            }}>
              {Math.min(componentState.numSolved || 0, requiredCount)}/{requiredCount}
            </Box>
            {isCompleted && (
              <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
                Mastered!
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {/* Description */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body1" color="text.secondary">
          {skillMeta.description}
        </Typography>
      </Box>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={currentTab} onChange={handleTabChange}>
            {availableTabs.map((tab) => (
              <Tab 
                key={tab.key} 
                label={tab.label} 
                icon={tab.icon} 
                iconPosition="start" 
              />
            ))}
          </Tabs>
        </Box>
        
        {/* Tab Content */}
        {isCurrentTab('practice') && (
          <CardContent>
            {/* Exercise Description */}
            {currentExercise && (
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {(componentState.numSolved || 0) >= requiredCount 
                      ? `Practice Exercise ${(componentState.numSolved || 0) + 1 - requiredCount}`
                      : `Exercise ${(componentState.numSolved || 0) + 1}`
                    }
                  </Typography>
                  <Typography variant="body1">
                    {currentExercise.description}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* SQL Editor */}
            <Card sx={{ mb: 2 }}>
              <Box sx={{
                p: 1,
                borderBottom: 1,
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="subtitle2">
                    Write your SQL query:
                  </Typography>
                  {tableNames.length > 0 && (
                    <Typography variant="caption" color="text.secondary">
                      Tables: {tableNames.join(', ')}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    onClick={handleAutoComplete}
                    startIcon={<CheckCircle />}
                    disabled={!currentExercise || isExecuting}
                  >
                    Auto-complete
                  </Button>
                  <Button
                    size="small"
                    startIcon={<RestartAlt />}
                    onClick={handleResetDatabase}
                    disabled={!dbReady || isExecuting}
                    title="Reset the current exercise database"
                  >
                    Reset Database
                  </Button>
                  {!exerciseCompleted ? (
                    <Button
                      size="small"
                      startIcon={<Refresh />}
                      onClick={handleNewExercise}
                      disabled={isExecuting}
                      title="Try a different exercise"
                    >
                      Try Another
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<ArrowForward />}
                      onClick={handleNewExercise}
                      title="Proceed to the next exercise"
                    >
                      Next Exercise
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<PlayArrow />}
                    onClick={() => { void handleExecute(); }}
                    disabled={!currentExercise || !query.trim() || isExecuting || exerciseCompleted || !dbReady}
                  >
                    Run & Check
                  </Button>
                </Box>
              </Box>
              <CardContent sx={{ p: 0 }}>
                <SQLEditor
                  value={query}
                  onChange={setQuery}
                  height="200px"
                  onExecute={handleExecute}
                  onLiveExecute={handleLiveExecute}
                  enableLiveExecution={true}
                  liveExecutionDelay={500}
                  showResults={false}
                />
              </CardContent>
            </Card>

            {/* Results */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Query Results
                </Typography>
                {queryError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {queryError instanceof Error ? queryError.message : 'Query execution failed'}
                  </Alert>
                )}
                {queryResult && queryResult.length > 0 ? (
                  <DataTable data={queryResult[0]} />
                ) : (
                  <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                    Run your query to see results
                  </Typography>
                )}
              </CardContent>
            </Card>
          </CardContent>
        )}

        {/* Theory Tab */}
        {isCurrentTab('theory') && (
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Theory
            </Typography>
            {renderContent(TheoryContent, 'Theory coming soon.')}
          </CardContent>
        )}

        {/* Story Tab */}
        {isCurrentTab('story') && (
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Story
            </Typography>
            {renderContent(StoryContent, 'Story coming soon.')}
          </CardContent>
        )}

        {/* Data Explorer Tab */}
        {isCurrentTab('data') && (
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Data Explorer
            </Typography>
            {dbReady ? (
              <DataExplorerTab schema={skillSchema} />
            ) : (
              <Typography variant="body1" color="text.secondary">
                Database is loading...
              </Typography>
            )}
          </CardContent>
        )}
      </Card>

      {/* Feedback Snackbar */}
      <Snackbar
        open={!!feedback}
        autoHideDuration={6000}
        onClose={() => setFeedback(null)}
      >
        <Alert
          onClose={() => setFeedback(null)}
          severity={feedback?.type}
          sx={{ width: '100%' }}
        >
          {feedback?.message}
        </Alert>
      </Snackbar>

      {/* Skill Completion Dialog */}
      <Dialog
        open={showCompletionDialog}
        onClose={() => setShowCompletionDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: 3,
            border: '2px solid',
            borderColor: 'success.main',
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <EmojiEvents sx={{ fontSize: 48, color: '#FFD700' }} />
          </Box>
          <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'success.main' }}>
            Skill Mastered!
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="h6" gutterBottom>
            Congratulations!
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            You've successfully completed all <strong>3 exercises</strong> for the skill:
          </Typography>
          <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold', mb: 2 }}>
            "{skillMeta?.name}"
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You've demonstrated mastery of this skill and can now confidently apply it in real-world scenarios!
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
          <Button
            onClick={() => setShowCompletionDialog(false)}
            variant="contained"
            size="large"
            startIcon={<CheckCircle />}
            sx={{ 
              px: 4,
              py: 1,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1.1rem'
            }}
          >
            Awesome!
          </Button>
          
          {/* Show story button only if not in focused mode and story tab is available */}
          {!focusedMode && availableTabs.some(tab => tab.key === 'story') && (
            <Button
              onClick={() => {
                setShowCompletionDialog(false);
                const storyIndex = availableTabs.findIndex(tab => tab.key === 'story');
                if (storyIndex >= 0) {
                  setCurrentTab(storyIndex);
                  setComponentState({ tab: 'story' });
                }
              }}
              variant="outlined"
              size="large"
              startIcon={<MenuBook />}
              sx={{ 
                px: 3,
                py: 1,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1.1rem'
              }}
            >
              See the Story
            </Button>
          )}
          
          <Button
            onClick={() => navigate('/learn')}
            variant="outlined"
            size="large"
            sx={{ 
              px: 3,
              py: 1,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1.1rem'
            }}
          >
            Continue Learning
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

