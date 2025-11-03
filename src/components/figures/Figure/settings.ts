import { CSSProperties, ReactNode, Ref } from 'react';

export interface FigureOptions {
  aspectRatio?: number; // Height divided by width.
  maxWidth?: number; // Max width in pixels. (undefined means scale to full width.)
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  ref?: Ref<FigureRef>; // Optional external ref
}

export interface FigureRef {
  inner: HTMLDivElement | null;
  outer: HTMLDivElement | null;
}

export const defaultFigureOptions: FigureOptions = {
  aspectRatio: 0.75,
  maxWidth: undefined,
  className: '',
  style: {},
  children: null,
  ref: undefined,
};
