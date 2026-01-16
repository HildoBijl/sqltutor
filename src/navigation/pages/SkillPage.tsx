import { Suspense, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Alert, CircularProgress, Button, Box } from '@mui/material';
import { MenuBook, Lightbulb, Bolt, EditNote, Storage, Edit, CheckCircle } from '@mui/icons-material';

import { useAppStore, type SkillComponentState } from '@/learning/store';
import { contentComponents, contentIndex } from '@/curriculum';
import { getContentTables } from '@/curriculum/utils/contentAccess';

import { useContentTabs } from '@/learning/hooks/useContentTabs';
import { useSkillContent } from '@/learning/hooks/useSkillContent';
import { useSkillExerciseController } from '@/learning/hooks/useSkillExerciseController';
import { useContentProgress } from '@/learning/hooks/useContentProgress';
import { useAdminMode } from '@/learning/hooks/useAdminMode';
import { useSkillTreeHistory } from '@/learning/hooks/useSkillTreeHistory';
import { getBackToLearningPathFromHistory } from '@/learning/utils/skillTreeTracking';

import { ContentHeader } from '@/learning/components/ContentHeader';
import { ContentTabs } from '@/learning/components/ContentTabs';
import { StoryTab, TheoryTab, VideoTab, SummaryTab } from '@/learning/components/TabContent/ContentTab';
import { CompletionDialog, SkillPracticeTab } from '@/learning/components/SkillPractice';
import { DataExplorerTab } from '@/learning/components/DataExplorerTab';

import type { TabConfig } from '@/learning/types';

const REQUIRED_EXERCISE_COUNT = 3;

export default function SkillPage() {
  const { skillId } = useParams<{ skillId: string }>();
  const navigate = useNavigate();

  const hideStories = useAppStore((state) => state.hideStories);
  const components = useAppStore((state) => state.components);
  const isAdmin = useAdminMode();
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const skillTreeHistory = useSkillTreeHistory();
  const backToLearningPath = useMemo(
    () => getBackToLearningPathFromHistory(skillTreeHistory, skillId),
    [skillTreeHistory, skillId],
  );

  // Check what practice mode this skill uses
  const hasStaticPractice = Boolean(skillId && contentComponents[skillId]?.Practice);
  const hasTables = getContentTables(skillId) !== undefined;

  const allTabs: TabConfig[] = [
    { key: 'story', label: 'Story', icon: <MenuBook /> },
    { key: 'theory', label: 'Theory', icon: <Lightbulb /> },
    // { key: 'video', label: 'Video', icon: <OndemandVideo /> },
    { key: 'practice', label: 'Practice', icon: <Edit /> },
    { key: 'data', label: 'Data Explorer', icon: <Storage /> },
    { key: 'summary', label: 'Summary', icon: <Bolt /> },
  ];

  // Filter tabs based on availability
  const availableTabs = allTabs.filter((tab) => {
    if (tab.key === 'story' && hideStories) return false;
    if (tab.key === 'data' && !hasTables) return false;
    return true;
  });

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

  const { isLoading, skillMeta, skillModule, error: contentError } = useSkillContent(skillId, {
    loadExercises: !hasStaticPractice,
  });

  // Determine practice availability
  const hasInteractivePractice = Boolean(skillModule);
  const hasPractice = hasStaticPractice || hasInteractivePractice;

  // Only use exercise controller for interactive practice
  const controller = useSkillExerciseController({
    skillId: skillId ?? '',
    skillModule: hasInteractivePractice ? skillModule : null,
    requiredCount: REQUIRED_EXERCISE_COUNT,
    componentState,
    setComponentState,
  });

  const { isCompleted } = useContentProgress(contentIndex, components);
  const isSkillMastered = skillId ? isCompleted(skillId) : false;
  const summaryUnlocked = isSkillMastered || isAdmin;

  // Filter out practice tab if no practice available
  const visibleTabs = useMemo(() => {
    let filtered = tabs;
    if (!hasPractice) {
      filtered = filtered.filter((tab) => tab.key !== 'practice');
    }
    if (!summaryUnlocked) {
      filtered = filtered.filter((tab) => tab.key !== 'summary');
    }
    return filtered;
  }, [tabs, hasPractice, summaryUnlocked]);

  // Handle static practice completion
  const handleStaticComplete = () => {
    setComponentState({ numSolved: REQUIRED_EXERCISE_COUNT });
    setShowCompletionDialog(true);
  };

  useEffect(() => {
    if (!summaryUnlocked && currentTab === 'summary') {
      const fallbackTab =
        tabs.find((tab) => tab.key === 'practice')?.key ??
        tabs.find((tab) => tab.key !== 'summary')?.key ??
        'practice';
      selectTab(fallbackTab);
    }
  }, [currentTab, summaryUnlocked, selectTab, tabs]);

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
          Skill not found.{' '}
          <Button onClick={() => navigate(backToLearningPath)}>Return to learning</Button>
        </Alert>
      </Container>
    );
  }

  // Only show progress for interactive practice
  const progressInfo =
    hasInteractivePractice && currentTab === 'practice'
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
        onBack={() => navigate(backToLearningPath)}
        icon={<EditNote color="primary" sx={{ fontSize: 32 }} />}
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
          {currentTab === 'practice' && hasStaticPractice && (
            <StaticPracticeTab
              contentId={skillMeta.id}
              onComplete={handleStaticComplete}
              isCompleted={isSkillMastered}
            />
          )}

          {currentTab === 'practice' && hasInteractivePractice && !hasStaticPractice && (
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
          {currentTab === 'summary' && summaryUnlocked && <SummaryTab contentId={skillMeta.id} />}
          {currentTab === 'story' && <StoryTab contentId={skillMeta.id} />}
          {currentTab === 'data' && hasTables &&
            (status.dbReady ? (
              <DataExplorerTab skillId={skillId ?? ''} />
            ) : (
              <Typography variant="body1" color="text.secondary">
                Database is loading...
              </Typography>
            ))}
        </ContentTabs>
      )}

      {currentTab === 'practice' && hasStaticPractice && !isSkillMastered && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <span />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleStaticComplete}
              startIcon={<CheckCircle />}
            >
              I have mastered these exercises
            </Button>
          </Box>
        </Box>
      )}

      {/* Completion dialog for interactive practice */}
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
        onViewSummary={() => {
          controller.dialogs.completion.close();
          selectTab('summary');
        }}
        onContinueLearning={() => navigate(backToLearningPath)}
        showStoryButton={showStoryButton}
      />

      {/* Completion dialog for static practice */}
      <CompletionDialog
        open={showCompletionDialog}
        onClose={() => setShowCompletionDialog(false)}
        skillName={skillMeta.name}
        onViewStory={
          showStoryButton
            ? () => {
              setShowCompletionDialog(false);
              selectTab('story');
            }
            : undefined
        }
        onViewSummary={() => {
          setShowCompletionDialog(false);
          selectTab('summary');
        }}
        onContinueLearning={() => navigate(backToLearningPath)}
        showStoryButton={showStoryButton}
      />
    </Container>
  );
}

/**
 * Static practice tab that renders a Practice.tsx component with completion props.
 */
function StaticPracticeTab({
  contentId,
  onComplete,
  isCompleted,
}: {
  contentId: string;
  onComplete: () => void;
  isCompleted: boolean;
}) {
  const PracticeComponent = contentComponents[contentId]?.Practice;

  if (!PracticeComponent) {
    return null;
  }

  return (
    <Box>
      <Suspense fallback={<CircularProgress />}>
        <PracticeComponent onComplete={onComplete} isCompleted={isCompleted} />
      </Suspense>
    </Box>
  );
}
