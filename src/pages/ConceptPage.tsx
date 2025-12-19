import { useMemo, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Box, Button, Alert } from '@mui/material';
import { CheckCircle, School, Lightbulb, MenuBook, Bolt } from '@mui/icons-material';

import { useAppStore, type ConceptComponentState } from '@/store';
import { contentIndex, type ContentMeta } from '@/curriculum';
import { useContentTabs } from '@/learning/hooks/useContentTabs';
import { useAdminMode } from '@/learning/hooks/useAdminMode';
import { ContentHeader } from '@/learning/components/ContentHeader';
import { ContentTabs } from '@/learning/components/ContentTabs';
import { StoryTab, TheoryTab, VideoTab, SummaryTab } from '@/learning/components/TabContent/ContentTab';
import type { TabConfig } from '@/learning/types';
import { markPrerequisitesComplete } from '@/learning/utils/markPrerequisitesComplete';
import { ConceptCompletionDialog } from '@/learning/components/ConceptCompletionDialog';

export default function ConceptPage() {
  const { conceptId } = useParams<{ conceptId: string }>();
  const navigate = useNavigate();
  const hideStories = useAppStore((state) => state.hideStories);
  const isAdmin = useAdminMode();
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);

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
  const summaryUnlocked = isCompleted || isAdmin;

  const visibleTabs = useMemo(
    () => (summaryUnlocked ? tabs : tabs.filter((tab) => tab.key !== 'summary')),
    [summaryUnlocked, tabs],
  );

  useEffect(() => {
    if (!summaryUnlocked && currentTab === 'summary') {
      const fallbackTab =
        tabs.find((tab) => tab.key === 'theory')?.key ??
        tabs.find((tab) => tab.key !== 'summary')?.key ??
        'theory';
      selectTab(fallbackTab);
    }
  }, [currentTab, summaryUnlocked, selectTab, tabs]);

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

    // Mark all prerequisites as complete
    markPrerequisitesComplete(conceptMeta.id);

    setShowCompletionDialog(true);
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
          {currentTab === 'summary' && summaryUnlocked && <SummaryTab contentId={conceptMeta.id} />}
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

      <ConceptCompletionDialog
        open={showCompletionDialog}
        conceptName={conceptMeta.name}
        onClose={() => setShowCompletionDialog(false)}
        onViewSummary={() => {
          setShowCompletionDialog(false);
          selectTab('summary');
        }}
        onReturnToOverview={() => navigate('/learn')}
      />
    </Container>
  );
}
