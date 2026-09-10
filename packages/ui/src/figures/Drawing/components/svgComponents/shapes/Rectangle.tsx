import { type RectangleLike, type VectorLike, Rectangle as GeometryRectangle, Vector, ensureRectangle } from '@step-wise/geometry';

import { SvgPortal } from '../../../DrawingContext';

import { type DefaultObjectProps, getDefaultObject } from '../definitions';

type RectangleInput = RectangleLike | [VectorLike, VectorLike];

export interface RectangleProps extends DefaultObjectProps<SVGRectElement> {
	dimensions: RectangleInput;
	cornerRadius?: number;
}

export const getDefaultRectangle = (): RectangleProps => ({
	...getDefaultObject<SVGRectElement>(),
	dimensions: new GeometryRectangle(Vector.zero, Vector.zero),
	cornerRadius: 0,
});

export function Rectangle(props: RectangleProps) {
	const { ref, dimensions, cornerRadius, ...rest } = { ...getDefaultRectangle(), ...props };
	const rect = Array.isArray(dimensions)
		? new GeometryRectangle(dimensions[0], dimensions[1])
		: ensureRectangle(dimensions, { dimension: 2 });
	const { min, size } = rect;

	return <SvgPortal>
		<rect ref={ref} x={min.x} y={min.y} width={size.x} height={size.y} rx={cornerRadius} {...rest} />
	</SvgPortal>;
}
