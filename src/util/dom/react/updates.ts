import { useEffect, useReducer } from 'react';

// Get a function that forces an update for a component.
export function useForceUpdate(): () => void {
  const [, forceUpdate] = useReducer(() => ({}), {});
  return forceUpdate;
}

// Force an update of the component as an effect, updating it after its render. This is useful if we need an update after the references have been established.
export function useForceUpdateEffect(): void {
  const forceUpdate = useForceUpdate();
  useEffect(() => {
    forceUpdate();
  }, [forceUpdate]);
}
