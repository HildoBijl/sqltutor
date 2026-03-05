import type { SetState } from '../utils';

import type { SettingsSlice, SettingsState, SettingsPersisted, SettingsActions } from './types';

const initialState: SettingsState = {
  currentTheme: 'light',
  hideStories: true,
  practiceDatasetSize: 'small',
};

function createActions(set: SetState<SettingsState>): SettingsActions {
  return {
    toggleHideStories: () => set((state) => ({ hideStories: !state.hideStories })),
    setTheme: (theme) => set({ currentTheme: theme }),
    setPracticeDatasetSize: (size) => set({ practiceDatasetSize: size }),
  };
}

function partialize(state: SettingsState): SettingsPersisted {
  return {
    currentTheme: state.currentTheme,
    hideStories: state.hideStories,
    practiceDatasetSize: state.practiceDatasetSize,
  };
}

function rehydrate(state: SettingsPersisted, storedState: SettingsPersisted, initialState: SettingsState & SettingsActions): void {
  Object.assign(state, initialState);
  Object.assign(state, storedState);
}

function migrate(state: SettingsPersisted, _version: number): SettingsPersisted {
  return state
}

export const slice: SettingsSlice = {
  key: 'settings',
  initialState,
  createActions,
  partialize,
  rehydrate,
  migrate,
}
