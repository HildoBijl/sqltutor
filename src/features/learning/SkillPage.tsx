import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Alert, CircularProgress, Button } from '@mui/material';
import { MenuBook, Lightbulb, Edit, Storage } from '@mui/icons-material';

import { useAppStore, type SkillComponentState } from '@/store';
import type { SchemaKey } from '@/features/database/schemas';

import { useContentTabs } from './hooks/useContentTabs';
import { useSkillContent } from './hooks/useSkillContent';
import { useSkillExerciseController } from './hooks/useSkillExerciseController';
import { useAdminMode } from './hooks/useAdminMode';

import { ContentHeader } from './components/ContentHeader';
import { ContentTabs } from './components/ContentTabs';
import { StoryTab, TheoryTab } from './components/TabContent/ContentTab';
import { CompletionDialog, SkillPracticeTab } from './components/SkillPractice';
import { DataExplorerTab } from './components/DataExplorerTab';
import { SKILL_SCHEMAS } from '@/constants';

import type { TabConfig } from './types';

const REQUIRED_EXERCISE_COUNT = 3;

export default function SkillPage() {
  const { skillId } = useParams<{ skillId: string }>();
  const navigate = useNavigate();

  const hideStories = useAppStore((state) => state.hideStories);
  const isAdmin = useAdminMode();

  const allTabs: TabConfig[] = [
    { key: 'story', label: 'Story', icon: <MenuBook /> },
    { key: 'practice', label: 'Practice', icon: <Edit /> },
    { key: 'theory', label: 'Theory', icon: <Lightbulb /> },
    { key: 'data', label: 'Data Explorer', icon: <Storage /> },
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

  const skillSchema: SchemaKey =
    skillId && skillId in SKILL_SCHEMAS
      ? (SKILL_SCHEMAS[skillId as keyof typeof SKILL_SCHEMAS] as SchemaKey)
      : ('companies' as SchemaKey);

  const controller = useSkillExerciseController({
    skillId: skillId ?? '',
    skillModule,
    schema: skillSchema,
    requiredCount: REQUIRED_EXERCISE_COUNT,
    componentState,
    setComponentState,
  });

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

  const isSkillMastered = (componentState.numSolved || 0) >= REQUIRED_EXERCISE_COUNT;

  const progressInfo =
    currentTab === 'practice'
      ? {
          current: componentState.numSolved ?? 0,
          required: REQUIRED_EXERCISE_COUNT,
        }
      : undefined;

  const { practice, status, actions } = controller;
  const showStoryButton = tabs.some((tab) => tab.key === 'story');

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

      {tabs.length > 0 && (
        <ContentTabs value={currentTab} tabs={tabs} onChange={handleTabChange}>
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
          {currentTab === 'story' && <StoryTab contentId={skillMeta.id} />}
          {currentTab === 'data' &&
            (status.dbReady ? (
              <DataExplorerTab schema={skillSchema} />
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
