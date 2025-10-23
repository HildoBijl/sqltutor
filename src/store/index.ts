import { create } from 'zustand';
import { useCallback, useEffect, useState } from 'react';
import { persist } from 'zustand/middleware';

import type {
  ComponentState,
  ConceptComponentState,
  PlaygroundComponentState,
  SkillComponentState,
  StoredExerciseEvent,
  StoredExerciseInstance,
} from './types';

type ComponentType = ComponentState['type'];

const DEFAULT_COMPONENT_TYPE: ComponentType = 'skill';

function createComponentState(id: string, type: ComponentType = DEFAULT_COMPONENT_TYPE): ComponentState {
  switch (type) {
    case 'concept':
      return {
        type: 'concept',
        id,
        understood: false,
        tab: undefined,
        lastAccessed: undefined,
      };
    case 'playground':
      return {
        type: 'playground',
        id,
        savedQueries: [],
        history: [],
        tab: undefined,
        lastAccessed: undefined,
      };
    case 'skill':
    default:
      return {
        type: 'skill',
        id,
        tab: undefined,
        numSolved: 0,
        instances: {},
        currentInstanceId: undefined,
        lastAccessed: undefined,
      };
  }
}

function coerceTimestamp(value: unknown): number | undefined {
  if (typeof value === 'number') {
    return value;
  }
  if (value === undefined || value === null) {
    return undefined;
  }
  const asNumber = new Date(value as string | number).getTime();
  return Number.isNaN(asNumber) ? undefined : asNumber;
}

function normalizeComponentState(id: string, state: Partial<ComponentState> | undefined): ComponentState {
  if (!state || !('type' in state) || !state.type) {
    return createComponentState(id);
  }
  const desiredType = state.type;
  const lastAccessed = coerceTimestamp(state.lastAccessed);

  switch (desiredType) {
    case 'concept': {
      const normalized: ConceptComponentState = {
        ...createComponentState(id, 'concept'),
        ...(state as Partial<ConceptComponentState>),
        id,
        type: 'concept',
        lastAccessed,
      };
      return normalized;
    }
    case 'playground': {
      const normalized: PlaygroundComponentState = {
        ...createComponentState(id, 'playground'),
        ...(state as Partial<PlaygroundComponentState>),
        id,
        type: 'playground',
        lastAccessed,
      };
      return normalized;
    }
    case 'skill':
    default: {
      const partialSkill = state as Partial<SkillComponentState>;
      const normalized: SkillComponentState = {
        ...createComponentState(id, 'skill'),
        ...partialSkill,
        id,
        type: 'skill',
        lastAccessed,
        instances: partialSkill.instances ?? {},
        numSolved: partialSkill.numSolved ?? 0,
        currentInstanceId: partialSkill.currentInstanceId ?? undefined,
      };
      return normalized;
    }
  }
}

interface AppState {
  components: Record<string, ComponentState>;
  sidebarOpen: boolean;
  currentTheme: 'light' | 'dark';
  hideStories: boolean;
  _hasHydrated: boolean;
  updateComponent: (id: string, data: Partial<ComponentState>) => void;
  getComponent: (id: string) => ComponentState;
  resetComponent: (id: string, type?: ComponentType) => void;
  toggleSidebar: () => void;
  toggleHideStories: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  getCurrentExerciseInstance: (skillId: string) => StoredExerciseInstance | null;
  getAllExerciseInstances: (skillId: string) => StoredExerciseInstance[];
  getExerciseHistory: (skillId: string, instanceId: string) => StoredExerciseEvent[];
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      components: {},
      sidebarOpen: true,
      currentTheme: 'light',
      hideStories: false,
      _hasHydrated: false,

