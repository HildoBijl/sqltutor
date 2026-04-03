/**
 * Shared localStorage keys.
 * Keep legacy keys here while migration support is active.
 */

export const SETTINGS_STORAGE_KEY = 'sqlvalley-settings';
export const LEARNING_STORAGE_KEY = 'sqlvalley-learning';
export const SPLIT_STORAGE_MIGRATION_KEY = 'sqlvalley-storage-migrated-v1';
export const SKILL_TREE_HISTORY_KEY = 'sqlvalley-skilltree-history';
export const SKILL_TREE_STORAGE_KEY = 'sqlvalley-skilltree';

export const LEGACY_SETTINGS_STORAGE_KEY = 'sqltutor-settings';
export const LEGACY_LEARNING_STORAGE_KEY = 'sqltutor-learning';
export const LEGACY_APP_STORAGE_KEY = 'sqltutor-storage';
export const LEGACY_SPLIT_STORAGE_MIGRATION_KEY = 'sqltutor-storage-migrated-v1';
export const LEGACY_SKILL_TREE_HISTORY_KEY = 'sqltutor-skilltree-history';

// Transitional key used by early migration experiments.
export const LEGACY_SQLVALLEY_STORAGE_KEY = 'sqlvalley-storage';

export const RESETTABLE_APP_STORAGE_KEYS = [
  SETTINGS_STORAGE_KEY,
  LEARNING_STORAGE_KEY,
  SKILL_TREE_STORAGE_KEY,
  SPLIT_STORAGE_MIGRATION_KEY,
  LEGACY_SQLVALLEY_STORAGE_KEY,
  LEGACY_SETTINGS_STORAGE_KEY,
  LEGACY_LEARNING_STORAGE_KEY,
  LEGACY_APP_STORAGE_KEY,
  LEGACY_SPLIT_STORAGE_MIGRATION_KEY,
] as const;
