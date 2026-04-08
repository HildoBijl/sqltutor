/**
 * Versioning and migrations for the learning store persistence payload.
 */

import type { PersistedLearning } from './persist';
import { asRecord, runMigrations } from '../utils';

export const LEARNING_STORE_VERSION = 5;

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
  // v3 -> v4: remove legacy persisted module "type" and normalize understood to true|undefined.
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
      Object.entries(modules).map(([moduleId, moduleValue]) => {
        const module = asRecord(moduleValue);
        const { type: legacyType, understood: legacyUnderstood, ...withoutLegacyType } = module;
        const understood = legacyUnderstood === true ? true : undefined;
        const isSkill =
          legacyType === 'skill' ||
          typeof module.numSolved === 'number' ||
          Array.isArray(module.exercises) ||
          'instances' in module ||
          'currentInstanceId' in module;

        if (isSkill) {
          const {
            instances: _instances,
            currentInstanceId: _currentInstanceId,
            ...withoutLegacySkillShape
          } = withoutLegacyType;
          const numSolved = typeof module.numSolved === 'number' ? module.numSolved : 0;
          const exercises = Array.isArray(module.exercises) ? module.exercises : [];
          return [
            moduleId,
            {
              ...withoutLegacySkillShape,
              id: typeof module.id === 'string' ? module.id : moduleId,
              numSolved,
              exercises,
              understood,
            },
          ];
        }

        return [
          moduleId,
          {
            ...withoutLegacyType,
            id: typeof module.id === 'string' ? module.id : moduleId,
            understood,
          },
        ];
      }),
    );

    return {
      ...state,
      modules: migratedModules as PersistedLearning['modules'],
    };
  },
  // v4 -> v5: reset persisted skill exercises to the minimal v5 shape.
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
      Object.entries(modules).map(([moduleId, moduleValue]) => {
        const module = asRecord(moduleValue);
        const {
          type: _legacyType,
          instances: _instances,
          currentInstanceId: _currentInstanceId,
          ...withoutLegacyShape
        } = module;

        const isSkill =
          typeof module.numSolved === 'number' ||
          Array.isArray(module.exercises);

        if (isSkill) {
          return [
            moduleId,
            {
              ...withoutLegacyShape,
              id: typeof module.id === 'string' ? module.id : moduleId,
              numSolved: typeof module.numSolved === 'number' ? module.numSolved : 0,
              understood: module.understood === true ? true : undefined,
              exercises: [],
            },
          ];
        }

        return [
          moduleId,
          {
            ...withoutLegacyShape,
            id: typeof module.id === 'string' ? module.id : moduleId,
            understood: module.understood === true ? true : undefined,
          },
        ];
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
