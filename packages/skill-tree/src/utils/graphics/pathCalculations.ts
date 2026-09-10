import { Vector } from '@step-wise/geometry';
import type { ModulePositionMeta } from '../positionProcessing';
import {
  cardHeight,
  initialPathSpacing,
  maxPathSpace,
  maxVerticalOffset,
  minVerticalOffset,
} from '../settings';

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
  from: ModulePositionMeta,
  to: ModulePositionMeta,
): Vector[] {
  const toIndex = to.prerequisitesPathOrder.indexOf(from.id);
  const fromIndex = from.followUpsPathOrder.indexOf(to.id);

  const startHorizontalOffset = getHorizontalPathOffset(
    fromIndex,
    from.followUpsPathOrder.length,
  );
  const endHorizontalOffset = getHorizontalPathOffset(
    toIndex,
    to.prerequisitesPathOrder.length,
  );

  const startVerticalOffset = getVerticalPathOffset(
    fromIndex,
    from.followUpsPathOrder.length,
  );
  const endVerticalOffset = getVerticalPathOffset(
    toIndex,
    to.prerequisitesPathOrder.length,
  );

  const start = from.position.add([startHorizontalOffset, cardHeight / 2]);
  const end = to.position.add([endHorizontalOffset, -cardHeight / 2]);

  return [
    start,
    start.add([0, startVerticalOffset]),
    end.add([0, -endVerticalOffset]),
    end,
  ];
}

function getHorizontalPathOffset(index: number, numPaths: number): number {
  if (numPaths === 1) return 0;

  const pathSpacing = getPathSpacing(numPaths);
  return (index - (numPaths - 1) / 2) * pathSpacing;
}

function getPathSpacing(numPaths: number): number {
  const spaceUsed =
    (maxPathSpace * numPaths) / (numPaths + maxPathSpace / initialPathSpacing);
  return spaceUsed / (numPaths - 1);
}

function getVerticalPathOffset(index: number, numPaths: number): number {
  if (numPaths === 1 || numPaths === 2) return maxVerticalOffset;

  const numGaps = numPaths - 1;
  const delta = (index - numGaps / 2) / (numGaps / 2);
  return maxVerticalOffset + (minVerticalOffset - maxVerticalOffset) * delta ** 2;
}
