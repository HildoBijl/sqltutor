import { useMemo } from 'react';
import type { LazyExoticComponent, ComponentType } from 'react';

import { contentComponents } from '@/features/content';

export type ContentComponent = LazyExoticComponent<ComponentType<any>>;

export function useContent(contentId: string | null | undefined, tab: string): ContentComponent | undefined {
  return useMemo(() => {
    if (!contentId) return undefined;
    return contentComponents[contentId]?.[tab];
  }, [contentId, tab]);
}

