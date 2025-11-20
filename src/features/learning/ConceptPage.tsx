import { useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Box, Button, Alert } from '@mui/material';
import { CheckCircle, School, Lightbulb, MenuBook, Bolt } from '@mui/icons-material';

import { useAppStore, type ConceptComponentState } from '@/store';
import { contentIndex, type ContentMeta } from '@/features/content';
import { useContentTabs } from './hooks/useContentTabs';
import { ContentHeader } from './components/ContentHeader';
import { ContentTabs } from './components/ContentTabs';
import { StoryTab, TheoryTab, VideoTab, SummaryTab } from './components/TabContent/ContentTab';
import type { TabConfig } from './types';
import { markPrerequisitesComplete } from './utils/markPrerequisitesComplete';

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
    // { key: 'video', label: 'Video', icon: <OndemandVideo /> },
    { key: 'summary', label: 'Summary', icon: <Bolt /> },
  ];

  const availableTabs = hideStories ? allTabs.filter((tab) => tab.key !== 'story') : allTabs;

  const {
    currentTab,
    handleTabChange,
    selectTab,
    tabs,
    componentState,
    setComponentState,
  } = useContentTabs<ConceptComponentState>(conceptId, 'concept', availableTabs, {
    defaultTab: 'theory',
  });

  const isCompleted = componentState.understood ?? false;

  const visibleTabs = useMemo(
    () => (isCompleted ? tabs : tabs.filter((tab) => tab.key !== 'summary')),
    [isCompleted, tabs],
  );

  useEffect(() => {
    if (!isCompleted && currentTab === 'summary') {
      const fallbackTab =
        tabs.find((tab) => tab.key === 'theory')?.key ??
        tabs.find((tab) => tab.key !== 'summary')?.key ??
        'theory';
      selectTab(fallbackTab);
    }
  }, [currentTab, isCompleted, selectTab, tabs]);

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

  const handleComplete = () => {
    setComponentState({ understood: true });

    //Mark all prerequisites as complete 
    markPrerequisitesComplete(conceptMeta.id);
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

      {visibleTabs.length > 0 && (
        <ContentTabs value={currentTab} tabs={visibleTabs} onChange={handleTabChange}>
          {currentTab === 'theory' && <TheoryTab contentId={conceptMeta.id} />}
          {currentTab === 'video' && <VideoTab contentId={conceptMeta.id} />}
          {currentTab === 'summary' && isCompleted && <SummaryTab contentId={conceptMeta.id} />}
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
