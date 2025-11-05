import { Vector, ensureVector } from '@/utils';

import { SvgPortal } from '../../../DrawingContext';

import { DefaultObjectProps, getDefaultObject } from '../definitions';

export interface ArrowHeadProps extends DefaultObjectProps<SVGPolygonElement> {
	position?: Vector;
	angle?: number;
	size?: number;
	color?: string;
}

export const getDefaultArrowHead = (): ArrowHeadProps => ({
	...getDefaultObject<SVGPolygonElement>(),
	position: Vector.zero,
	angle: 0,
	size: 2,
	color: 'black',
});

export const defaultArrowHeadPullIn = 3; // This is the number of pixelsthat line should be pulled in (for a size 1 ArrowHead) to make sure the line ends in the proper place in the arrow head.

export function ArrowHead(props: ArrowHeadProps) {
	const { ref, position, angle, size, color, className, style, ...rest } = { ...getDefaultArrowHead(), ...props };
	const p = ensureVector(position, 2);

	return <SvgPortal>
		<polygon ref={ref} points="0 0, -12 -6, -9 0, -12 6" className={className} style={{
			strokeWidth: 0,
			fill: color,
			...style,
			transform: `translate(${p.x}px, ${p.y}px) rotate(${angle! * 180 / Math.PI}deg) scale(${size! / 2}) ${style?.transform ?? ''}`,
		}} {...rest} />
	</SvgPortal>;
};

export function resolveArrowProps(arrowProps?: Partial<ArrowHeadProps> | boolean): ArrowHeadProps | undefined {
	if (!arrowProps)
		return undefined;
	if (arrowProps === true)
		return getDefaultArrowHead();
	return { ...getDefaultArrowHead(), ...arrowProps };
}
