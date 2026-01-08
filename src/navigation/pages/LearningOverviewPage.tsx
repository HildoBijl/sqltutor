import { useState, useRef } from "react";
import { Container } from "@mui/material";
import { useAppStore } from "@/store";
import { contentIndex, contentItems } from "@/curriculum";
import { SkillTreeCanvas } from "@/learning/skilltree/components/SkillTreeCanvas";
import { useContentProgress } from "@/learning/hooks/useContentProgress";
import { useTreeBounds } from "@/learning/skilltree/hooks/useTreeBounds";
import { contentPositions, connectors } from "@/learning/skilltree/utils/treeDefinition";

/*
 * LearningOverviewPage component that displays the skill tree overview page.
 */
export default function LearningOverviewPage() {
  const components = useAppStore((state) => state.components);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

  const { isCompleted, getProgress } = useContentProgress(
    contentIndex,
    components
  );

  const treeBounds = useTreeBounds(contentPositions);

  return (
    <Container maxWidth={false} sx={{ py: 4, maxWidth: "1400px" }}>
      <SkillTreeCanvas
        contentItems={contentItems}
        contentPositions={contentPositions}
        treeBounds={treeBounds}
        visiblePaths={connectors}
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
