declare module '@/components/styling/settings.js' {
  export const themeColor: string;
}

declare module '@/components/figures/Drawing' {
  export const Drawing: any;
  export const Element: any;
  export const Rectangle: any;
  export const Curve: any;
  export function useTextNodeBounds(
    element: HTMLElement | null | undefined,
    condition: unknown,
    drawingRef?: unknown,
    index?: number,
  ): any;
}

declare module 'assets/glyphs' {
  export const glyphCircle: any;
  export const glyphSquare: any;
  export const glyphTriangle: any;
  export const glyphDiamond: any;
  export const glyphStar: any;
  export const glyphCross: any;
  export const glyphPlus: any;
  export const glyphMinus: any;
  export const glyphCheck: any;
  export const glyphX: any;
  export const glyphDot: any;
  export const glyphBar: any;
  export const glyphArrow: any;
  export const glyphChevron: any;
  export const glyphCaret: any;
  export const glyphCircleThin: any;
  export const glyphSquareThin: any;
  export const glyphTriangleThin: any;
  export const glyphDiamondThin: any;
  export const glyphStarThin: any;
  export const glyphCrossThin: any;
  export const glyphPlusThin: any;
  export const glyphMinusThin: any;
  export const glyphCheckThin: any;
  export const glyphXThin: any;
  export const glyphDotThin: any;
  export const glyphBarThin: any;
  export const glyphArrowThin: any;
  export const glyphChevronThin: any;
  export const glyphCaretThin: any;
  export const glyphCircleFilled: any;
  export const glyphSquareFilled: any;
  export const glyphTriangleFilled: any;
  export const glyphDiamondFilled: any;
  export const glyphStarFilled: any;
  export const glyphCrossFilled: any;
  export const glyphPlusFilled: any;
  export const glyphMinusFilled: any;
  export const glyphCheckFilled: any;
  export const glyphXFilled: any;
  export const glyphDotFilled: any;
  export const glyphBarFilled: any;
  export const glyphArrowFilled: any;
  export const glyphChevronFilled: any;
  export const glyphCaretFilled: any;
  const glyphs: Record<string, any>;
  export default glyphs;
}

declare module 'components' {
  export const SQL: any;
  export const themeColor: string;
}
