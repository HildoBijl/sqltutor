import { Vector } from '@/utils';

import { SvgPortal } from '../../../DrawingContext';

import { getDefaultObject } from '../definitions';
import { Group } from '../Group';

import { type LineWithoutArrowsProps, type LineProps } from './types';
import { ensurePathPoints, getLinePath, processCurveArrows } from './utils';
import { ArrowHead, resolveBooleanArrows } from './ArrowHead';

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
	const { arrow, startArrow, endArrow, style, lineStyle, ...restProps } = props;
	const startArrowDef = resolveBooleanArrows(startArrow) || resolveBooleanArrows(arrow);
	const endArrowDef = resolveBooleanArrows(endArrow) || resolveBooleanArrows(arrow);

	// If there are no arrows, render the line directly.
	if (!startArrowDef && !endArrowDef)
		return <LineWithoutArrowHead {...restProps} style={{ ...(style ?? {}), ...(lineStyle ?? {}) }} />;

	// Merge props and preprocess the points for arrow placement.
	const lineWithoutArrowProps = { ...getDefaultLine(), ...restProps, style: lineStyle } as LineWithoutArrowsProps;
	const { points, startArrow: sArrow, endArrow: eArrow } = processCurveArrows(lineWithoutArrowProps, startArrowDef, endArrowDef);

	// Render the line with arrow heads.
	return <Group ref={lineWithoutArrowProps.ref} style={style}>
		<LineWithoutArrowHead	{...{ ...lineWithoutArrowProps, ref: undefined, points }} />
		{startArrowDef && <ArrowHead {...sArrow} />}
		{endArrowDef && <ArrowHead {...eArrow} />}
	</Group>;
}
