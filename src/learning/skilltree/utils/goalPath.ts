import { Module, ModuleId } from "@/curriculum";

/*
 * Recursively collects all prerequisite IDs for a given concept or skill.
 */
export function getPrerequisites(itemId: ModuleId, moduleItems: Record<ModuleId, Module>): Set<ModuleId> {
  const prerequisites = new Set<string>();
  const item = moduleItems[itemId];

  if (!item?.prerequisites || item.prerequisites.length === 0)
    return prerequisites;

  for (const prereqId of item.prerequisites) {
    prerequisites.add(prereqId);
    const nestedPrereqs = getPrerequisites(prereqId, moduleItems);
    for (const p of nestedPrereqs) {
      prerequisites.add(p);
    }
  }

  return prerequisites;
}
