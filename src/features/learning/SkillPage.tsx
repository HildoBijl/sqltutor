import { Suspense, useEffect, useState, useCallback } from 'react';
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
} from '@mui/material';
import { PlayArrow, CheckCircle, ArrowBack, Refresh, ArrowForward, RestartAlt } from '@mui/icons-material';

import { SQLEditor } from '@/shared/components/SQLEditor';
import { DataTable } from '@/shared/components/DataTable';
import { useComponentState } from '@/store';
import { useDatabase } from '@/shared/hooks/useDatabase';
import type { SchemaKey } from '@/features/database/schemas';
import { contentIndex, type ContentMeta, skillExerciseLoaders } from '@/features/content';
import { useContent } from './hooks/useContent';

interface ExerciseInstance {
  id: string;
  description: string;
  expectedQuery?: string;
  validatorFn?: (input: string, state: any, result: any) => boolean;
  solutionTemplate?: string;
  config?: { database?: string };
  state: any; // generated state from generator
}

type SkillExerciseLoader = (typeof skillExerciseLoaders)[keyof typeof skillExerciseLoaders];
type SkillExerciseModule = Awaited<ReturnType<SkillExerciseLoader>>;

export default function SkillPage() {
  const { skillId } = useParams<{ skillId: string }>();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0); // 0: Practice, 1: Theory, 2: Story

  // State management
  const [componentState, setComponentState] = useComponentState(skillId || '');

  // Skill content + exercise state
  const [skillModule, setSkillModule] = useState<{
    generate?: (utils: any) => any;
    validate?: (input: string, state: any, result: any) => boolean;
    solutionTemplate?: string;
  } | null>(null);
  const [currentExercise, setCurrentExercise] = useState<ExerciseInstance | null>(null);
  const [query, setQuery] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [exerciseCompleted, setExerciseCompleted] = useState(false);

  // Skill metadata
  const [skillMeta, setSkillMeta] = useState<(ContentMeta & { database?: SchemaKey }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Database setup - allow meta-defined schema or fallback to skill mapping
  const metaSchema = (skillMeta?.database as SchemaKey | undefined);
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
    schema: metaSchema,
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
    setCurrentExercise(null);

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

  // Restore saved tab
  useEffect(() => {
    if (componentState.tab) {
      const tabIndex = ['practice', 'theory', 'story'].indexOf(componentState.tab as string);
      if (tabIndex >= 0) setCurrentTab(tabIndex);
    }
  }, [componentState.tab]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    const tabNames = ['practice', 'theory', 'story'];
    setComponentState({ tab: tabNames[newValue] });
  };


  // Utilities available to content generators
  const genUtils = {
    selectRandomly: <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)],
    generateRandomNumber: (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1)) + min,
  };

  // Generate a new exercise
  const generateExercise = useCallback(() => {
    if (!skillModule?.generate) {
      return;
    }

    const state = skillModule.generate(genUtils) || {};
    const instance: ExerciseInstance = {
      id: state?.id || 'exercise',
      description: state?.description || 'Solve the exercise',
      expectedQuery: state?.expectedQuery,
      validatorFn: skillModule.validate,
      solutionTemplate: skillModule.solutionTemplate,
      config: {},
      state,
    };
    setCurrentExercise(instance);
    setQuery('');
    setFeedback(null);
    setExerciseCompleted(false);
  }, [skillModule, genUtils]);

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
      generateExercise();
    }
  }, [dbReady, currentExercise, generateExercise]);

  // Check answer
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

      let isCorrect = false;

      // Prefer content-provided validator if available
      if (currentExercise.validatorFn) {
        isCorrect = !!currentExercise.validatorFn(effectiveQuery, currentExercise.state, result);
      }
      // Check if exercise has expected query
      else if (currentExercise.expectedQuery) {
        // Simple check - in real app would need better SQL comparison
        const normalize = (s: string) => s
          .toLowerCase()
          .replace(/\s+/g, ' ')
          .trim()
          .replace(/;$/, '');
        const normalizedQuery = normalize(effectiveQuery);
        const normalizedExpected = normalize(currentExercise.expectedQuery);
        isCorrect = normalizedQuery === normalizedExpected ||
          (result && result.length > 0 && result[0].values.length > 0);
      }
      // Default: check if query returned results
      else {
        isCorrect = result && result.length > 0;
      }

      if (isCorrect) {
        // Update progress
        const nextSolved = Math.min(requiredCount, (componentState.numSolved || 0) + 1);
        const newHistory = [
          ...(componentState.exerciseHistory || []),
          { id: currentExercise.id, solved: true, timestamp: new Date() }
        ];

        setComponentState({
          numSolved: nextSolved,
          exerciseHistory: newHistory
        });

        setFeedback({
          message: `Excellent! Exercise completed successfully! (${nextSolved}/${requiredCount})`,
          type: 'success'
        });
        // Mark current exercise as completed; require explicit click to continue
        setExerciseCompleted(true);
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
    if (!solution && currentExercise.solutionTemplate) {
      solution = currentExercise.solutionTemplate.replace(/{{(.*?)}}/g, (_m, p1) => {
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
    generateExercise();
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
      </Box>

      {/* Description */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body1" color="text.secondary">
          {skillMeta.description}
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label="Practice" />
          <Tab label="Theory" />
          <Tab label="Story" />
        </Tabs>
      </Box>

      {/* Progress */}
      {currentTab === 0 && (
        <Alert severity={isCompleted ? 'success' : 'info'} sx={{ mb: 2 }}>
          Progress: {Math.min(componentState.numSolved || 0, requiredCount)}/{requiredCount} exercises completed
          {isCompleted && ' - Skill mastered!'}
        </Alert>
      )}

      {/* Database Info */}
      {currentTab === 0 && tableNames.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Available tables:</strong> {tableNames.join(', ')}
          </Typography>
        </Alert>
      )}

      {/* Exercise Description */}
      {currentTab === 0 && currentExercise && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Exercise {Math.min((componentState.numSolved || 0) + 1, requiredCount)}
            </Typography>
            <Typography variant="body1">
              {currentExercise.description}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* SQL Editor */}
      {currentTab === 0 && (
        <Card sx={{ mb: 2 }}>
          <Box sx={{
            p: 1,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="subtitle2" sx={{ ml: 1 }}>
              Write your SQL query:
            </Typography>
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
              showResults={false}
            />
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {currentTab === 0 && (
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
      )}

      {/* Theory */}
      {currentTab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Theory
            </Typography>
            {renderContent(TheoryContent, 'Theory coming soon.')}
          </CardContent>
        </Card>
      )}

      {/* Story */}
      {currentTab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Story
            </Typography>
            {renderContent(StoryContent, 'Story coming soon.')}
          </CardContent>
        </Card>
      )}

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
    </Container>
  );
}

