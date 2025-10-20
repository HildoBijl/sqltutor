import { contentIndex, ContentMeta } from "@/features/content";
// @ts-ignore - Vector is a JavaScript module without type definitions
import { Vector } from "@/util/geometry/Vector";

export function computeOutgoingOffset(
  items: ContentMeta[],
  spacing = 20
): Record<string, Record<string, number>> {
  const offsets: Record<string, Record<string, number>> = {};

  for (const from of items) {
    const outgoing = items
    .filter(to => (to.prerequisites.includes(from.id)))
    .sort((a, b) => a.position.x - b.position.x);

    const total = outgoing.length;
    if (total <= 1 ) continue;

    const mid = (total - 1) / 2;

    outgoing.forEach((to, i) => {
      const offset = (i - mid) * spacing;
      if (!offsets[from.id]) offsets[from.id] = {};
      offsets[from.id][to.id] = offset;
    });

  }
  return offsets;
}


const offsets = computeOutgoingOffset(contentIndex);


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
): Vector[] {

  // Card dimensions (must match NodeCard.tsx)
  const cardWidth = 160;
  const cardHeight = 80;

  const xOffset = offsets[fromItem.id]?.[toItem.id] ?? 0;

  // Calculate center positions
  const x1 = fromItem.position.x + cardWidth / 2 + xOffset;
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

  // Determine curve offeset based on vertical and horizonal distance
  const curveOffset = Math.min(
    Math.abs(y2 - y1) * 0.3,
    Math.max(20, Math.abs(x2 - x1) * 0.2)
  );


// Build points array for the curved path
  const points: Vector[] = [];

  // Start point (bottom of from-card)
  points.push(new Vector(x1, y1));


  // Control points for the curve
  if (Math.abs(x2 - x1) > 10) {
    points.push(new Vector(x1, y1 + curveOffset));
    points.push(new Vector(x2, y2 - curveOffset));
  } else 
    // If mostly vertical, use a single midpoint
  {
    const midY = (y1 + y2) / 2;
    points.push(new Vector(x1, midY));
  }

  // End point (top of to-card)
  points.push(new Vector(x2, y2));

  return points;
}



