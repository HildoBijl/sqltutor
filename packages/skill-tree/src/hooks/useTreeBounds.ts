import { useMemo } from 'react';
import type { ModulePositionMeta } from '../utils/positionProcessing';
import { cardHeight, cardWidth, treeMargin } from '../utils/settings';

/*
 * Calculate the bounding box of a set of modules in a tree layout, keeping a
 * margin around the outermost cards on all four sides.
 *
 * Note that the renderer draws cards at absolute coordinates inside a
 * viewBox anchored at "0 0", so a tree whose top-left card does not sit on
 * the first grid cell keeps that leading space rather than being shifted up
 * against the edge. Honouring a non-zero origin would require the renderer to
 * offset by minX/minY as well.
 *
 * @param modulePositions - Module position data keyed by module ID.
 * @returns An object containing minX, minY, maxX, maxY, width, and height of the bounding box.
 */
export function useTreeBounds(modulePositions: Record<string, ModulePositionMeta>) {
  return useMemo(() => {
    const positions = Object.values(modulePositions);
    if (positions.length === 0) {
      return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const { position } of positions) {
      minX = Math.min(minX, position.x - cardWidth / 2 - treeMargin);
      minY = Math.min(minY, position.y - cardHeight / 2 - treeMargin);
      maxX = Math.max(maxX, position.x + cardWidth / 2 + treeMargin);
      maxY = Math.max(maxY, position.y + cardHeight / 2 + treeMargin);
    }

    return {
      minX,
      minY,
      maxX,
      maxY,
      // The drawing starts at the origin, so the leading space counts towards
      // the size of the tree.
      width: maxX,
      height: maxY,
    };
  }, [modulePositions]);
}
