import { useMemo } from "react";
import { ContentMeta } from "@/features/content";
import { computeConnectorPath } from "../utils/pathCalculations";
// @ts-ignore - Vector is a JavaScript module without type definitions
import type { Vector } from "@/util/geometry/Vector";

/*
* Hook to compute connector paths for nodes in a skill tree.
* Uses the Drawing library item posinioning. 
*
* @param contentItems - Array of content concepts or skills with their metadata.
* @returns An array of objects with points arrays and associated 'from' and 'to' node IDs.
*/
export function useTreeConnectors(
  contentItems: ContentMeta[]
) {
// Memoize the connectors to avoid recalculating on every render 
  const connectors = useMemo(() => {
    const newConnectors: { points: typeof Vector[]; from: string; to: string }[] = [];
    const byId = new Map(contentItems.map((i) => [i.id, i]));

    for (const item of contentItems) {
      for (const preId of item.prerequisites || []) {
        const preItem = byId.get(preId);
        if (!preItem) continue;

        const points = computeConnectorPath(preItem, item);
        newConnectors.push({ points, from: preId, to: item.id });
      }
    }

    return newConnectors;
  }, [contentItems]);

  return connectors;
}
