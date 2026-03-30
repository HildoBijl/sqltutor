import {
  raModulePositions,
  raConnectors,
} from "@/learning/skilltree/definitions/ra-treeDefinition";
import { SkillTreeOverviewPage } from "./SkillTreeOverviewPage";

/*
 * RALearningOverviewPage component that displays the Relational Algebra skill tree overview page.
 * This page is accessible at /learn-ra and shows the RA skill tree.
 */
export default function RALearningOverviewPage() {
  return (
    <SkillTreeOverviewPage
      treeId="ra"
      modulePositions={raModulePositions}
      visiblePaths={raConnectors}
    />
  );
}
