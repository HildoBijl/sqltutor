import { Suspense } from 'react';
import { Typography } from '@mui/material';

import { useContent } from '../../hooks/useContent';

interface ContentTabProps {
  contentId?: string;
}

interface CreateContentTabOptions {
  section: string;
  emptyMessage: string;
}

function createContentTab({ section, emptyMessage }: CreateContentTabOptions) {
  return function ContentTab({ contentId }: ContentTabProps) {
    const ContentComponent = useContent(contentId ?? null, section);

    if (!ContentComponent) {
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
            Loading content...
          </Typography>
        }
      >
        <ContentComponent />
      </Suspense>
    );
  };
}

export const TheoryTab = createContentTab({
  section: 'Theory',
  emptyMessage: 'Theory content coming soon.',
});

export const StoryTab = createContentTab({
  section: 'Story',
  emptyMessage: 'Story coming soon.',
});

export const SummaryTab = createContentTab({
  section: 'Summary',
  emptyMessage: 'Summary coming soon.',
});

export const VideoTab = createContentTab({
  section: 'Video',
  emptyMessage: 'Video coming soon.',
});

