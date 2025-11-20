import { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Alert, CircularProgress, Button } from '@mui/material';
import { MenuBook, Lightbulb, Bolt, Edit, Storage } from '@mui/icons-material';

import { useAppStore, type SkillComponentState } from '@/store';

import { useContentTabs } from './hooks/useContentTabs';
import { useSkillContent } from './hooks/useSkillContent';
import { useSkillExerciseController } from './hooks/useSkillExerciseController';
import { useAdminMode } from './hooks/useAdminMode';

import { ContentHeader } from './components/ContentHeader';
import { ContentTabs } from './components/ContentTabs';
import { StoryTab, TheoryTab, VideoTab, SummaryTab } from './components/TabContent/ContentTab';
import { CompletionDialog, SkillPracticeTab } from './components/SkillPractice';
import { DataExplorerTab } from './components/DataExplorerTab';

import type { TabConfig } from './types';

const REQUIRED_EXERCISE_COUNT = 3;

export default function SkillPage() {
  const { skillId } = useParams<{ skillId: string }>();
  const navigate = useNavigate();

  const hideStories = useAppStore((state) => state.hideStories);
  const isAdmin = useAdminMode();

  const allTabs: TabConfig[] = [
    { key: 'story', label: 'Story', icon: <MenuBook /> },
    { key: 'theory', label: 'Theory', icon: <Lightbulb /> },
    // { key: 'video', label: 'Video', icon: <OndemandVideo /> },
    { key: 'practice', label: 'Practice', icon: <Edit /> },
    { key: 'data', label: 'Data Explorer', icon: <Storage /> },
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
  } = useContentTabs<SkillComponentState>(skillId, 'skill', availableTabs, {
    defaultTab: 'practice',
  });

  const { isLoading, skillMeta, skillModule, error: contentError } = useSkillContent(skillId);

  const controller = useSkillExerciseController({
    skillId: skillId ?? '',
    skillModule,
    requiredCount: REQUIRED_EXERCISE_COUNT,
    componentState,
    setComponentState,
  });

  const isSkillMastered = (componentState.numSolved || 0) >= REQUIRED_EXERCISE_COUNT;

  const visibleTabs = useMemo(
    () => (isSkillMastered ? tabs : tabs.filter((tab) => tab.key !== 'summary')),
    [isSkillMastered, tabs],
  );

  useEffect(() => {
    if (!isSkillMastered && currentTab === 'summary') {
      const fallbackTab =
        tabs.find((tab) => tab.key === 'practice')?.key ??
        tabs.find((tab) => tab.key !== 'summary')?.key ??
        'practice';
      selectTab(fallbackTab);
    }
  }, [currentTab, isSkillMastered, selectTab, tabs]);

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!skillMeta) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Alert severity="error">
          Skill not found. <Button onClick={() => navigate('/learn')}>Return to learning</Button>
        </Alert>
      </Container>
    );
  }

  const progressInfo =
    currentTab === 'practice'
      ? {
        current: componentState.numSolved ?? 0,
        required: REQUIRED_EXERCISE_COUNT,
      }
      : undefined;

  const { practice, status, actions } = controller;
  const showStoryButton = visibleTabs.some((tab) => tab.key === 'story');

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <ContentHeader
        title={skillMeta.name}
        description={skillMeta.description}
        onBack={() => navigate('/learn')}
        icon={<Edit color="primary" sx={{ fontSize: 32 }} />}
        isCompleted={isSkillMastered}
        progress={progressInfo}
      />

      {contentError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {contentError}
        </Alert>
      )}

      {visibleTabs.length > 0 && (
        <ContentTabs value={currentTab} tabs={visibleTabs} onChange={handleTabChange}>
          {currentTab === 'practice' && (
            <SkillPracticeTab
              practice={practice}
              status={status}
              actions={actions}
              dialogs={controller.dialogs.giveUp}
              isAdmin={isAdmin}
            />
          )}

          {currentTab === 'theory' && <TheoryTab contentId={skillMeta.id} />}
          {currentTab === 'video' && <VideoTab contentId={skillMeta.id} />}
          {currentTab === 'summary' && isSkillMastered && <SummaryTab contentId={skillMeta.id} />}
          {currentTab === 'story' && <StoryTab contentId={skillMeta.id} />}
          {currentTab === 'data' &&
            (status.dbReady ? (
              <DataExplorerTab skillId={skillId ?? ''} />
            ) : (
              <Typography variant="body1" color="text.secondary">
                Database is loading...
              </Typography>
            ))}
        </ContentTabs>
      )}

      <CompletionDialog
        open={controller.dialogs.completion.open}
        onClose={controller.dialogs.completion.close}
        skillName={skillMeta.name}
        onViewStory={
          showStoryButton
            ? () => {
              controller.dialogs.completion.close();
              selectTab('story');
            }
            : undefined
        }
        onContinueLearning={() => navigate('/learn')}
        showStoryButton={showStoryButton}
      />
    </Container>
  );
}
