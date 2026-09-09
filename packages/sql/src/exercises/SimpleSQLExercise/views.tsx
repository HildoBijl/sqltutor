import type {
  SimpleExerciseInputProps,
  SimpleExerciseOutputProps,
  SimpleExerciseStoredState,
} from '@sqlvalley/exercise-engine';
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
