import type { ReactNode } from 'react';

import { SqlModuleProvider } from '@sqlvalley/sql';
import { useSettingsStore } from '@/store';
import { getModuleTables } from './moduleAccess';

/** The module provider SQL skills prescribe: the SQL environment for their tables. */
export function SqlPracticeProvider({ skillId, children }: { skillId: string; children: ReactNode }) {
  const datasetSize = useSettingsStore((state) => state.practiceDatasetSize);
  const setDatasetSize = useSettingsStore((state) => state.setPracticeDatasetSize);

  return (
    <SqlModuleProvider
      skillId={skillId}
      tables={getModuleTables(skillId)}
      datasetSize={datasetSize}
      setDatasetSize={setDatasetSize}
    >
      {children}
    </SqlModuleProvider>
  );
}
