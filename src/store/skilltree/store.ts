/**
 * Persisted skill tree settings store.
 */

import {
  createSkillTreeSettingsActions,
  initialSkillTreeSettingsState,
  type SkillTreeSettingsActions,
  type SkillTreeSettingsState,
} from './slice';
import {
  partializeSkillTreeSettings,
  rehydrateSkillTreeSettings,
  type PersistedSkillTreeSettings,
} from './persist';
import {
  migrateSkillTreeSettingsPersistedState,
  SKILL_TREE_SETTINGS_STORE_VERSION,
} from './version';
import { createStore, type HydrationState } from '../utils';
import { SKILL_TREE_STORAGE_KEY } from '../../storage/keys';

export { SKILL_TREE_STORAGE_KEY };

export interface SkillTreeSettingsStoreState
  extends SkillTreeSettingsState,
    SkillTreeSettingsActions,
    HydrationState {}

export const useSkillTreeSettingsStore = createStore<
  SkillTreeSettingsState,
  SkillTreeSettingsActions,
  PersistedSkillTreeSettings
>({
  initialState: initialSkillTreeSettingsState,
  createActions: (set) => createSkillTreeSettingsActions(set),
  storageKey: SKILL_TREE_STORAGE_KEY,
  version: SKILL_TREE_SETTINGS_STORE_VERSION,
  migrate: migrateSkillTreeSettingsPersistedState,
  partialize: partializeSkillTreeSettings,
  rehydrate: rehydrateSkillTreeSettings,
});
