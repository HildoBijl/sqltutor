import { useMemo } from "react";
import { ContentPositionMeta, treeHeight, treeWidth } from "../utils/treeDefinition";


/*
* Calculate the bounding box of a set of content items in a tree layout.
*
* @param contentItems - Array of content items with position and type.
* @returns An object containing minX, minY, maxX, maxY, width, and height of the bounding box.
*/
export function useTreeBounds(contentPositions: Record<string, ContentPositionMeta>) {
  return useMemo(() => {
    // Hardcoded bounds for testing
    return {
      minX: 0,
      minY: 0,
      maxX: treeWidth,
      maxY: treeHeight,
      width: treeWidth,
      height: treeHeight
    };
   
  }, [contentPositions]);
}
