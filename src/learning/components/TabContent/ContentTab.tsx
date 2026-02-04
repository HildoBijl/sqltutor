import { Suspense } from 'react';
import { Typography } from '@mui/material';

import { useModule } from '../../hooks/useModule';

interface ModuleTabProps {
  contentId?: string; // Kept as contentId for backwards compatibility in JSX usage
}

interface CreateModuleTabOptions {
  section: string;
  emptyMessage: string;
}

function createModuleTab({ section, emptyMessage }: CreateModuleTabOptions) {
  return function ModuleTab({ contentId: moduleId }: ModuleTabProps) {
    const ModuleComponent = useModule(moduleId ?? null, section);

    if (!ModuleComponent) {
      return (
        <Typography variant="body1" color="text.secondary">
          {emptyMessage}
        </Typography>
      );
    }

    return (
      <Suspense
        fallback={
          <Typography variant="body1" color="text.secondary">
            Loading module...
          </Typography>
        }
      >
        <ModuleComponent />
      </Suspense>
    );
  };
}

export const StoryTab = createModuleTab({
  section: 'Story',
  emptyMessage: 'Story coming soon.',
});

export const TheoryTab = createModuleTab({
  section: 'Theory',
  emptyMessage: 'Theory content coming soon.',
});

export const VideoTab = createModuleTab({
  section: 'Video',
  emptyMessage: 'Video coming soon.',
});

export const SummaryTab = createModuleTab({
  section: 'Summary',
  emptyMessage: 'Summary coming soon.',
});

