import { Suspense } from 'react';
import { Typography } from '@mui/material';

import { hasTopicNarrative } from '@/curriculum/utils/topicNarratives';
import { TopicStory } from '@/learning/components/TopicStory';
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

export function StoryTab({ contentId: moduleId }: ModuleTabProps) {
  const ModuleComponent = useModule(moduleId ?? null, 'Story');

  if (hasTopicNarrative(moduleId)) {
    return <TopicStory moduleId={moduleId ?? ''} />;
  }

  if (!ModuleComponent) {
    return (
      <Typography variant="body1" color="text.secondary">
        Story coming soon.
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
}

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

