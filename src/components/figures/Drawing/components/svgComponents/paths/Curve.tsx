import { SvgPortal } from '../../../DrawingContext';

import { Group } from '../Group';

import { type CurvePropsWithoutArrows, type CurveProps } from './types';
import { ensurePathPoints, getCurvePathThrough, getCurvePathAlong, processCurveArrows } from './utils';
import { ArrowHead, resolveBooleanArrows } from './ArrowHead';
import { getDefaultLine, getDefaultLineStyle } from './Line';

export const getDefaultCurve = (): CurveProps => ({
	...getDefaultLine(),
	through: false,
	curveRatio: 1,
	curveDistance: undefined,
});

export const getDefaultCurveStyle = (props: CurveProps): React.CSSProperties => getDefaultLineStyle(props);

function CurveWithoutArrowHead(props: CurvePropsWithoutArrows) {
	const { ref, points, close, size, color, through, curveRatio, curveDistance, style, ...rest } = { ...getDefaultCurve(), ...props };

	const p = ensurePathPoints(points);
	const path = (through ? getCurvePathThrough : getCurvePathAlong)(p, close, curveRatio, curveDistance);

	return <SvgPortal>
		<path ref={ref} d={path} style={{
			...getDefaultCurveStyle(props),
			...style,
		}} {...rest} />
	</SvgPortal>;
}

export function Curve(props: CurveProps) {
	// Extract arrow definitions.
	const { arrow, startArrow, endArrow, ...restProps } = props;
	const startArrowDef = resolveBooleanArrows(startArrow) || resolveBooleanArrows(arrow);
	const endArrowDef = resolveBooleanArrows(endArrow) || resolveBooleanArrows(arrow);

	// If there are no arrows, render the curve directly.
	if (!startArrowDef && !endArrowDef)
		return <CurveWithoutArrowHead {...restProps} />;

	// Merge props and preprocess the points for arrow placement.
	const curveWithoutArrowProps = { ...getDefaultCurve(), ...restProps } as CurvePropsWithoutArrows;
	const { points, startArrow: sArrow, endArrow: eArrow } = processCurveArrows(curveWithoutArrowProps, startArrowDef, endArrowDef);

	// Render the curve with arrow heads.
	return <Group ref={curveWithoutArrowProps.ref}>
		<CurveWithoutArrowHead {...{ ...curveWithoutArrowProps, ref: undefined, points }} />
		{startArrowDef && <ArrowHead {...sArrow} />}
		{endArrowDef && <ArrowHead {...eArrow} />}
	</Group>;
}
