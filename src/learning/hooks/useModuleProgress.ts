import { useCallback, useMemo } from "react";
import type { ModuleMeta } from "@/curriculum";
import type { ComponentState } from "@/learning/store";
import { processProgress } from "@/learning/utils/processProgress";


/*
* Hook to determine completion status and progress of modules.
*
* @param moduleItems - Array of modules (concepts and skills).
* @param components - Object mapping module IDs to their progress data.
* @returns An object with concepts, skills, isCompleted, getProgress, completedConcepts, and completedSkills.
*/
export function useModuleProgress(
  moduleItems: ModuleMeta[],
  components: Record<string, ComponentState>,
) {
  const concepts = useMemo(
    () => moduleItems.filter((item) => item.type === "concept"),
    [moduleItems]
  );

  const skills = useMemo(
    () => moduleItems.filter((item) => item.type === "skill"),
    [moduleItems]
  );

  const processed = useMemo(
    () => processProgress(moduleItems, components),
    [moduleItems, components],
  );

  const isCompleted = useCallback(
    (id: string) => processed.completed.has(id),
    [processed],
  );

  const getProgress = useCallback(
    (id: string) => {
      const progress = processed.skillProgress[id];
      if (progress === undefined) return null;
      return `${progress}/${processed.requiredCount}`;
    },
    [processed],
  );

  const completedConcepts = useMemo(() => {
    let count = 0;
    for (const concept of concepts) {
      if (processed.completed.has(concept.id)) {
        count += 1;
      }
    }
    return count;
  }, [concepts, processed]);

  const completedSkills = useMemo(() => {
    let count = 0;
    for (const skill of skills) {
      if (processed.completed.has(skill.id)) {
        count += 1;
      }
    }
    return count;
  }, [processed, skills]);

  return {
    concepts,
    skills,
    isCompleted,
    getProgress,
    completedConcepts,
    completedSkills
  };
}
