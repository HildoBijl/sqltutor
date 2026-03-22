/**
 * One-time bridge from the legacy monolithic storage key to split store keys.
 */

import {
  LEGACY_APP_STORAGE_KEY,
  LEGACY_SPLIT_STORAGE_MIGRATION_KEY,
  SPLIT_STORAGE_MIGRATION_KEY,
} from '../storage/keys';
import { asRecord } from './utils';

type RecordValue = Record<string, unknown>;

type MigrationDomain = 'settings' | 'learning';

const hasRunLegacyMigrationByDomain: Record<MigrationDomain, boolean> = {
  settings: false,
  learning: false,
};

function readPersistedRoot(raw: string): { state: RecordValue; version?: number } | null {
  try {
    const parsed = JSON.parse(raw);
    const parsedRecord = asRecord(parsed);
    const nestedState = asRecord(parsedRecord.state);
    const state = Object.keys(nestedState).length > 0 ? nestedState : parsedRecord;
    if (Object.keys(state).length === 0) {
      return null;
    }
    return {
      state,
      version:
        typeof parsedRecord.version === 'number' ? parsedRecord.version : undefined,
    };
  } catch {
    return null;
  }
}

function pickSettingsStateFromLegacyRoot(legacyState: RecordValue): RecordValue {
  const nested = asRecord(legacyState.settings);
  const source = Object.keys(nested).length > 0 ? nested : legacyState;

  const result: RecordValue = {};
  if (source.currentTheme === 'light' || source.currentTheme === 'dark') {
    result.currentTheme = source.currentTheme;
  }
  if (typeof source.hideStories === 'boolean') {
    result.hideStories = source.hideStories;
  }
  if (source.practiceDatasetSize === 'full' || source.practiceDatasetSize === 'small') {
    result.practiceDatasetSize = source.practiceDatasetSize;
  }
  if (typeof source.hasAccessedPlanningMode === 'boolean') {
    result.hasAccessedPlanningMode = source.hasAccessedPlanningMode;
  }

  const goalNodeID = asRecord(source.goalNodeID);
  if (Object.keys(goalNodeID).length > 0) {
    result.goalNodeID = Object.fromEntries(
      Object.entries(goalNodeID).filter(
        ([treeId, goalNodeId]) =>
          treeId.length > 0 &&
          (typeof goalNodeId === 'string' || goalNodeId === null),
      ),
    );
  }

  return result;
}

function pickLearningStateFromLegacyRoot(legacyState: RecordValue): RecordValue {
  const nested = asRecord(legacyState.learning);
  const source = Object.keys(nested).length > 0 ? nested : legacyState;
  const modulesSource = asRecord(source.modules);
  const componentsSource = asRecord(source.components);
  const modulesCandidate =
    Object.keys(modulesSource).length > 0 ? modulesSource : componentsSource;

  const safeModules = Object.fromEntries(
    Object.entries(modulesCandidate).filter(
      ([id, component]) =>
        id.length > 0 &&
        Boolean(component) &&
        typeof component === 'object' &&
        !Array.isArray(component),
    ),
  );

  return Object.keys(safeModules).length > 0 ? { modules: safeModules } : {};
}

function writeVersionedState(
  storage: Storage,
  key: string,
  state: RecordValue,
  version: number,
): void {
  storage.setItem(key, JSON.stringify({ state, version }));
}

function readDomainStateFromSplitStorage(
  storage: Storage,
  legacySplitKey: string,
): RecordValue | null {
  const splitRaw = storage.getItem(legacySplitKey);
  if (!splitRaw) {
    return null;
  }
  const parsed = readPersistedRoot(splitRaw);
  if (!parsed) {
    return null;
  }
  return parsed.state;
}

function readDomainStateFromLegacyMonolith(
  storage: Storage,
  domain: MigrationDomain,
): RecordValue | null {
  const legacyRaw = storage.getItem(LEGACY_APP_STORAGE_KEY);
  if (!legacyRaw) {
    return null;
  }

  const parsedLegacy = readPersistedRoot(legacyRaw);
  if (!parsedLegacy) {
    return null;
  }

  const pickedState =
    domain === 'settings'
      ? pickSettingsStateFromLegacyRoot(parsedLegacy.state)
      : pickLearningStateFromLegacyRoot(parsedLegacy.state);

  return Object.keys(pickedState).length > 0 ? pickedState : null;
}

interface LegacyMigrationOptions {
  domain: MigrationDomain;
  targetKey: string;
  legacySplitKey: string;
  targetVersion: number;
}

export function migrateLegacyStorageIfNeeded({
  domain,
  targetKey,
  legacySplitKey,
  targetVersion,
}: LegacyMigrationOptions): void {
  if (hasRunLegacyMigrationByDomain[domain] || typeof window === 'undefined') {
    return;
  }
  hasRunLegacyMigrationByDomain[domain] = true;

  try {
    const storage = window.localStorage;

    if (storage.getItem(targetKey)) {
      storage.setItem(SPLIT_STORAGE_MIGRATION_KEY, '1');
      return;
    }

    const migratedFromSplit = readDomainStateFromSplitStorage(storage, legacySplitKey);
    if (migratedFromSplit) {
      writeVersionedState(storage, targetKey, migratedFromSplit, targetVersion);
      storage.setItem(SPLIT_STORAGE_MIGRATION_KEY, '1');
      return;
    }

    const hasLegacyMarker = Boolean(storage.getItem(LEGACY_SPLIT_STORAGE_MIGRATION_KEY));
    if (hasLegacyMarker) {
      storage.setItem(SPLIT_STORAGE_MIGRATION_KEY, '1');
    }

    const migratedFromMonolith = readDomainStateFromLegacyMonolith(storage, domain);
    if (migratedFromMonolith) {
      writeVersionedState(storage, targetKey, migratedFromMonolith, targetVersion);
    }

    storage.setItem(SPLIT_STORAGE_MIGRATION_KEY, '1');
  } catch {
    // Best-effort migration only; if storage access fails, stores fall back to defaults.
  }
}
