import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { Alert, Typography } from '@mui/material';

import type {
  ExerciseId,
  StoredExerciseAction,
  StoredExerciseInstance,
  StoredExerciseState,
} from '../storedState';
import { createAttemptSeed, createExerciseRng, getOrCreateLearnerSeed, pickRandomly } from '../randomization';
import { Exercise, type AnyExerciseContextValue, type AnyExerciseDefinition } from '../Exercise';
import { useModuleContext } from '../moduleContext';
import type { ExerciseStorage } from '../storage';
import { useExerciseStorage } from '../storageContext';

interface ExerciseManagerProps {
  skillId: string;
  exercises: ReadonlyArray<AnyExerciseDefinition>;
}

function readLatestState(instance: StoredExerciseInstance): StoredExerciseState {
  return { ...(instance.events[instance.events.length - 1]?.resultingState ?? {}) };
}

function getInstances(
  storage: ExerciseStorage,
  skillId: string,
  current: StoredExerciseInstance | null,
): readonly StoredExerciseInstance[] {
  return storage.getAllInstances?.(skillId) ?? (current ? [current] : []);
}

function getSolvedExerciseIds(
  storage: ExerciseStorage,
  skillId: string,
): readonly ExerciseId[] {
  return storage.getSolvedExerciseIds?.(skillId) ?? [];
}

function pickNextExercise({
  exercises,
  current,
  solvedExerciseIds,
  selectionSeed,
}: {
  exercises: ReadonlyArray<AnyExerciseDefinition>;
  current: StoredExerciseInstance | null;
  solvedExerciseIds: readonly ExerciseId[];
  selectionSeed: string;
}): AnyExerciseDefinition | undefined {
  const solved = new Set(solvedExerciseIds);
  const unsolved = exercises.filter((exercise) => !solved.has(exercise.exerciseId));
  const primaryPool = unsolved.length > 0 ? unsolved : exercises;
  const candidates = current && primaryPool.length > 1
    ? primaryPool.filter((exercise) => exercise.exerciseId !== current.exerciseId)
    : primaryPool;
  return pickRandomly(createExerciseRng(selectionSeed), candidates);
}

/**
 * Owns exercise selection, lifecycle, and all the control handlers for a skill.
 * Fed the definitions by the page, it keeps one active exercise in the store and
 * hands a ready-made { definition, data, controls, skill } context to a thin Exercise.
 */
export function ExerciseManager({ skillId, exercises }: ExerciseManagerProps) {
  const moduleContext = useModuleContext();
  const storage = useExerciseStorage();
  const getInstanceSnapshot = useCallback(
    () => storage.getInstance(skillId),
    [storage, skillId],
  );
  const instance = useSyncExternalStore(storage.subscribe, getInstanceSnapshot);

  const byId = useMemo(
    () => new Map(exercises.map((exercise) => [exercise.exerciseId, exercise])),
    [exercises],
  );
  const matched = instance ? byId.get(instance.exerciseId) ?? null : null;
  const active = matched && matched.version === instance?.version ? matched : null;

  const [pending, setPending] = useState(false);

  const startExercise = useCallback((preferred?: AnyExerciseDefinition) => {
    const current = storage.getInstance(skillId);
    const instances = getInstances(storage, skillId, current);
    const solvedExerciseIds = getSolvedExerciseIds(storage, skillId);
    const learnerSeed = getOrCreateLearnerSeed();
    const attemptNumber = instances.length + 1;
    const selectionSeed = [learnerSeed, skillId, 'select', attemptNumber, Date.now(), Math.random()].join('|');
    const next = preferred ?? pickNextExercise({ exercises, current, solvedExerciseIds, selectionSeed });
    if (!next) return;

    const previousParameters = current?.parameters ?? null;
    const attemptSeed = createAttemptSeed({
      learnerSeed,
      skillId,
      exerciseId: next.exerciseId,
      version: next.version,
      attemptNumber,
    });
    const parameters = next.generateParameters(moduleContext, {
      previousParameters,
      skillId,
      learnerSeed,
      attemptSeed,
      attemptNumber,
      solvedExerciseIds,
    });
    storage.startExercise(skillId, next.exerciseId, next.version, parameters);
  }, [exercises, moduleContext, skillId, storage]);

  const startNewExercise = useCallback(() => {
    startExercise();
  }, [startExercise]);

  const submitAction = useCallback(async (action: StoredExerciseAction) => {
    if (!active) return;
    setPending(true);
    try {
      const current = storage.getInstance(skillId);
      if (!current) return;
      const previousState = readLatestState(current);
      const { state, report } = await active.reduce(
        current.parameters,
        previousState,
        action,
        moduleContext,
      );
      storage.submitAction(
        skillId,
        action,
        state,
        report,
        active.isComplete(state),
        active.isSolved(state) && !active.isSolved(previousState),
      );
    } finally {
      setPending(false);
    }
  }, [active, moduleContext, skillId, storage]);

  const setDraftInput = useCallback((draftInput: unknown) => {
    if (!storage.getInstance(skillId)) return;
    storage.setDraftInput(skillId, draftInput);
  }, [skillId, storage]);

  // A module provider may report it isn't ready yet (e.g. its database is still
  // loading); hold off generating until it is. No provider means always ready.
  const moduleReady = moduleContext == null ||
    (moduleContext as { ready?: boolean }).ready !== false;

  // Keep exactly one valid exercise active. Reads live storage so React
  // StrictMode's double-invoke can't start two.
  useEffect(() => {
    if (exercises.length === 0 || !moduleReady) return;
    const current = storage.getInstance(skillId);
    const definition = current ? byId.get(current.exerciseId) : undefined;
    if (current && definition && definition.version === current.version) return;
    startExercise(definition);
  }, [byId, exercises.length, moduleReady, skillId, startExercise, storage]);

  if (exercises.length === 0) {
    return <Alert severity="info">No exercises are available yet.</Alert>;
  }
  if (!active || !instance) {
    return <Typography color="text.secondary">Generating your next exercise...</Typography>;
  }

  const value: AnyExerciseContextValue = {
    definition: active,
    data: {
      parameters: instance.parameters,
      state: readLatestState(instance),
      events: instance.events,
      draftInput: instance.draftInput,
      pending,
    },
    controls: { submitAction, setDraftInput, startNewExercise },
    skill: { id: skillId },
  };

  return <Exercise value={value} />;
}
