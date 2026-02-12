import { useEffect, useRef, useState } from "react";
import { Container } from "@mui/material";
import { useAppStore } from "@/learning/store";
import { moduleIndex, moduleItems } from "@/curriculum/index";
import { SkillTreeCanvas } from "@/learning/skilltree/components/SkillTreeCanvas";
import { useModuleProgress } from "@/learning/hooks/useModuleProgress";
import { useTreeBounds } from "@/learning/skilltree/hooks/useTreeBounds";
import { raModulePositions, raConnectors } from "@/learning/skilltree/ra-skilltree/ra-treeDefinition";
import { markSkillTreeVisited } from "@/learning/utils/skillTreeTracking";

/*
 * RALearningOverviewPage component that displays the Relational Algebra skill tree overview page.
 * This page is accessible at /learn-ra and shows the RA skill tree.
 */
export default function RALearningOverviewPage() {
  const components = useAppStore((state) => state.components);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

  useEffect(() => {
    markSkillTreeVisited("ra");
  }, []);

  const { isCompleted, getProgress } = useModuleProgress(
    moduleIndex,
    components
  );

  const treeBounds = useTreeBounds(raModulePositions);

  return (
    <Container maxWidth={false} sx={{ py: 4, maxWidth: "1400px" }}>
      <SkillTreeCanvas
        treeId="ra"
        moduleItems={moduleItems}
        modulePositions={raModulePositions}
        treeBounds={treeBounds}
        visiblePaths={raConnectors}
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
