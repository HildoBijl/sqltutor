import { useAppStore } from "@/store";
import { contentItems } from "@/curriculum";

/**
 * Marks all prerequisites of a given item as complete. 
 * 
 * @param contentId // The ID of the item whose prerequisites should be marked as completed
 * @param requiredCount // The number of exercises to mark as completed for skills (set to 3)
 */
export function markPrerequisitesComplete(contentId: string, requiredCount: number = 3) {
    // Get the current state of the components from the store 
    const { updateComponent, components } = useAppStore.getState();

    const allPrerequisites = new Set<string>();

    // Recursuive function to collect all prerequisites in a set
    function collectPrerequisites(id: string) {
        const item = contentItems[id];
        if (!item || !item.prerequisites) return;

        for (const prereqID of item.prerequisites) {
            if (!allPrerequisites.has(prereqID)) {
                allPrerequisites.add(prereqID);
                collectPrerequisites(prereqID);
            }
        }
    }

    // Collect all prerequisites for the given item 
    collectPrerequisites(contentId);


    // Mark each prerequisite as complete 
    allPrerequisites.forEach((prereqID) => {
        const item = contentItems[prereqID];
        const currentState = components[prereqID];

        if (!item) return;

        // For concepts, mark as understood 
        if (item.type === "concept") {
            if (currentState?.type === "concept" && currentState.understood !== true) {
                updateComponent(prereqID, { type: "concept", understood: true });
            } else if (!currentState) {
                updateComponent(prereqID, { type: "concept", understood: true });
            }
        } 
        // For skills, set numSolved to the required count (in this case, 3)
        else if (item.type === "skill") {
            const currentSolved = currentState?.type === "skill" ? (currentState.numSolved || 0) : 0;
            if (currentSolved < requiredCount) {
                updateComponent(prereqID, {
                    type: "skill",
                    numSolved: requiredCount,
                    instances: currentState?.type === "skill" ? currentState.instances : {},
                });
            }
        }
    });
}