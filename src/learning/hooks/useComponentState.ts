/**
 * Hook for reading and updating component state from the store.
 * Learning-specific.
 */

import { useCallback } from 'react';

import {
  useAppStore,
  createComponentState,
  DEFAULT_COMPONENT_TYPE,
  type ComponentState,
} from '@/store';
import type { ComponentType } from '@/store';

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
      const attachType = (value: Partial<State> | State) => {
        if (!typeHint) {
          return value as Partial<ComponentState>;
        }
        const existing = useAppStore.getState().components[componentId];
        if (existing && existing.type !== typeHint) {
          return {
            ...existing,
            ...value,
            type: typeHint,
          } as Partial<ComponentState>;
        }
        return {
          ...value,
          type: typeHint,
        } as Partial<ComponentState>;
      };

      if (typeof updater === 'function') {
        const currentState =
          (useAppStore.getState().components[componentId] as State | undefined) ??
          (createComponentState(
            componentId,
            (typeHint ?? DEFAULT_COMPONENT_TYPE) as ComponentType,
          ) as State);
        const result = updater(currentState);
        updateComponent(componentId, attachType(result));
      } else {
        updateComponent(componentId, attachType(updater));
      }
    },
    [componentId, typeHint, updateComponent],
  );

  return [component, setComponentState] as const;
}
