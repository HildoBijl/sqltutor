import { useMemo } from "react";
import { ContentMeta } from "@/features/content";

// Constants for card dimensions and tree padding
const CARD_WIDTH = 160;
const CARD_HEIGHT_CONCEPT = 60;
const CARD_HEIGHT_SKILL = 80;
const TREE_PADDING = 40;

/*
* Calculate the bounding box of a set of content items in a tree layout.
*
* @param contentItems - Array of content items with position and type.
* @returns An object containing minX, minY, maxX, maxY, width, and height of the bounding box.
*/
export function useTreeBounds(contentItems: ContentMeta[]) {
  return useMemo(() => {
    // Hardcoded bounds for testing
    return {
      minX: -200,
      minY: 0,
      maxX: 1800,
      maxY: 1200,
      width: 1800,
      height: 1200
    };

    // Original dynamic calculation (commented out)
    // if (contentItems.length === 0) {
    //   return { minX: 0, minY: 0, maxX: 1800, maxY: 1200, width: 1600, height: 900 };
    // }

    // let minX = Infinity;
    // let minY = Infinity;
    // let maxX = -Infinity;
    // let maxY = -Infinity;

    // for (const item of contentItems) {
    //   const cardHeight = item.type === 'concept' ? CARD_HEIGHT_CONCEPT : CARD_HEIGHT_SKILL;

    //   minX = Math.min(minX, item.position.x);
    //   minY = Math.min(minY, item.position.y);
    //   maxX = Math.max(maxX, item.position.x + CARD_WIDTH);
    //   maxY = Math.max(maxY, item.position.y + cardHeight);
    // }

    // minX -= TREE_PADDING;
    // minY -= TREE_PADDING;
    // maxX += TREE_PADDING;
    // maxY += TREE_PADDING;

    // return {
    //   minX,
    //   minY,
    //   maxX,
    //   maxY,
    //   width: maxX - minX,
    //   height: maxY - minY
    // };
  }, [contentItems]);
}
