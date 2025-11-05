import { Vector } from '@/utils';

import { SvgPortal } from '../../../DrawingContext';

import { getDefaultObject } from '../definitions';
import { Group } from '../Group';

import { type LinePropsWithoutArrows, type LineProps } from './types';
import { ensurePathPoints, getLinePath, processCurveArrows } from './utils';
import { ArrowHead, resolveArrowProps } from './ArrowHead';

export const getDefaultLine = (): LineProps => ({
	...getDefaultObject<SVGPathElement>(),
	points: [Vector.zero],
	close: false,
	size: 2,
	color: 'black',
});

export const getDefaultLineStyle = (props: LineProps): React.CSSProperties => ({
	fill: 'none',
	stroke: props.color,
	strokeWidth: props.size,
});

function LineWithoutArrowHead(props: LineProps) {
	const { ref, points, close, size, color, style, ...rest } = { ...getDefaultLine(), ...props };

	const p = ensurePathPoints(points);
	const path = getLinePath(p, close);

	return <SvgPortal>
		<path ref={ref} d={path} style={{
			...getDefaultLineStyle(props),
			...style,
		}} {...rest} />
	</SvgPortal>;
}

export function Line(props: LineProps) {
	// Extract arrow definitions.
	const { arrow, startArrow, endArrow, ...restProps } = props;
	const startArrowDef = resolveArrowProps(startArrow) || resolveArrowProps(arrow);
	const endArrowDef = resolveArrowProps(endArrow) || resolveArrowProps(arrow);

	// If there are no arrows, render a simple path.
	if (!startArrowDef && !endArrowDef)
		return <LineWithoutArrowHead {...restProps} />;

	// Merge props and preprocess the points for arrow placement.
	const lineWithoutArrowProps = { ...getDefaultLine(), ...restProps } as LinePropsWithoutArrows;
	const { points, startArrow: sArrow, endArrow: eArrow } = processCurveArrows(lineWithoutArrowProps, startArrowDef, endArrowDef);

	return <Group ref={lineWithoutArrowProps.ref}>
		<LineWithoutArrowHead	{...{ ...lineWithoutArrowProps, ref: undefined, points }} />
		{startArrowDef && <ArrowHead {...sArrow} />}
		{endArrowDef && <ArrowHead {...eArrow} />}
	</Group>;
}