      updateComponent: (id, data) =>
        set((state) => {
          const prev = state.components[id];
          const nextType = (data.type ?? prev?.type ?? DEFAULT_COMPONENT_TYPE) as ComponentType;
          let nextState: ComponentState;

          switch (nextType) {
            case 'concept': {
              const previous = prev?.type === 'concept' ? prev : undefined;
              nextState = {
                ...createComponentState(id, 'concept'),
                ...(previous ?? {}),
                ...(data as Partial<ConceptComponentState>),
                id,
                type: 'concept',
                lastAccessed: Date.now(),
              };
              break;
            }
            case 'playground': {
              const previous = prev?.type === 'playground' ? prev : undefined;
              nextState = {
                ...createComponentState(id, 'playground'),
                ...(previous ?? {}),
                ...(data as Partial<PlaygroundComponentState>),
                id,
                type: 'playground',
                lastAccessed: Date.now(),
              };
              break;
            }
            case 'skill':
            default: {
              const previous = prev?.type === 'skill' ? prev : undefined;
              const incoming = data as Partial<SkillComponentState>;
              const baseSkill = createComponentState(id, 'skill') as SkillComponentState;
              const nextSkill: SkillComponentState = {
                ...baseSkill,
                ...(previous ?? {}),
                ...incoming,
                id,
                type: 'skill',
                lastAccessed: Date.now(),
                instances: incoming.instances ?? previous?.instances ?? baseSkill.instances,
                numSolved: incoming.numSolved ?? previous?.numSolved ?? baseSkill.numSolved,
                currentInstanceId: incoming.currentInstanceId ?? previous?.currentInstanceId ?? baseSkill.currentInstanceId,
              };
              nextState = nextSkill;
              break;
            }
          }
          return {
            components: {
              ...state.components,
              [id]: nextState,
            },
          };
        }),

      getComponent: (id) => {
        const existing = get().components[id];
        return existing ?? createComponentState(id);
      },

      resetComponent: (id, type) =>
        set((state) => {
          const targetType = (type ?? state.components[id]?.type ?? DEFAULT_COMPONENT_TYPE) as ComponentType;
          return {
            components: {
              ...state.components,
              [id]: createComponentState(id, targetType),
            },
          };
        }),

      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      toggleHideStories: () =>
        set((state) => ({ hideStories: !state.hideStories })),

      setTheme: (theme) =>
        set({ currentTheme: theme }),

      setHasHydrated: (hasHydrated) =>
        set({ _hasHydrated: hasHydrated }),

      getCurrentExerciseInstance: (skillId) => {
        const component = get().components[skillId];
        if (!component || component.type !== 'skill') {
          return null;
        }
        const { currentInstanceId, instances } = component;
        if (!currentInstanceId) {
          return null;
        }
        return instances[currentInstanceId] ?? null;
      },

      getAllExerciseInstances: (skillId) => {
        const component = get().components[skillId];
        if (!component || component.type !== 'skill') {
          return [];
        }
        return Object.values(component.instances);
      },

      getExerciseHistory: (skillId, instanceId) => {
        const component = get().components[skillId];
        if (!component || component.type !== 'skill') {
          return [];
        }
        return component.instances[instanceId]?.events ?? [];
      },
    }),
    {
      name: 'sqltutor-storage',
      partialize: (state) => ({
        components: state.components,
        currentTheme: state.currentTheme,
        sidebarOpen: state.sidebarOpen,
        hideStories: state.hideStories,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.components = Object.fromEntries(
            Object.entries(state.components ?? {}).map(([id, value]) => [
              id,
              normalizeComponentState(id, value),
            ]),
          );
          state.setHasHydrated(true);
        }
      },
    },
  ),
);

export function useComponentState<State extends ComponentState = ComponentState>(
  componentId: string,
  typeHint?: State['type'],
) {
  const component = useAppStore((state) => {
    const existing = state.components[componentId];
    if (existing) {
      return existing as State;
    }
    const fallbackType = (typeHint ?? DEFAULT_COMPONENT_TYPE) as ComponentType;
    return createComponentState(componentId, fallbackType) as State;
  });
  const updateComponent = useAppStore((state) => state.updateComponent);

  const setComponentState = useCallback(
    (updater: Partial<State> | State | ((prev: State) => Partial<State> | State)) => {
      if (typeof updater === 'function') {
        const currentState =
          (useAppStore.getState().components[componentId] as State | undefined) ??
          (createComponentState(
            componentId,
            (typeHint ?? DEFAULT_COMPONENT_TYPE) as ComponentType,
          ) as State);
        const result = updater(currentState);
        updateComponent(componentId, result as Partial<ComponentState>);
      } else {
        updateComponent(componentId, updater as Partial<ComponentState>);
      }
    },
    [componentId, typeHint, updateComponent],
  );

  return [component, setComponentState] as const;
}

export function useIsStoreReady() {
  const hasHydrated = useAppStore((state) => state._hasHydrated);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (hasHydrated) {
      const timer = setTimeout(() => setIsReady(true), 0);
      return () => clearTimeout(timer);
    }
  }, [hasHydrated]);

  return isReady;
}

export type {
  ComponentState,
  ConceptComponentState,
  ExerciseInstanceId,
  PlaygroundComponentState,
  QueryHistory,
  SavedQuery,
  SkillComponentState,
  StoredExerciseEvent,
  StoredExerciseInstance,
  StoredExerciseState,
} from './types';
