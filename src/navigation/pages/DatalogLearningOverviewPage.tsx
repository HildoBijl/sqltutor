import { useEffect, useRef, useState } from "react";
import { Container } from "@mui/material";
import { useLearningStore } from "@/store";
import { moduleList, modules } from "@/curriculum";
import { SkillTreeCanvas } from "@/learning/skilltree/components/SkillTreeCanvas";
import { useModuleProgress } from "@/learning/hooks/useModuleProgress";
import { useTreeBounds } from "@/learning/skilltree/hooks/useTreeBounds";
import { datalogModulePositions, datalogConnectors } from "@/learning/skilltree/datalog-skilltree/datalog-treeDefinitions";
import { markSkillTreeVisited } from "@/learning/utils/skillTreeTracking";

/*
 * Datalog-LearningOverviewPage component that displays the skill tree overview page.
 */
export default function DatalogLearningOverviewPage() {
  const components = useLearningStore((state) => state.components);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

  useEffect(() => {
    markSkillTreeVisited("datalog");
  }, []);

  const { isCompleted, getProgress } = useModuleProgress(
    moduleList,
    components
  );

  const treeBounds = useTreeBounds(datalogModulePositions);

  return (
    <Container maxWidth={false} sx={{ py: 4, maxWidth: "1400px" }}>
      <SkillTreeCanvas
        treeId="datalog"
        moduleItems={modules}
        modulePositions={datalogModulePositions}
        treeBounds={treeBounds}
        visiblePaths={datalogConnectors}
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
