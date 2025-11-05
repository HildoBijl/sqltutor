import { type RectangleInput, Rectangle as GeometryRectangle, ensureRectangle } from '@/utils';

import { SvgPortal } from '../../../DrawingContext';

import { type DefaultObjectProps, getDefaultObject } from '../definitions';

export interface RectangleProps extends DefaultObjectProps<SVGRectElement> {
	dimensions: RectangleInput;
	cornerRadius?: number;
}

export const getDefaultRectangle = (): RectangleProps => ({
	...getDefaultObject<SVGRectElement>(),
	dimensions: GeometryRectangle.zero,
	cornerRadius: 0,
});

export function Rectangle(props: RectangleProps) {
	const { ref, dimensions, cornerRadius, ...rest } = { ...getDefaultRectangle(), ...props };
	const rect = ensureRectangle(dimensions, 2).normalize();
	const { start, vector } = rect;

	return <SvgPortal>
		<rect ref={ref} x={start.x} y={start.y} width={vector.x} height={vector.y} rx={cornerRadius} {...rest} />
	</SvgPortal>;
}
