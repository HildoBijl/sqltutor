import type { HTMLAttributes, Ref } from 'react';

export interface FigureData {
  inner: HTMLDivElement | null;
  outer: HTMLDivElement | null;
}

export interface FigureProps<TRef = FigureData> extends HTMLAttributes<HTMLDivElement> {
  aspectRatio?: number; // Height divided by width.
  maxWidth?: number; // Max width in pixels. (undefined means scale to full width.)
  innerProps?: HTMLAttributes<HTMLDivElement>; // Properties of the inner div.
  ref?: Ref<TRef>; // Optional external ref.
}

export const getDefaultFigure = (): FigureProps => ({
  aspectRatio: 0.75,
  innerProps: {},
});
