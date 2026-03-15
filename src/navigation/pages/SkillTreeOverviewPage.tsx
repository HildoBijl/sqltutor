import { useEffect, useRef, useState } from "react";
import { Container } from "@mui/material";
import { moduleIndex, moduleItems } from "@/curriculum";
import { useLearningStore } from "@/store";
import {
  SkillTreeCanvas,
  type SkillTreeCanvasProps,
} from "@/learning/skilltree/components/SkillTreeCanvas";
import { useModuleProgress } from "@/learning/hooks/useModuleProgress";
import { useTreeBounds } from "@/learning/skilltree/hooks/useTreeBounds";
import { markSkillTreeVisited, type SkillTreeId } from "@/learning/utils/skillTreeTracking";

interface SkillTreeOverviewPageProps {
  treeId: SkillTreeId;
  modulePositions: SkillTreeCanvasProps['modulePositions'];
  visiblePaths: SkillTreeCanvasProps['visiblePaths'];
}

export function SkillTreeOverviewPage({
  treeId,
  modulePositions,
  visiblePaths,
}: SkillTreeOverviewPageProps) {
  const components = useLearningStore((state) => state.components);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

  useEffect(() => {
    markSkillTreeVisited(treeId);
  }, [treeId]);

  const { isCompleted, getProgress } = useModuleProgress(
    moduleIndex,
    components,
  );

  const treeBounds = useTreeBounds(modulePositions);

  return (
    <Container maxWidth={false} sx={{ py: 4, maxWidth: "1400px" }}>
      <SkillTreeCanvas
        treeId={treeId}
        moduleItems={moduleItems}
        modulePositions={modulePositions}
        treeBounds={treeBounds}
        visiblePaths={visiblePaths}
        isCompleted={isCompleted}
        getProgress={getProgress}
        hoveredId={hoveredId}
        setHoveredId={setHoveredId}
        containerRef={containerRef}
        nodeRefs={nodeRefs}
      />
    </Container>
  );
}
