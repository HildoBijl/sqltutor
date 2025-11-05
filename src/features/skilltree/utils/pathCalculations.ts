import { Vector } from "@/utils/geometry";
import { cardHeight, initialPathSpacing, maxPathSpace, minVerticalOffset, maxVerticalOffset } from "./settings";
import { ContentPositionMeta } from "./treeDefinition";

/*
* Utility function to compute points for curved connectors between nodes in the skill tree.
* Uses the Drawing library coordinate system directly from item positions.
* Returns an array of Vector points that form a smooth curved path.
*
* @param from - The starting content position item (prerequisite).
* @param to - The ending content position item (dependent).
* @returns An array of Vector points representing the curved connector path.
*/
export function computeConnectorPath(
  from: ContentPositionMeta,
  to: ContentPositionMeta,
): Vector[] {
  // Calculate the index of the from/to with respect to all respective prerequisites/follow-ups.
  const toIndex = to.prerequisitesPathOrder.indexOf(from.id);
  const fromIndex = from.followUpsPathOrder.indexOf(to.id);

  // Calculate horizontal offsets.
  const startHorizontalOffset = getHorizontalPathOffset(fromIndex, from.followUpsPathOrder.length);
  const endHorizontalOffset = getHorizontalPathOffset(toIndex, to.prerequisitesPathOrder.length);

  // Calculate vertical offsets.
  let startVerticalOffset = getVerticalPathOffset(fromIndex, from.followUpsPathOrder.length);
  let endVerticalOffset = getVerticalPathOffset(toIndex, to.prerequisitesPathOrder.length);

  // Determine start and end points.
  const start = from.position.add([startHorizontalOffset, cardHeight / 2]);
  const end = to.position.add([endHorizontalOffset, -cardHeight / 2]);

  // Add in intermediate control points.
  return [start, start.add([0, startVerticalOffset]), end.add([0, -endVerticalOffset]), end];
}

// getHorizontalPathOffset takes an index (for example "2" for third) and a number of paths (for example 6) and calculates the offset which this third path should have relative to the center, given that there are six paths.
function getHorizontalPathOffset(index: number, numPaths: number): number {
  if (numPaths === 1)
    return 0;
  const pathSpacing = getPathSpacing(numPaths);
  return (index - (numPaths - 1) / 2) * pathSpacing;
}

// getPathSpacing calculates the horizontal distance that must appear between paths when rendering them below a content card.
function getPathSpacing(numPaths: number): number {
  const spaceUsed = maxPathSpace * numPaths / (numPaths + maxPathSpace / initialPathSpacing);
  return spaceUsed / (numPaths - 1);
}

// getVerticalPathOffset takes an index (for example "2" for third) and a number of paths (for example 6) and calculates the offset which this third path should have from the card, given that there are six paths.
function getVerticalPathOffset(index: number, numPaths: number): number {
  if (numPaths === 1 || numPaths === 2)
    return maxVerticalOffset;
  const numGaps = numPaths - 1;
  const delta = (index - numGaps / 2) / (numGaps / 2); // A number between -1 and 1.
  return maxVerticalOffset + (minVerticalOffset - maxVerticalOffset) * (delta ** 2);
}
