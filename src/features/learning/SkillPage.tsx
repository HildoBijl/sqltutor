import { Suspense, useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  Container,
  Typography,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
} from '@mui/material';
import { CheckCircle, ArrowBack, Refresh, ArrowForward, RestartAlt, MenuBook, Lightbulb, Edit, EmojiEvents, Storage } from '@mui/icons-material';

import { SQLEditor } from '@/shared/components/SQLEditor';
import { DataTable } from '@/shared/components/DataTable';
import { useComponentState, useAppStore, type SkillComponentState } from '@/store';
import { useDatabase } from '@/shared/hooks/useDatabase';
import type { SchemaKey } from '@/features/database/schemas';
import { contentIndex, type ContentMeta, skillExerciseLoaders } from '@/features/content';
import { useContent } from './hooks/useContent';
import { useSkillExerciseState, type SkillExerciseModuleLike } from './useSkillExerciseState';
import type { ExecutionResult as SqlExecutionResult } from '@/features/content/types';
import { DataExplorerTab } from './components/DataExplorerTab';
import { SKILL_SCHEMAS } from '@/constants';

type SkillExerciseLoader = (typeof skillExerciseLoaders)[keyof typeof skillExerciseLoaders];
type SkillExerciseModule = Awaited<ReturnType<SkillExerciseLoader>>;

