import { useMemo } from "react";
import { ContentMeta } from "@/features/content";


/*
* Hook to determine completion status and progress of content items.
*
* @param contentItems - Array of content items (concepts and skills).
* @param components - Object mapping content item IDs to their progress data.
* @returns An object with concepts, skills, isCompleted, getProgress, completedConcepts, and completedSkills.
*/
export function useContentProgress(contentItems: ContentMeta[], components: any) {
  const concepts = useMemo(
    () => contentItems.filter((item) => item.type === "concept"),
    [contentItems]
  );

  const skills = useMemo(
    () => contentItems.filter((item) => item.type === "skill"),
    [contentItems]
  );

  const isCompleted = (id: string) => {
    const component = components[id];
    if (!component) return false;

    // For concepts, check if understood
    if (concepts.find((c) => c.id === id)) {
      return component.understood === true;
    }

    // For skills, check if completed (3+ exercises)
    return (component.numSolved || 0) >= 3;
  };

  const getProgress = (id: string) => {
    const component = components[id];
    if (!component) return null;

    // For skills, return exercise progress
    if (skills.find((s) => s.id === id) && component.numSolved) {
      return `${component.numSolved}/3`;
    }

    return null;
  };

  const completedConcepts = concepts.filter((c) => isCompleted(c.id)).length;
  const completedSkills = skills.filter((s) => isCompleted(s.id)).length;

  return {
    concepts,
    skills,
    isCompleted,
    getProgress,
    completedConcepts,
    completedSkills
  };
}
