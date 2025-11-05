import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type SyntheticEvent,
} from 'react';
import { useSearchParams } from 'react-router-dom';

import { useComponentState, type ComponentState } from '@/store';

import type { TabConfig } from '../types';

type ComponentType = ComponentState['type'];

interface UseContentTabsOptions {
  defaultTab?: string;
}

export interface ContentTabsState<State> {
  currentTab: string;
  handleTabChange: (_event: SyntheticEvent, value: string) => void;
  selectTab: (value: string) => void;
  tabs: TabConfig[];
  componentState: State;
  setComponentState: (
    updater:
      | Partial<State>
      | State
      | ((prev: State) => Partial<State> | State)
  ) => void;
}

export function useContentTabs<State extends { tab?: string }>(
  componentId: string | undefined,
  componentType: ComponentType,
  tabs: TabConfig[],
  options?: UseContentTabsOptions,
): ContentTabsState<State> {
  const normalizedId = componentId ?? '';
  const [componentState, setComponentState] = useComponentState<State>(
    normalizedId,
    componentType,
  );
  const [searchParams, setSearchParams] = useSearchParams();

  const tabKeys = useMemo(() => tabs.map((tab) => tab.key), [tabs]);
  const searchParamsString = searchParams.toString();
  const normalizedTabParam = searchParams.get('tab')?.toLowerCase() ?? null;

  const defaultTab = useMemo(() => {
    const preferred = options?.defaultTab;
    if (preferred && tabKeys.includes(preferred)) {
      return preferred;
    }
    if (tabKeys.includes('practice')) {
      return 'practice';
    }
    if (tabKeys.includes('theory')) {
      return 'theory';
    }
    return tabKeys[0] ?? '';
  }, [options?.defaultTab, tabKeys]);

  const resolveInitialTab = useCallback(() => {
    if (normalizedTabParam && tabKeys.includes(normalizedTabParam)) {
      return normalizedTabParam;
    }
    if (componentState.tab && tabKeys.includes(componentState.tab)) {
      return componentState.tab;
    }
    return defaultTab;
  }, [componentState.tab, defaultTab, normalizedTabParam, tabKeys]);

  const [currentTab, setCurrentTab] = useState<string>(() => resolveInitialTab());

  useEffect(() => {
    const nextTab = resolveInitialTab();
    if (nextTab && nextTab !== currentTab) {
      setCurrentTab(nextTab);
    }

    if (nextTab && componentState.tab !== nextTab) {
      setComponentState({ tab: nextTab } as Partial<State>);
    }

    if (nextTab && normalizedTabParam !== nextTab) {
      const params = new URLSearchParams(searchParamsString);
      params.set('tab', nextTab);
      setSearchParams(params, { replace: true });
    }
  }, [
    componentState.tab,
    currentTab,
    normalizedTabParam,
    resolveInitialTab,
    searchParamsString,
    setComponentState,
    setSearchParams,
  ]);

  const selectTab = useCallback(
    (value: string) => {
      if (!tabKeys.includes(value)) {
        return;
      }

      setCurrentTab(value);

      if (componentState.tab !== value) {
        setComponentState({ tab: value } as Partial<State>);
      }

      if (normalizedTabParam !== value) {
        const params = new URLSearchParams(searchParamsString);
        params.set('tab', value);
        setSearchParams(params, { replace: true });
      }
    },
    [componentState.tab, normalizedTabParam, searchParamsString, setComponentState, setSearchParams, tabKeys],
  );

  const handleTabChange = useCallback(
    (_event: SyntheticEvent, value: string) => {
      selectTab(value);
    },
    [selectTab],
  );

  return {
    currentTab,
    handleTabChange,
    selectTab,
    tabs,
    componentState,
    setComponentState,
  };
}
