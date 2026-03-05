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
  console.log('Returning!', {
    currentTheme: state.currentTheme,
    hideStories: state.hideStories,
    practiceDatasetSize: state.practiceDatasetSize,
  })
  return {
    currentTheme: state.currentTheme,
    hideStories: state.hideStories,
    practiceDatasetSize: state.practiceDatasetSize,
  };
}

function rehydrate(a, b): void {
  console.log('Rehydrate', a, b)
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
