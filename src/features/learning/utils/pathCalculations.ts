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
  let gap = 4;
  if (distance > 0 && distance < gap * 2 + 8) {
    gap = Math.max(2, Math.floor(distance / 4));
  }
  const y1 = rawY1 + gap;
  const y2 = rawY2 - gap;

  // Make the lines a bit curved, instead of straight right angles
  const midY = (y1 + y2) / 2;
  const radius = 10; // Curve radius in pixels

  // Build points array for the curved path
  // The Drawing library's Curve component will smooth these points
  const points = [];

  // Start point (bottom of from-card)
  points.push(new Vector(x1, y1));

  // Vertical segment going down
  points.push(new Vector(x1, midY - radius));

  // Horizontal transition point (curve corner)
  const xDirection = Math.sign(x2 - x1);
  points.push(new Vector(x1 + xDirection * radius, midY));

  // If there's significant horizontal distance, add midpoint
  const horizontalDistance = Math.abs(x2 - x1);
  if (horizontalDistance > radius * 4) {
    const midX = (x1 + x2) / 2;
    points.push(new Vector(midX, midY));
  }

  // Horizontal to vertical transition point (curve corner)
  points.push(new Vector(x2 - xDirection * radius, midY));

  // Vertical segment going up
  points.push(new Vector(x2, midY + radius));

  // End point (top of to-card)
  points.push(new Vector(x2, y2));

  return points;
}
