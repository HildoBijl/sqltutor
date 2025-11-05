import { type VectorInput, Vector, ensureVector } from '@/utils';

import { useDrawingId, SvgPortal } from '../../DrawingContext';
import { type DefaultObjectProps, getDefaultObject } from './definitions';

export interface GroupProps extends DefaultObjectProps<SVGGElement> {
	position?: VectorInput;
	rotate?: number;
	scale?: number;
	overflow?: boolean;
	children?: React.ReactNode;
}

export const getDefaultGroup = (): GroupProps => ({
	...getDefaultObject<SVGGElement>(),
	position: Vector.zero,
	rotate: 0,
	scale: 1,
	overflow: true,
	children: null,
});

export function Group(props: GroupProps) {
	const { ref, position, rotate, scale, overflow, style, children, ...rest } = { ...getDefaultGroup(), ...props };
	const p = ensureVector(position, 2);
	const drawingId = useDrawingId();

	return <SvgPortal>
		<g ref={ref} style={{
			...style,
			clipPath: overflow ? undefined : `url(#noOverflow${drawingId})`,
			transform: `
				translate(${p.x}px, ${p.y}px)
				rotate(${(rotate ?? 0) * 180 / Math.PI}deg)
				scale(${scale})
				${style?.transform ?? ''}
			`,
		}} {...rest}>
			{children}
		</g>
	</SvgPortal>;
}
