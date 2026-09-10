import { type VectorLike as VectorInput, Vector, ensureVector } from '@step-wise/geometry';

import { SvgPortal } from '../../../DrawingContext';

import { type DefaultObjectProps, getDefaultObject } from '../definitions';

export interface TextProps extends DefaultObjectProps<SVGTextElement> {
  position?: VectorInput;
  anchor?: 'start' | 'middle' | 'end';
  children: string;
}

export const getDefaultText = (): TextProps => ({
  ...getDefaultObject<SVGTextElement>(),
  position: Vector.zero,
  anchor: 'middle', // Can be start, middle or end; see the text-anchor SVG parameter.
  children: '',
});

export function Text(props: TextProps) {
  const { ref, position, anchor, children, ...rest } = { ...getDefaultText(), ...props };
  const p = ensureVector(position, { dimension: 2 });

  return <SvgPortal>
    <text ref={ref} x={p.x} y={p.y} textAnchor={anchor}      {...rest}>
      {children}
    </text>
  </SvgPortal>;
};
