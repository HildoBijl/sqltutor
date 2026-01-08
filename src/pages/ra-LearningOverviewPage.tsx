import { useState, useRef } from "react";
import { Container } from "@mui/material";
import { useAppStore } from "@/store";
import { raContentIndex, raContentItems } from "@/curriculum/ra/ra-index";
import { SkillTreeCanvas } from "@/learning/skilltree/components/SkillTreeCanvas";
import { useContentProgress } from "@/learning/hooks/useContentProgress";
import { useTreeBounds } from "@/learning/skilltree/hooks/useTreeBounds";
import { raContentPositions, raConnectors } from "@/learning/skilltree/ra-skilltree/ra-treeDefinition";

/*
 * RALearningOverviewPage component that displays the Relational Algebra skill tree overview page.
 * This page is accessible at /learn-ra and shows the RA skill tree.
 */
export default function RALearningOverviewPage() {
  const components = useAppStore((state) => state.components);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

  const { isCompleted, getProgress } = useContentProgress(
    raContentIndex,
    components
  );

  const treeBounds = useTreeBounds(raContentPositions);

  return (
    <Container maxWidth={false} sx={{ py: 4, maxWidth: "1400px" }}>
      <SkillTreeCanvas
        contentItems={raContentItems}
        contentPositions={raContentPositions}
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
