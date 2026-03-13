/**
 * One-time bridge from the legacy monolithic storage key to split store keys.
 */

import { LEARNING_STORE_VERSION } from './learning/version';
import { SETTINGS_STORE_VERSION } from './settings/version';

export const LEGACY_APP_STORAGE_KEY = 'sqltutor-storage';
export const SETTINGS_STORAGE_KEY = 'sqltutor-settings';
export const LEARNING_STORAGE_KEY = 'sqltutor-learning';
export const SPLIT_STORAGE_MIGRATION_KEY = 'sqltutor-storage-migrated-v1';

type RecordValue = Record<string, unknown>;

let hasRunLegacyMigration = false;

function asRecord(value: unknown): RecordValue {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return value as RecordValue;
}

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

function pickSettingsState(legacyState: RecordValue): RecordValue {
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

function pickLearningState(legacyState: RecordValue): RecordValue {
  const nested = asRecord(legacyState.learning);
  const source = Object.keys(nested).length > 0 ? nested : legacyState;
  const components = asRecord(source.components);

  const safeComponents = Object.fromEntries(
    Object.entries(components).filter(
      ([id, component]) =>
        id.length > 0 &&
        Boolean(component) &&
        typeof component === 'object' &&
        !Array.isArray(component),
    ),
  );

  return Object.keys(safeComponents).length > 0 ? { components: safeComponents } : {};
}

function writeVersionedState(
  storage: Storage,
  key: string,
  state: RecordValue,
  version: number,
): void {
  storage.setItem(key, JSON.stringify({ state, version }));
}

export function migrateLegacyStorageIfNeeded(): void {
  if (hasRunLegacyMigration || typeof window === 'undefined') {
    return;
  }
  hasRunLegacyMigration = true;

  try {
    const storage = window.localStorage;

    if (storage.getItem(SPLIT_STORAGE_MIGRATION_KEY)) {
      return;
    }

    const hasSettingsStorage = Boolean(storage.getItem(SETTINGS_STORAGE_KEY));
    const hasLearningStorage = Boolean(storage.getItem(LEARNING_STORAGE_KEY));

    if (hasSettingsStorage && hasLearningStorage) {
      storage.setItem(SPLIT_STORAGE_MIGRATION_KEY, '1');
      return;
    }

    const legacyRaw = storage.getItem(LEGACY_APP_STORAGE_KEY);
    if (!legacyRaw) {
      storage.setItem(SPLIT_STORAGE_MIGRATION_KEY, '1');
      return;
    }

    const parsedLegacy = readPersistedRoot(legacyRaw);
    if (!parsedLegacy) {
      storage.setItem(SPLIT_STORAGE_MIGRATION_KEY, '1');
      return;
    }

    const migratedSettings = pickSettingsState(parsedLegacy.state);
    const migratedLearning = pickLearningState(parsedLegacy.state);

    if (!hasSettingsStorage && Object.keys(migratedSettings).length > 0) {
      writeVersionedState(
        storage,
        SETTINGS_STORAGE_KEY,
        migratedSettings,
        SETTINGS_STORE_VERSION,
      );
    }

    if (!hasLearningStorage && Object.keys(migratedLearning).length > 0) {
      writeVersionedState(
        storage,
        LEARNING_STORAGE_KEY,
        migratedLearning,
        LEARNING_STORE_VERSION,
      );
    }

    storage.setItem(SPLIT_STORAGE_MIGRATION_KEY, '1');
  } catch {
    // Best-effort migration only; if storage access fails, stores fall back to defaults.
  }
}
