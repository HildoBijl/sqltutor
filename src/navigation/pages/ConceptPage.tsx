import { useMemo, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Box, Button, Alert } from "@mui/material";
import {
  CheckCircle,
  School,
  Lightbulb,
  MenuBook,
  Bolt,
} from "@mui/icons-material";

import {
  useLearningStore,
  useSettingsStore,
  useSkillTreeSettingsStore,
  type ConceptModuleState,
} from "@/store";
import { moduleList, type Module } from "@/curriculum";
import { useContentTabs } from "@/learning/hooks/useContentTabs";
import { useModuleProgress } from "@/learning/hooks/useModuleProgress";
import { useAdminMode } from "@/learning/hooks/useAdminMode";
import { useSkillTreeHistory } from "@/learning/hooks/useSkillTreeHistory";
import { ContentHeader } from "@/learning/components/ContentHeader";
import { ContentTabs } from "@/learning/components/ContentTabs";
import {
  StoryTab,
  TheoryTab,
  VideoTab,
  SummaryTab,
} from "@/learning/components/TabContent/ContentTab";
import type { TabConfig } from "@/learning/types";
import { ConceptCompletionDialog } from "@/learning/components/ConceptCompletionDialog";
import {
  getBackToLearningPathFromHistory,
  getSkillTreeDefinitions,
} from "@/learning/utils/skillTreeTracking";

import { modules } from "@/curriculum";
import { getPrerequisites } from "@/learning/skilltree/utils/goalPath";

export default function ConceptPage() {
  const { conceptId } = useParams<{ conceptId: string }>();
  const navigate = useNavigate();
  const hideStories = useSettingsStore((state) => state.hideStories);
  const learningModules = useLearningStore((state) => state.modules);
  const completeConcept = useLearningStore((state) => state.completeConcept);
  const isAdmin = useAdminMode();
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const skillTreeHistory = useSkillTreeHistory();
  const backToLearningPath = useMemo(
    () => getBackToLearningPathFromHistory(skillTreeHistory, conceptId),
    [skillTreeHistory, conceptId],
  );

  const conceptMeta = useMemo<Module | undefined>(() => {
    if (!conceptId) return undefined;
    return moduleList.find(
      (item) => item.type === "concept" && item.id === conceptId,
    );
  }, [conceptId]);

  const allTabs: TabConfig[] = [
    { key: "story", label: "Story", icon: <MenuBook /> },
    { key: "theory", label: "Theory", icon: <Lightbulb /> },
    // { key: 'video', label: 'Video', icon: <OndemandVideo /> },
    { key: "summary", label: "Summary", icon: <Bolt /> },
  ];

  const availableTabs = hideStories
    ? allTabs.filter((tab) => tab.key !== "story")
    : allTabs;

  const {
    currentTab,
    handleTabChange,
    selectTab,
    tabs,
    moduleState,
  } = useContentTabs<ConceptModuleState>(
    conceptId,
    "concept",
    availableTabs,
    {
      defaultTab: "theory",
    },
  );

  const { isCompleted: isModuleCompleted } = useModuleProgress(
    moduleList,
    learningModules,
  );
  const isCompleted = conceptId
    ? isModuleCompleted(conceptId)
    : (moduleState.understood ?? false);
  const summaryUnlocked = isCompleted || isAdmin;

  const visibleTabs = useMemo(
    () =>
      summaryUnlocked ? tabs : tabs.filter((tab) => tab.key !== "summary"),
    [summaryUnlocked, tabs],
  );

  useEffect(() => {
    if (!summaryUnlocked && currentTab === "summary") {
      const fallbackTab =
        tabs.find((tab) => tab.key === "theory")?.key ??
        tabs.find((tab) => tab.key !== "summary")?.key ??
        "theory";
      selectTab(fallbackTab);
    }
  }, [currentTab, summaryUnlocked, selectTab, tabs]);

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

  // Calculate in which skill tree this concept is located, preferring the tree the user came from
  const conceptTree = useMemo(() => {
    if (!conceptId) return undefined;
    for (let i = skillTreeHistory.length - 1; i >= 0; i--) {
      const tree = getSkillTreeDefinitions().find(
        (t) => t.id === skillTreeHistory[i] && t.moduleIds.has(conceptId)
      );
      if (tree) return tree;
    }
    return getSkillTreeDefinitions().find((tree) => tree.moduleIds.has(conceptId));
  }, [conceptId, skillTreeHistory]);

  // Calculate the current goal node ID for this tree (if any)
  const goalNodeID = useSkillTreeSettingsStore((state) =>
    conceptTree ? (state.goalNodeID[conceptTree.id] ?? null) : null,
  );

  // Get all prerequisites for the current goal node
  const prerequisitesOfGoal = goalNodeID
    ? getPrerequisites(goalNodeID, modules)
    : new Set<string>();

  const treeModuleIds = conceptTree?.moduleIds ?? new Set<string>();
  const allFollowUps = conceptId
    ? (modules[conceptId]?.followUps ?? []).filter((id) => treeModuleIds.has(id))
    : [];
  const allPrereqsDone = (id: string) =>
    modules[id]?.prerequisites?.every((prereqId) => isModuleCompleted(prereqId)) ?? true;

  const nextUp = goalNodeID
    ? (() => {
        if (!isModuleCompleted(goalNodeID) && allPrereqsDone(goalNodeID)) {
          return [goalNodeID];
        }
        return allFollowUps.filter(
          (id) => (prerequisitesOfGoal.has(id) || id === goalNodeID) && allPrereqsDone(id)
        );
      })()
    : allFollowUps.filter(allPrereqsDone);

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
          {currentTab === "theory" && <TheoryTab contentId={conceptMeta.id} />}
          {currentTab === "video" && <VideoTab contentId={conceptMeta.id} />}
          {currentTab === "summary" && summaryUnlocked && (
            <SummaryTab contentId={conceptMeta.id} />
          )}
          {currentTab === "story" && <StoryTab contentId={conceptMeta.id} />}
        </ContentTabs>
      )}

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
        <span />

        <Box sx={{ display: "flex", gap: 2 }}>
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
          const type = modules[id]?.type;
          navigate(type === "skill" ? `/skill/${id}` : `/concept/${id}`);
        }}
        onClose={() => setShowCompletionDialog(false)}
        onViewSummary={() => {
          setShowCompletionDialog(false);
          selectTab("summary");
        }}
        onReturnToOverview={() => navigate(backToLearningPath)}
      />
    </Container>
  );
}
