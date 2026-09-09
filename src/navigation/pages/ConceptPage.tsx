import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Box, Button, Container } from '@mui/material';
import {
  Bolt,
  CheckCircle,
  Lightbulb,
  MenuBook,
  School,
} from '@mui/icons-material';

import {
  type ConceptModuleState,
  useLearningStore,
  useSettingsStore,
  useSkillTreeSettingsStore,
} from '@/store';
import { useAdminMode } from '@/store/adminMode';
import { skillTree, type Module } from '@/curriculum';
import {
  defaultSkillTreeVisualization,
  isSkillTreeVisualizationId,
  skillTreeVisualizationById,
  skillTreeVisualizationDefinitions,
  type SkillTreeVisualizationId,
} from '@/curriculum/skillTreeVisualizations';
import { ContentHeader } from '@/learning/components/ContentHeader';
import { ConceptCompletionDialog } from '@/learning/components/ConceptCompletionDialog';
import { ContentTabs } from '@/learning/components/ContentTabs';
import {
  StoryTab,
  SummaryTab,
  TheoryTab,
  VideoTab,
} from '@/learning/components/TabContent/ContentTab';
import { useContentTabs } from '@/learning/hooks/useContentTabs';
import { useModuleProgress } from '@sqlvalley/progress';
import {
  arePrerequisitesCompleted,
  getGoalPath,
  isReadyToLearn,
} from '@sqlvalley/skill-tree-definition';
import type { TabConfig } from '@/learning/types';

export default function ConceptPage() {
  const { conceptId } = useParams<{ conceptId: string }>();
  const navigate = useNavigate();
  const hideStories = useSettingsStore((state) => state.hideStories);
  const completeConcept = useLearningStore((state) => state.completeConcept);
  const isAdmin = useAdminMode();
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const skillTreeHistoryRaw = useSkillTreeSettingsStore(
    (state) => state.lastVisitedSkillTrees,
  );
  const skillTreeHistory = useMemo(
    () => normalizeSkillTreeHistory(skillTreeHistoryRaw),
    [skillTreeHistoryRaw],
  );
  const backToLearningPath = useMemo(
    () => getBackToLearningPathFromHistory(skillTreeHistoryRaw, conceptId),
    [skillTreeHistoryRaw, conceptId],
  );

  const conceptMeta = useMemo<Module | undefined>(() => {
    if (!conceptId) return undefined;
    return Object.values(skillTree).find(
      (item) => item.type === 'concept' && item.id === conceptId,
    );
  }, [conceptId]);

  const allTabs: TabConfig[] = [
    { key: 'story', label: 'Story', icon: <MenuBook /> },
    { key: 'theory', label: 'Theory', icon: <Lightbulb /> },
    // { key: 'video', label: 'Video', icon: <OndemandVideo /> },
    { key: 'summary', label: 'Summary', icon: <Bolt /> },
  ];

  const availableTabs = hideStories
    ? allTabs.filter((tab) => tab.key !== 'story')
    : allTabs;

  const {
    currentTab,
    handleTabChange,
    selectTab,
    tabs,
    moduleState,
  } = useContentTabs<ConceptModuleState>(
    conceptId,
    'concept',
    availableTabs,
    {
      defaultTab: 'theory',
    },
  );

  const moduleStates = useLearningStore((state) => state.modules);

  const { isCompleted: isModuleCompleted } = useModuleProgress(skillTree, moduleStates);
  const isCompleted = conceptId
    ? isModuleCompleted(conceptId)
    : (moduleState.understood ?? false);
  const summaryUnlocked = isCompleted || isAdmin;

  const visibleTabs = useMemo(
    () =>
      summaryUnlocked ? tabs : tabs.filter((tab) => tab.key !== 'summary'),
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

  const conceptTree = useMemo(() => {
    if (!conceptId) return undefined;
    for (const treeId of skillTreeHistory) {
      const tree = skillTreeVisualizationById.get(treeId);
      if (tree?.moduleIds.has(conceptId)) return tree;
    }
    return skillTreeVisualizationDefinitions.find((tree) =>
      tree.moduleIds.has(conceptId),
    );
  }, [conceptId, skillTreeHistory]);

  const goalNodeID = useSkillTreeSettingsStore((state) =>
    conceptTree ? (state.goalNodeID[conceptTree.id] ?? null) : null,
  );

  const goalPath = useMemo(
    () => (goalNodeID ? getGoalPath(skillTree, goalNodeID) : new Set<string>()),
    [goalNodeID],
  );

  const treeModuleIds = conceptTree?.moduleIds ?? new Set<string>();
  const allFollowUps = conceptId
    ? (skillTree[conceptId]?.followUps ?? []).filter((id) => treeModuleIds.has(id))
    : [];
  const allPrereqsDone = (id: string) =>
    arePrerequisitesCompleted(skillTree, id, isModuleCompleted);

  const nextUp = goalNodeID
    ? (() => {
        if (isReadyToLearn(skillTree, goalNodeID, isModuleCompleted)) {
          return [goalNodeID];
        }
        return allFollowUps.filter((id) => goalPath.has(id) && allPrereqsDone(id));
      })()
    : allFollowUps.filter(allPrereqsDone);

  if (!conceptMeta) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Concept not found
          <Button onClick={() => navigate(backToLearningPath)}>
            Return to learning
          </Button>
        </Alert>
      </Container>
    );
  }

  const handleComplete = () => {
    if (!conceptId) {
      return;
    }
    completeConcept(conceptId);

    setShowCompletionDialog(true);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <ContentHeader
        title={conceptMeta.name}
        description={conceptMeta.description}
        onBack={() => navigate(backToLearningPath)}
        icon={<School color="primary" sx={{ fontSize: 32 }} />}
        isCompleted={isCompleted}
      />

      {visibleTabs.length > 0 && (
        <ContentTabs
          value={currentTab}
          tabs={visibleTabs}
          onChange={handleTabChange}
        >
          {currentTab === 'theory' && <TheoryTab contentId={conceptMeta.id} />}
          {currentTab === 'video' && <VideoTab contentId={conceptMeta.id} />}
          {currentTab === 'summary' && summaryUnlocked && (
            <SummaryTab contentId={conceptMeta.id} />
          )}
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
        nextUp={nextUp}
        onNavigateToNext={(id) => {
          const type = skillTree[id]?.type;
          navigate(type === 'skill' ? `/skill/${id}` : `/concept/${id}`);
        }}
        onClose={() => setShowCompletionDialog(false)}
        onViewSummary={() => {
          setShowCompletionDialog(false);
          selectTab('summary');
        }}
        onReturnToOverview={() => navigate(backToLearningPath)}
      />
    </Container>
  );
}

function normalizeSkillTreeHistory(
  history: readonly string[],
): SkillTreeVisualizationId[] {
  const result: SkillTreeVisualizationId[] = [];
  const seen = new Set<SkillTreeVisualizationId>();

  for (const value of history) {
    if (!isSkillTreeVisualizationId(value) || seen.has(value)) {
      continue;
    }
    seen.add(value);
    result.push(value);
  }

  return result;
}

function getBackToLearningPathFromHistory(
  history: readonly string[],
  moduleId?: string,
): string {
  const normalized = normalizeSkillTreeHistory(history);
  const fallbackId = normalized[0] ?? defaultSkillTreeVisualization;

  if (moduleId) {
    for (const treeId of normalized) {
      const tree = skillTreeVisualizationById.get(treeId);
      if (tree?.moduleIds.has(moduleId)) {
        return tree.path;
      }
    }
  }

  return skillTreeVisualizationById.get(fallbackId)?.path ?? '/learn';
}
