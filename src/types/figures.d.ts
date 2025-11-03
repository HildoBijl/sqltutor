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

declare module 'components' {
  export const SQL: any;
}
