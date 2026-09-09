import { useEffect } from 'react';
import { Container } from '@mui/material';
import { skillTree } from '@/curriculum';
import type { SkillTreeVisualizationId } from '@/curriculum/skillTreeVisualizations';
import { useModuleProgress } from '@sqlvalley/progress';
import {
  SkillTreeCanvas,
  useTreeBounds,
  type SkillTreeCanvasProps,
} from '@sqlvalley/skill-tree';
import { useSkillTreeSettingsStore, useLearningStore } from '@/store';

interface SkillTreeOverviewPageProps {
  treeId: SkillTreeVisualizationId;
  modulePositions: SkillTreeCanvasProps['modulePositions'];
  visiblePaths: SkillTreeCanvasProps['visiblePaths'];
}

export function SkillTreeOverviewPage({
  treeId,
  modulePositions,
  visiblePaths,
}: SkillTreeOverviewPageProps) {
  const markSkillTreeVisited = useSkillTreeSettingsStore(
    (state) => state.markSkillTreeVisited,
  );

  useEffect(() => {
    markSkillTreeVisited(treeId);
  }, [markSkillTreeVisited, treeId]);

  const moduleStates = useLearningStore((state) => state.modules);

  const { isCompleted } = useModuleProgress(skillTree, moduleStates);
  const treeBounds = useTreeBounds(modulePositions);

  const planningMode = useSkillTreeSettingsStore(
    (s) => s.planningMode[treeId] ?? false,
  );
  const setPlanningMode = useSkillTreeSettingsStore((s) => s.setPlanningMode);

  const goalNodeId = useSkillTreeSettingsStore(
    (s) => s.goalNodeID[treeId] ?? null,
  );
  const setGoalNodeId = useSkillTreeSettingsStore((s) => s.setGoalNodeID);

  const hasAccessedPlanningMode = useSkillTreeSettingsStore(
    (s) => s.hasAccessedPlanningMode,
  );
  const setHasAccessedPlanningMode = useSkillTreeSettingsStore(
    (s) => s.setHasAccessedPlanningMode,
  );

  const hasSeenSkillTreeIntro = useSkillTreeSettingsStore(
    (s) => s.hasSeenSkillTreeIntro,
  );
  const setHasSeenSkillTreeIntro = useSkillTreeSettingsStore(
    (s) => s.setHasSeenSkillTreeIntro,
  );

  const hideLegend = useSkillTreeSettingsStore((s) => s.hideLegend);
  const setHideLegend = useSkillTreeSettingsStore((s) => s.setHideLegend);
  const hasHydrated = useSkillTreeSettingsStore((s) => s._hasHydrated);

  return (
    <Container maxWidth={false} sx={{ py: 4, maxWidth: '1400px' }}>
      <SkillTreeCanvas
        skillTree={skillTree}
        modulePositions={modulePositions}
        treeBounds={treeBounds}
        visiblePaths={visiblePaths}
        isCompleted={isCompleted}
        memoryStoreAPI={{
          planningMode,
          setPlanningMode: (value) => setPlanningMode(treeId, value),
          goalNodeId,
          setGoalNodeId: (id) => setGoalNodeId(treeId, id),
          hasAccessedPlanningMode,
          setHasAccessedPlanningMode,
          hasSeenSkillTreeIntro,
          setHasSeenSkillTreeIntro,
          hideLegend,
          setHideLegend,
          hasHydrated,
        }}
        settings={{
          allowZoom: true,
          initialZoom: 1,
          allowPlanningMode: true,
          trackProgress: true,
        }}
      />
    </Container>
  );
}
