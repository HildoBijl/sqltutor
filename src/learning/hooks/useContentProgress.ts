import { useCallback, useMemo } from "react";
import type { ContentMeta } from "@/curriculum";
import type { ComponentState } from "@/learning/store";
import { processProgress } from "@/learning/utils/processProgress";


/*
* Hook to determine completion status and progress of content items.
*
* @param contentItems - Array of content items (concepts and skills).
* @param components - Object mapping content item IDs to their progress data.
* @returns An object with concepts, skills, isCompleted, getProgress, completedConcepts, and completedSkills.
*/
export function useContentProgress(
  contentItems: ContentMeta[],
  components: Record<string, ComponentState>,
) {
  const concepts = useMemo(
    () => contentItems.filter((item) => item.type === "concept"),
    [contentItems]
  );

  const skills = useMemo(
    () => contentItems.filter((item) => item.type === "skill"),
    [contentItems]
  );

  const processed = useMemo(
    () => processProgress(contentItems, components),
    [contentItems, components],
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
