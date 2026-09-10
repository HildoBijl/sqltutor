import type {
  SimpleExerciseInputProps,
  SimpleExerciseOutputProps,
  SimpleExerciseStoredState,
} from '@sqlvalley/exercise-engine';
import { Box, Paper, Typography } from '@mui/material';
import { ExerciseDescription } from './components/ExerciseDescription';
import { ExerciseEditor } from './components/ExerciseEditor';
import { ExerciseResults } from './components/ExerciseResults';
import { ExerciseSolution } from './components/ExerciseSolution';
import type { SimpleSQLCheckResult } from './types';
import { useSqlModuleContext } from '../SqlModule';

export function SQLExerciseInput<Parameters extends Record<string, unknown>>({
  value,
  disabled,
  onChange,
  onSubmit,
}: SimpleExerciseInputProps<Parameters, string>) {
  const runtime = useSqlModuleContext();
  return (
    <ExerciseEditor
      query={value}
      onQueryChange={onChange}
      onExecute={onSubmit}
      onLiveExecute={runtime.executeLiveQuery}
      readOnly={disabled}
      completionSchema={runtime.completionSchema}
    />
  );
}

export function SQLExerciseOutput<Parameters extends Record<string, unknown>>({
  state,
}: SimpleExerciseOutputProps<Parameters, string, SimpleSQLCheckResult>) {
  const runtime = useSqlModuleContext();
  const complete = 'solved' in state || 'givenUp' in state;
  return (
    <ExerciseResults
      queryResult={runtime.queryResult}
      queryError={runtime.queryError}
      hasExecuted={runtime.hasExecutedQuery}
      isComplete={complete}
      datasetSize={runtime.datasetSize}
      onDatasetSizeChange={runtime.setDatasetSize}
      datasetWarning={runtime.datasetWarning}
    />
  );
}

export function createSQLProblem<Parameters extends Record<string, unknown>>(
  title: string,
  getProblem: (parameters: Parameters) => string,
) {
  return function SQLExerciseProblem({ parameters }: { parameters: Parameters }) {
    const runtime = useSqlModuleContext();
    return (
      <ExerciseDescription
        title={title}
        description={getProblem(parameters)}
        tableNames={runtime.tableNames}
      />
    );
  };
}

export function createSQLPracticeIntro<Parameters extends Record<string, unknown>>(
  getLine: (parameters: Parameters) => string,
) {
  return function SQLExercisePracticeIntro({ parameters }: { parameters: Parameters }) {
    return <ExerciseDialogueLine text={getLine(parameters)} tone="setup" />;
  };
}

export function createSQLPayoff<Parameters extends Record<string, unknown>>(
  getLine: (parameters: Parameters) => string,
) {
  return function SQLExercisePayoff({ parameters }: { parameters: Parameters }) {
    return <ExerciseDialogueLine text={getLine(parameters)} tone="payoff" />;
  };
}

export function createSQLSolution<Parameters extends Record<string, unknown>>(
  getSolution: (parameters: Parameters) => string,
) {
  return function SQLExerciseSolution({
    parameters,
  }: {
    parameters: Parameters;
    state: SimpleExerciseStoredState;
  }) {
    return <ExerciseSolution solution={{ query: getSolution(parameters) }} />;
  };
}

function ExerciseDialogueLine({
  text,
  tone,
}: {
  text: string;
  tone: 'setup' | 'payoff';
}) {
  if (!text) return null;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        mb: 2,
        bgcolor: tone === 'payoff' ? 'rgba(46, 125, 50, 0.08)' : 'background.default',
        borderColor: tone === 'payoff' ? 'success.light' : 'divider',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography variant="body2" color="text.secondary">
          {tone === 'payoff' ? 'Resolution' : 'Context'}
        </Typography>
        <Typography variant="body1">{text}</Typography>
      </Box>
    </Paper>
  );
}
