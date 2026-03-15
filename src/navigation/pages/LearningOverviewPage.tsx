import { modulePositions, connectors } from "@/learning/skilltree/utils/treeDefinition";
import { SkillTreeOverviewPage } from "./SkillTreeOverviewPage";

/*
 * LearningOverviewPage component that displays the skill tree overview page.
 */
export default function LearningOverviewPage() {
  return (
    <SkillTreeOverviewPage
      treeId="sql"
      modulePositions={modulePositions}
      visiblePaths={connectors}
    />
  );
}
