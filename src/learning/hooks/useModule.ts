import { useMemo } from 'react';
import type { LazyExoticComponent, ComponentType } from 'react';

import { moduleComponents } from '@/curriculum/utils/loaders';

export type ModuleComponent = LazyExoticComponent<ComponentType<any>>;

export function useModule(moduleId: string | null | undefined, tab: string): ModuleComponent | undefined {
  return useMemo(() => {
    if (!moduleId) return undefined;
    return moduleComponents[moduleId]?.[tab];
  }, [moduleId, tab]);
}
