import { create } from 'zustand';
import { useCallback, useState, useEffect } from 'react';
import { persist } from 'zustand/middleware';

interface QueryHistory {
  query: string;
  timestamp: Date;
  success: boolean;
  rowCount?: number;
}

interface SavedQuery {
  name: string;
  query: string;
}

interface ComponentState {
  // Component ID
  id?: string;

  // For concepts
  understood?: boolean;
  tab?: string;

  // For skills
  numSolved?: number;
  exerciseHistory?: any[];

  // For playground
  savedQueries?: SavedQuery[];
  history?: QueryHistory[];

  // Common
  lastAccessed?: Date;
  type?: 'concept' | 'skill' | 'playground';

  // Allow any additional properties for extensibility
  [key: string]: any;
}

interface AppState {
  // Component progress
  components: Record<string, ComponentState>;

  // UI state
  sidebarOpen: boolean;
  currentTheme: 'light' | 'dark';
  hideStories: boolean;

  // Hydration state
  _hasHydrated: boolean;

  // Actions
  updateComponent: (id: string, data: Partial<ComponentState>) => void;
  getComponent: (id: string) => ComponentState;
  resetComponent: (id: string) => void;
  toggleSidebar: () => void;
  toggleHideStories: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setHasHydrated: (hasHydrated: boolean) => void;
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
        set(state => ({
          components: {
            ...state.components,
            [id]: {
              ...state.components[id],
              ...data,
              id,
              lastAccessed: new Date()
            }
          }
        })),

      getComponent: (id) => get().components[id] || { id },

      resetComponent: (id) =>
        set(state => ({
          components: {
            ...state.components,
            [id]: { id }
          }
        })),

      toggleSidebar: () =>
        set(state => ({ sidebarOpen: !state.sidebarOpen })),

      toggleHideStories: () =>
        set(state => ({ hideStories: !state.hideStories })),

      setTheme: (theme) =>
        set({ currentTheme: theme }),

      setHasHydrated: (hasHydrated) =>
        set({ _hasHydrated: hasHydrated }),
    }),
    {
      name: 'sqltutor-storage',
      partialize: (state) => ({
        components: state.components,
        currentTheme: state.currentTheme,
        sidebarOpen: state.sidebarOpen,
        hideStories: state.hideStories,
        // Don't persist _hasHydrated - it should start false on each load
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// Helper hooks for component state management
export function useComponentState(componentId: string) {
  const component = useAppStore(state => state.components[componentId] || { id: componentId });
  const updateComponent = useAppStore(state => state.updateComponent);

  const setComponentState = useCallback((data: Partial<ComponentState> | ((prev: ComponentState) => Partial<ComponentState>)) => {
    if (typeof data === 'function') {
      const currentState = useAppStore.getState().components[componentId] || { id: componentId };
      const newData = data(currentState);
      updateComponent(componentId, newData);
    } else {
      updateComponent(componentId, data);
    }
  }, [componentId, updateComponent]);

  return [component, setComponentState] as const;
}

// Hook to check if store is hydrated
export function useIsStoreReady() {
  const hasHydrated = useAppStore(state => state._hasHydrated);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (hasHydrated) {
      // Give a tick for any remaining hydration to complete
      const timer = setTimeout(() => setIsReady(true), 0);
      return () => clearTimeout(timer);
    }
  }, [hasHydrated]);

  return isReady;
}

// Export types for use in components
export type { ComponentState, QueryHistory, SavedQuery };