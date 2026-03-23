/**
 * Versioning and migrations for the learning store persistence payload.
 */

import type { PersistedLearning } from './persist';
import { asRecord, runMigrations } from '../utils';

export const LEARNING_STORE_VERSION = 3;

/** Migrations: index i transforms payload from version i to i+1. */
const MIGRATIONS: Array<(state: PersistedLearning) => PersistedLearning> = [
  // v0 -> v1: no-op (initial versioned payload)
  (state) => state,
  // v1 -> v2: rename persisted "components" to "modules"
  (state) => {
    const safeState = asRecord(state) as PersistedLearning & { components?: unknown };
    if (safeState.modules) {
      return state;
    }
    const legacyComponents = asRecord(safeState.components);
    if (Object.keys(legacyComponents).length === 0) {
      return {
        ...state,
        modules: {},
      };
    }
    return {
      ...state,
      modules: legacyComponents as PersistedLearning['modules'],
    };
  },
  // v2 -> v3: remove playground modules and migrate skill shape to list-based exercises.
  (state) => {
    const safeState = asRecord(state) as PersistedLearning;
    const modules = asRecord(safeState.modules);
    if (Object.keys(modules).length === 0) {
      return {
        ...state,
        modules: {},
      };
    }

    const migratedModules = Object.fromEntries(
      Object.entries(modules).flatMap(([moduleId, moduleValue]) => {
        const module = asRecord(moduleValue);
        if (module.type === 'playground') {
          return [];
        }

        if (
          module.type === 'skill' ||
          'instances' in module ||
          'currentInstanceId' in module ||
          'numSolved' in module ||
          'understood' in module
        ) {
          const {
            instances: _instances,
            currentInstanceId: _currentInstanceId,
            ...moduleWithoutLegacyShape
          } = module;
          const numSolved =
            typeof module.numSolved === 'number' ? module.numSolved : 0;
          return [[
            moduleId,
            {
              ...moduleWithoutLegacyShape,
              id: typeof module.id === 'string' ? module.id : moduleId,
              type: 'skill',
              numSolved,
              understood: module.understood === true ? true : undefined,
              exercises: [],
            },
          ]];
        }

        return [[moduleId, module]];
      }),
    );

    return {
      ...state,
      modules: migratedModules as PersistedLearning['modules'],
    };
  },
];

export function migrateLearningPersistedState(
  persistedState: unknown,
  fromVersion: number,
): PersistedLearning {
  const state = asRecord(persistedState) as PersistedLearning;
  return runMigrations(state, fromVersion, LEARNING_STORE_VERSION, MIGRATIONS);
}
