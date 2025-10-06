import { useState, useRef, useMemo } from "react";
import { Container } from "@mui/material";
import { useAppStore } from "@/store";
import { contentIndex as learningContentIndex } from "@/features/content";
import { SkillTreeCanvas } from "./components/SkillTreeCanvas";
import { useContentProgress } from "./hooks/useContentProgress";
import { useTreeBounds } from "./hooks/useTreeBounds";
import { useTreeConnectors } from "./hooks/useTreeConnectors";

/*
* LearningOverviewPage component that displays the skill tree overview page.
*/
export default function LearningOverviewPage() {
  const components = useAppStore((state) => state.components);
  const contentItems = useMemo(() => learningContentIndex, []);
  const showAll = true; 
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

  const { isCompleted, getProgress } = useContentProgress(
    contentItems,
    components
  );

  const treeBounds = useTreeBounds(contentItems);

  const visiblePaths = useTreeConnectors(
    contentItems,
    containerRef,
    nodeRefs,
    hoveredId,
    showAll,
    components
  );

  return (
    <Container maxWidth={false} sx={{ py: 4, maxWidth: "1400px" }}>
      <SkillTreeCanvas
        contentItems={contentItems}
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
