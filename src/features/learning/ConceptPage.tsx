import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, Alert } from '@mui/material';
import { CheckCircle, School, Lightbulb, MenuBook, OndemandVideo } from '@mui/icons-material';

import { useAppStore, type ConceptComponentState } from '@/store';
import { contentIndex, type ContentMeta } from '@/features/content';
import { useContentTabs } from './hooks/useContentTabs';
import { ContentHeader } from './components/ContentHeader';
import { ContentTabs } from './components/ContentTabs';
import { StoryTab, SummaryTab, TheoryTab, VideoTab } from './components/TabContent/ContentTab';
import type { TabConfig } from './types';

export default function ConceptPage() {
  const { conceptId } = useParams<{ conceptId: string }>();
  const navigate = useNavigate();
  const hideStories = useAppStore((state) => state.hideStories);

  const conceptMeta = useMemo<ContentMeta | undefined>(() => {
    if (!conceptId) return undefined;
    return contentIndex.find((item) => item.type === 'concept' && item.id === conceptId);
  }, [conceptId]);

  const allTabs: TabConfig[] = [
    { key: 'story', label: 'Story', icon: <MenuBook /> },
    { key: 'theory', label: 'Theory', icon: <Lightbulb /> },
    { key: 'video', label: 'Video', icon: <OndemandVideo /> },
    { key: 'summary', label: 'Summary', icon: <MenuBook /> },
  ];

  const availableTabs = hideStories ? allTabs.filter((tab) => tab.key !== 'story') : allTabs;

  const {
    currentTab,
    handleTabChange,
    tabs,
    componentState,
    setComponentState,
  } = useContentTabs<ConceptComponentState>(conceptId, 'concept', availableTabs, {
    defaultTab: 'theory',
  });

  if (!conceptMeta) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Concept not found
          <Button onClick={() => navigate('/learn')}>Return to learning</Button>
        </Alert>
      </Container>
    );
  }

  const isCompleted = componentState.understood ?? false;

  const handleComplete = () => {
    setComponentState({ understood: true });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <ContentHeader
        title={conceptMeta.name}
        description={conceptMeta.description}
        onBack={() => navigate('/learn')}
        icon={<School color="primary" sx={{ fontSize: 32 }} />}
        isCompleted={isCompleted}
      />

      {tabs.length > 0 && (
        <ContentTabs value={currentTab} tabs={tabs} onChange={handleTabChange}>
          {currentTab === 'theory' && <TheoryTab contentId={conceptMeta.id} />}
          {currentTab === 'video' && <VideoTab contentId={conceptMeta.id} />}
          {currentTab === 'summary' && <SummaryTab contentId={conceptMeta.id} />}
          {currentTab === 'story' && <StoryTab contentId={conceptMeta.id} />}
        </ContentTabs>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <span />

        <Box sx={{ display: 'flex', gap: 2 }}>
          {!isCompleted && (
            <Button
              variant="contained"
              onClick={handleComplete}
              startIcon={<CheckCircle />}
            >
              Mark as Complete
            </Button>
          )}
        </Box>
      </Box>
    </Container>
  );
}

