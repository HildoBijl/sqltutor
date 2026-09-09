import { Vector } from '@sqlvalley/utils/geometry';
import { cardHeight, cardWidth, treeMargin } from './settings';

/*
 * Skill trees are laid out on a logical grid: each item is placed in a cell. Cells are 1-indexed,
 * so the top-left cell is { col: 1, row: 1 }.
 *
 * Fractional values are allowed and are the intended way to nudge a module
 * off the grid, ex: { col: 2.5 } sits exactly halfway between columns 2 and 3.
 */
export interface GridPosition {
  col: number;
  row: number;
}

// The distance between the centers of two neighbouring cells. Cells are
// spaced at 1.5x the card size.
export const columnSpacing = cardWidth * 1.5;
export const rowSpacing = cardHeight * 1.5;

/*
 * Convert a logical grid cell into the pixel position of the card's center,
 * which is the coordinate the renderer and the connector maths both expect.
 *
 * @param cell - The grid cell to place a module on.
 * @returns The pixel position of the center of that cell.
 */
export function gridToPixels({ col, row }: GridPosition): Vector {
  return new Vector(
    treeMargin + cardWidth / 2 + (col - 1) * columnSpacing,
    treeMargin + cardHeight / 2 + (row - 1) * rowSpacing,
  );
}
