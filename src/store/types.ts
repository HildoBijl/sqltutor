import type { MainState, MainActions, MainPersisted } from './main';
import type { SettingsState, SettingsActions, SettingsPersisted } from './settings';
import type { LearningState, LearningActions, LearningPersisted } from './learning';

export type AppState = {
  main: MainState & MainActions;
  settings: SettingsState & SettingsActions;
  learning: LearningState & LearningActions;
};

export type StatePersisted = MainPersisted | SettingsPersisted | LearningPersisted;
