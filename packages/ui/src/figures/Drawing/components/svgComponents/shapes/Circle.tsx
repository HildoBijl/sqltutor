import { type VectorLike as VectorInput, Vector, ensureVector } from '@step-wise/geometry';

import { SvgPortal } from '../../../DrawingContext';

import { type DefaultObjectProps, getDefaultObject } from '../definitions';

export interface CircleProps extends DefaultObjectProps<SVGCircleElement> {
  center?: VectorInput;
  radius?: number;
}

export const getDefaultCircle = (): CircleProps => ({
  ...getDefaultObject<SVGCircleElement>(),
  center: Vector.zero,
  radius: 0,
});

export function Circle(props: CircleProps) {
  const { ref, center, radius, ...rest } = { ...getDefaultCircle(), ...props };
  const c = ensureVector(center, { dimension: 2 });
  
  return <SvgPortal>
    <circle ref={ref} cx={c.x} cy={c.y} r={radius} {...rest} />
  </SvgPortal>;
};
