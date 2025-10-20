import { ContentMeta } from "@/features/content";
// @ts-ignore - Vector is a JavaScript module without type definitions
import { Vector } from "@/util/geometry/Vector";

/*
* Utility function to compute points for curved connectors between nodes in the skill tree.
* Uses the Drawing library coordinate system directly from item positions.
* Returns an array of Vector points that form a smooth curved path.
*
* @param fromItem - The starting content item (prerequisite).
* @param toItem - The ending content item (dependent).
* @returns An array of Vector points representing the curved connector path.
*/
export function computeConnectorPath(
  fromItem: ContentMeta,
  toItem: ContentMeta
): typeof Vector[] {
  // Card dimensions (must match NodeCard.tsx)
  const cardWidth = 160;
  const cardHeight = 80;

  // Calculate center positions
  const x1 = fromItem.position.x + cardWidth / 2;
  const rawY1 = fromItem.position.y + cardHeight; // Bottom of from-card
  const x2 = toItem.position.x + cardWidth / 2;
  const rawY2 = toItem.position.y; // Top of to-card

  // Leave a small gap so lines don't touch/overlap nodes
  const distance = rawY2 - rawY1;
  let gap = 2;
  if (distance > 0 && distance < gap * 2 + 8) {
    gap = Math.max(2, Math.floor(distance / 4));
  }
  const y1 = rawY1 + gap;
  const y2 = rawY2 - gap;


// Build points array for the curved path
  const points = [];

  // Start point (bottom of from-card)
  points.push(new Vector(x1, y1));

  // Vertical segment going down
  points.push(new Vector(x1, y1+20));

  // Vertical segment going up
  points.push(new Vector(x2, y2-20));

  // End point (top of to-card)
  points.push(new Vector(x2, y2));

  return points;
}