export default function SkillPage() {
  const { skillId } = useParams<{ skillId: string }>();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(1); // Always start with practice tab

  // State management
  const [componentState, setComponentState] = useComponentState<SkillComponentState>(skillId || '', 'skill');
  const hideStories = useAppStore((state) => state.hideStories);

  // Define available tabs, filtering out story if hideStories is enabled
  const allTabs = [
    { key: 'story', label: 'Story', icon: <MenuBook /> },
    { key: 'practice', label: 'Practice', icon: <Edit /> },
    { key: 'theory', label: 'Theory', icon: <Lightbulb /> },
    { key: 'data', label: 'Data Explorer', icon: <Storage /> },
  ];
  
  const availableTabs = allTabs.filter(tab => !(hideStories && tab.key === 'story'));

  // Helper function to check current tab
  const isCurrentTab = (tabKey: string) => {
    const tab = availableTabs[currentTab];
    return tab ? tab.key === tabKey : false;
  };

  // Skill content + exercise state
  const [skillModule, setSkillModule] = useState<SkillExerciseModuleLike | null>(null);
  const {
    progress: exerciseProgress,
    status: exerciseStatus,
    currentExercise,
    dispatch: exerciseDispatch,
    solution: exerciseSolution,
    recordAttempt,
  } = useSkillExerciseState(
    skillId || '',
    skillModule,
  );
  const [query, setQuery] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const exerciseCompleted = exerciseStatus === 'correct';

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

  const normalizeForHistory = (value: string) => value.toLowerCase().replace(/\s+/g, ' ').trim().replace(/;$/, '');

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
        const extendedMod = mod as any;
        const moduleConfig: SkillExerciseModuleLike = {
          generate: typeof extendedMod.generate === 'function' ? extendedMod.generate : undefined,
          validate: typeof extendedMod.validate === 'function' ? extendedMod.validate : undefined,
          validateInput: typeof extendedMod.validateInput === 'function' ? extendedMod.validateInput : undefined,
          validateOutput: typeof extendedMod.validateOutput === 'function' ? extendedMod.validateOutput : undefined,
          verifyOutput: typeof extendedMod.verifyOutput === 'function' ? extendedMod.verifyOutput : undefined,
          getSolution: typeof extendedMod.getSolution === 'function' ? extendedMod.getSolution : undefined,
          runDemo: typeof extendedMod.runDemo === 'function' ? extendedMod.runDemo : undefined,
          solutionTemplate: typeof extendedMod.solutionTemplate === 'string' ? extendedMod.solutionTemplate : undefined,
          messages: typeof extendedMod.messages === 'object' && extendedMod.messages !== null ? extendedMod.messages : undefined,
        };
        setSkillModule(moduleConfig);
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
  }, [availableTabs.length, hideStories]); // Only depend on tab count and hideStories changes

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

  // Initialize first exercise when database and module are ready
  useEffect(() => {
    if (!dbReady || !skillModule) return;
    if (!exerciseProgress.exercise) {
      exerciseDispatch({ type: 'generate' });
    }
  }, [dbReady, skillModule, exerciseProgress.exercise, exerciseDispatch]);

  // Handle live query execution (for preview results)
  const handleLiveExecute = useCallback(async (liveQuery: string) => {
    if (!dbReady || exerciseCompleted || !currentExercise) return;
    
    // Clear feedback if query is empty
    if (!liveQuery.trim()) {
      setFeedback(null);
      return;
    }
    
    try {
      // Just execute the query - don't do validation/verification for live updates
      // This keeps typing responsive
      await executeQuery(liveQuery);
      // The results will show in the table, but we won't provide feedback during typing
    } catch (error: any) {
      // Silently fail for live execution - errors will show in the UI via queryError
      console.debug('Live query execution failed:', error);
    }
  }, [dbReady, exerciseCompleted, currentExercise, executeQuery]);

  // Check answer (for actual submission)
  const handleExecute = useCallback(async (override?: string) => {
    const rawQuery = override ?? query;
    const effectiveQuery = rawQuery.trim();
    if (!currentExercise || !effectiveQuery) return;

    if (exerciseCompleted) {
      setFeedback({ message: 'Already completed. Click Next Exercise to continue.', type: 'info' });
      return;
    }

    if (!dbReady) {
      setFeedback({ message: 'Database is still loading. Please try again in a moment.', type: 'info' });
      return;
    }

    const normalized = normalizeForHistory(effectiveQuery);
    const previousAttempt = exerciseProgress.attempts.find((attempt) => attempt.normalizedInput === normalized);
    if (previousAttempt) {
      exerciseDispatch({ type: 'input', input: effectiveQuery, result: null });
      setFeedback({
        message: previousAttempt.feedback || 'You already tried this exact query.',
        type:
          previousAttempt.status === 'correct'
            ? 'success'
            : previousAttempt.status === 'invalid'
            ? 'warning'
            : 'info',
      });
      return;
    }

    const supportsOutputValidation =
      typeof skillModule?.validateOutput === 'function' && typeof skillModule?.verifyOutput === 'function';

    if (!supportsOutputValidation) {
      console.warn('Skill module missing verifyOutput/validateOutput implementation:', skillId);
      setFeedback({
        message: 'This exercise cannot be verified yet because it lacks result validation. Please try another exercise.',
        type: 'warning',
      });
      return;
    }

    try {
      let execution: SqlExecutionResult;
      try {
        const output = await executeQuery(effectiveQuery);
        execution = { success: true, output };
      } catch (error: any) {
        const err = error instanceof Error ? error : new Error(String(error));
        execution = { success: false, error: err };
      }

      const validation = skillModule!.validateOutput!(currentExercise, execution);

      if (!validation.ok) {
        recordAttempt({ input: effectiveQuery, result: execution.output ?? null, validation });
        setFeedback({
          message: validation.message || 'Query result has invalid structure.',
          type: execution.success ? 'warning' : 'error',
        });
        return;
      }

      const outputForVerification = execution.output ?? [];
      const verification = skillModule!.verifyOutput!(currentExercise, outputForVerification);

      recordAttempt({
        input: effectiveQuery,
        result: execution.output ?? null,
        validation,
        verification,
      });

      if (verification.correct) {
        const previousSolvedCount = componentState.numSolved || 0;
        const alreadyCounted = exerciseCompleted;
        const updatedSolvedCount = alreadyCounted ? previousSolvedCount : previousSolvedCount + 1;

        if (!alreadyCounted) {
          setComponentState((prev) => ({ ...prev, numSolved: updatedSolvedCount }));
        }

        const reachedMasteryNow =
          !alreadyCounted && updatedSolvedCount >= requiredCount && previousSolvedCount < requiredCount;

        if (reachedMasteryNow) {
          setShowCompletionDialog(true);
        } else {
          const progressDisplay = Math.min(updatedSolvedCount, requiredCount);
          setFeedback({
            message:
              verification.message ||
              `Excellent! Exercise completed successfully! (${progressDisplay}/${requiredCount})`,
            type: 'success',
          });
        }
      } else {
        setFeedback({
          message: verification.message || 'Not quite right. Check your query and try again!',
          type: 'info',
        });
      }
    } catch (error: any) {
      setFeedback({
        message: 'Query error: ' + (error?.message || 'Unknown error'),
        type: 'error',
      });
    }
  }, [
    query,
    currentExercise,
    exerciseCompleted,
    dbReady,
    normalizeForHistory,
    exerciseProgress.attempts,
    skillModule,
    executeQuery,
    recordAttempt,
    componentState.numSolved,
    requiredCount,
    setComponentState,
    exerciseDispatch,
    skillId,
  ]);

  // Reset database without changing the exercise instance
  const handleResetDatabase = useCallback(() => {
    resetExerciseDb();
    exerciseDispatch({ type: 'reset', keepExercise: true });
    setQuery('');
    setFeedback({ message: 'Database reset - try again!', type: 'info' });
  }, [resetExerciseDb, exerciseDispatch]);

  // Autocomplete solution for the current exercise
  const handleAutoComplete = useCallback(async () => {
    if (!currentExercise) return;

    let solution = exerciseSolution;

    if (!solution && typeof skillModule?.getSolution === 'function') {
      solution = skillModule.getSolution(currentExercise) ?? undefined;
    }

    if (!solution && (currentExercise as any).expectedQuery) {
      solution = (currentExercise as any).expectedQuery;
    }

    if (!solution && skillModule?.solutionTemplate) {
      solution = skillModule.solutionTemplate.replace(/{{(.*?)}}/g, (_m, token) => {
        const key = String(token).trim();
        const value = (currentExercise as Record<string, unknown>)[key];
        return value !== undefined && value !== null ? String(value) : '';
      });
    }

    if (!solution) {
      setFeedback({ message: 'No auto-solution available for this exercise.', type: 'info' });
      return;
    }

    setQuery(solution);
  }, [currentExercise, exerciseSolution, skillModule]);

  // New exercise
  const handleNewExercise = useCallback(() => {
    if (!exerciseCompleted) {
      setFeedback({ message: 'Finish the current exercise before moving on.', type: 'info' });
      return;
    }
    exerciseDispatch({ type: 'generate' });
    setQuery('');
    setFeedback(null);
  }, [exerciseCompleted, exerciseDispatch]);

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
          <Box sx={{ p: 3 }}>
            {/* Exercise Description */}
            {currentExercise && (
              <Paper sx={{ p: 2, mb: 3, bgcolor: 'action.hover' }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                  {(componentState.numSolved || 0) >= requiredCount
                    ? 'Practice Exercise'
                    : 'Exercise'
                  }
                </Typography>
                <Typography variant="body1">
                  {currentExercise.description}
                </Typography>
                {tableNames.length > 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Available tables: {tableNames.join(', ')}
                  </Typography>
                )}
              </Paper>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  onClick={handleAutoComplete}
                  startIcon={<Lightbulb />}
                  disabled={!currentExercise || isExecuting}
                  variant="outlined"
                >
                  Show Solution
                </Button>
                <Button
                  size="small"
                  startIcon={<RestartAlt />}
                  onClick={handleResetDatabase}
                  disabled={!dbReady || isExecuting}
                  title="Reset the current exercise database"
                  variant="outlined"
                >
                  Reset Database
                </Button>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                {!exerciseCompleted ? (
                  <Button
                    size="small"
                    startIcon={<Refresh />}
                    onClick={handleNewExercise}
                    disabled={isExecuting}
                    title="Finish the current exercise to unlock a new one"
                    variant="outlined"
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
                  startIcon={<CheckCircle />}
                  onClick={() => { void handleExecute(); }}
                  disabled={!currentExercise || !query.trim() || isExecuting || exerciseCompleted || !dbReady}
                >
                  Submit Answer
                </Button>
              </Box>
            </Box>

            {/* SQL Editor - No extra wrapper */}
            <Box sx={{ mb: 3 }}>
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
            </Box>

            {/* Feedback Alert */}
            {feedback && (
              <Alert
                severity={feedback.type}
                sx={{ mb: 3 }}
                onClose={() => setFeedback(null)}
              >
                {feedback.message}
              </Alert>
            )}
            {!feedback && queryError && (
              <Alert
                severity="error"
                sx={{ mb: 3 }}
              >
                {queryError instanceof Error ? queryError.message : 'Query execution failed'}
              </Alert>
            )}

            {/* Results */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Query Results
              </Typography>
              {queryResult && queryResult.length > 0 ? (
                <DataTable data={queryResult[0]} />
              ) : queryError ? (
                <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'action.hover' }}>
                  <Typography color="text.secondary">
                    No results due to query error
                  </Typography>
                </Paper>
              ) : (
                <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'action.hover' }}>
                  <Typography color="text.secondary">
                    Run your query to see results
                  </Typography>
                </Paper>
              )}
            </Box>

            {/* Solution */}
            {exerciseCompleted && exerciseSolution && (
              <Paper sx={{ mt: 3, p: 2, bgcolor: 'success.light' }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'success.dark' }}>
                  Solution
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
                  <Typography
                    component="pre"
                    sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word', m: 0 }}
                  >
                    {exerciseSolution}
                  </Typography>
                </Paper>
              </Paper>
            )}
          </Box>
        )}

        {/* Theory Tab */}
        {isCurrentTab('theory') && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Theory
            </Typography>
            {renderContent(TheoryContent, 'Theory coming soon.')}
          </Box>
        )}

        {/* Story Tab */}
        {isCurrentTab('story') && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Story
            </Typography>
            {renderContent(StoryContent, 'Story coming soon.')}
          </Box>
        )}

        {/* Data Explorer Tab */}
        {isCurrentTab('data') && (
          <Box sx={{ p: 3 }}>
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
          </Box>
        )}
      </Card>

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
          
          {/* Show story button only if hideStories is disabled and story tab is available */}
          {!hideStories && availableTabs.some(tab => tab.key === 'story') && (
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
