import { mod, firstOf, lastOf, repeat, type VectorInput, Vector, ensureVectorArray, Span } from '@/utils';

import { type ArrowHeadProps, type LinePropsWithoutArrows, type CurvePropsWithoutArrows } from './types';
import { defaultArrowHeadPullIn } from './ArrowHead';

// Make sure that the given set of points are Vectors and satisfy basic properties.
export function ensurePathPoints(points: VectorInput[]): Vector[] {
	const pRaw = ensureVectorArray(points, 2);
	const p = pRaw.filter((point, index) => index === 0 || !point.equals(points[index - 1]));
	if (p.length < 2)
		throw new Error(`Invalid path points: need at least two unique points.`);
	return p;
}

// Generate a line path from an array of points. `close` indicates whether the path should be closed.
export function getLinePath(points: Vector[], close = false): string {
	return `M${points.map(getPointSvg).join(' L')}${close ? ' Z' : ''}`;
}

// Generate an SVG arc path. Mathematical notation is used for the angles: the right (point [1, 0]) is taken as zero and clockwise is taken as positive.
export function getArcPath(center: Vector, radius: number, startAngle: number, endAngle: number): string {
	const start = center.add(Vector.fromPolar(radius, startAngle));
	const end = center.add(Vector.fromPolar(radius, endAngle));
	const largeArcFlag = Math.abs(endAngle - startAngle) <= Math.PI ? '0' : '1';
	const sweepFlag = endAngle < startAngle ? '0' : '1';
	return `M${start.x} ${start.y} A${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`;
}

// Generate a smooth curve path that goes along the points (does not necessarily pass through them).
export function getCurvePathAlong(points: Vector[], close = false, curveRatio = 0, curveDistance?: number): string {
	// Filter duplicates.
	points = points.filter((point, index) => index === 0 || !point.equals(points[index - 1]));
	if (points.length < 2)
		throw new Error(`Invalid path points: need at least two unique points.`);

	// Close path if needed.
	if (close && !firstOf(points)!.equals(lastOf(points)!))
		points = [...points, firstOf(points)!];

	// Calculate in-between line parts.
	const lines: [Vector, Vector][] = repeat(points.length - 1, index => {
		const start = points[index];
		const end = points[index + 1];

		// Use distances to find line start/end. Ensure equal distance.
		if (curveDistance !== undefined) {
			const distance = start.subtract(end).magnitude;
			const maxFactor = close || (index > 0 && index < points.length - 2) ? 0.5 : 1;
			const factor = Math.min(curveDistance / distance, maxFactor);
			return [start.interpolate(end, factor), end.interpolate(start, factor)];
		}

		// Use ratios to find line start/end. Ratio factors may differ. Use 0.9 maximum in case of arrow-heads.
		const factor1 = curveRatio * (!close && index === points.length - 2 ? 0.9 : 0.5);
		const factor2 = curveRatio * (!close && index === 0 ? 0.9 : 0.5);
		return [start.interpolate(end, factor1), end.interpolate(start, factor2)];
	});

	// Fix the first and last points for non-closed curves.
	if (!close) {
		lines[0][0] = firstOf(points)!;
		lines[lines.length - 1][1] = lastOf(points)!;
	}

	// Construct the SVG path.
	let svg = `M${getPointSvg(firstOf(lines)![0])}`;
	repeat(lines.length, index => {
		const line = lines[index];
		const lineSvg = `L${getPointSvg(line[1])}`;
		if (index === lines.length - 1 && !close) {
			svg += lineSvg;
			return;
		}
		const cornerPoint = points[index + 1];
		const nextLine = lines[(index + 1) % lines.length];
		const curveSvg = `Q${getPointSvg(cornerPoint)} ${getPointSvg(nextLine[0])}`;
		svg += `${lineSvg}${curveSvg}`;
	});
	return svg;
}

// Generate a smooth curve path that passes through given points.
export function getCurvePathThrough(points: Vector[], close = false, curveRatio = 0, curveDistance?: number): string {
	// Remove duplicates.
	points = points.filter((point, index) => index === 0 || !point.equals(points[index - 1]));
	if (points.length < 2)
		throw new Error(`Invalid path points: need at least two unique points.`);

	// Find control points for the paths.
	const controlPoints = getControlPoints(points, close, curveRatio, curveDistance);

	// Set up the path.
	let svg = `M${getPointSvg(firstOf(points)!)}`;
	repeat(points.length - (close ? 0 : 1), index => {
		const nextIndex = mod(index + 1, points.length);
		const cp1 = controlPoints[index][1];
		const cp2 = controlPoints[nextIndex][0];
		const endPoint = points[nextIndex];
		svg += `C${getPointSvg(cp1)} ${getPointSvg(cp2)} ${getPointSvg(endPoint)}`;
	});
	return svg;
}

// Get control points for a smooth curve through a set of points.
export function getControlPoints(points: Vector[], close = false, curveRatio = 0, curveDistance?: number): [Vector, Vector][] {
	return points.map((point, index) => {
		// Start/end points do not get control points.
		if (!close && (index === 0 || index === points.length - 1))
			return [point, point];

		// Find the control direction: the direction in which the forward-pointing control point must be positioned.
		const prevPoint = points[mod(index - 1, points.length)];
		const nextPoint = points[mod(index + 1, points.length)];
		const prevRelative = prevPoint.subtract(point);
		const nextRelative = nextPoint.subtract(point);
		let controlDirection = nextRelative.normalize().subtract(prevRelative.normalize());

		// On a 180 turn back, do not add control points.
		if (controlDirection.magnitude === 0)
			return [point, point];
		controlDirection = controlDirection.normalize();

		// Use distances to find the control points.
		if (curveDistance !== undefined) {
			const relativeControlPoint = controlDirection.multiply(curveDistance);
			return [point.subtract(relativeControlPoint), point.add(relativeControlPoint)];
		}

		// Use ratios to find the control points.
		return [
			point.add(prevRelative.getProjectionOn(controlDirection).multiply(curveRatio / 2)),
			point.add(nextRelative.getProjectionOn(controlDirection).multiply(curveRatio / 2)),
		];
	});
}

// Prepare arrow heads and points for Line or Curve components.
export function processCurveArrows(
	props: LinePropsWithoutArrows | CurvePropsWithoutArrows,
	startArrow?: ArrowHeadProps,
	endArrow?: ArrowHeadProps,
	arrowHeadPullIn = defaultArrowHeadPullIn,
): { points: Vector[]; startArrow?: ArrowHeadProps; endArrow?: ArrowHeadProps } {
	// Extract/check input.
	const { points, size, color, close, through, curveRatio, curveDistance } = props as CurvePropsWithoutArrows;
	let p = ensurePathPoints(points);
	if (curveRatio !== undefined && curveDistance !== undefined)
		throw new Error(`Invalid path input: cannot define both curveRatio and curveDistance.`);

	// Find control points to aim for, for the given settings.
	const controlPoints = through ? getControlPoints(p, close, curveRatio, curveDistance) : points.map(p => [p, p]);

	// For each arrow, determine the position/angle, and pull the line end-point into the arrow head.
	if (startArrow) {
		const startSpan = new Span(firstOf(controlPoints, 1)![0], firstOf(points)!);
		startArrow = { position: startSpan.end, angle: startSpan.angle, size, color, ...startArrow };
		const lineStart = startSpan.end.subtract(startSpan.vector.normalize().multiply(arrowHeadPullIn * startArrow.size!));
		p = [lineStart, ...p.slice(1)];
	}
	if (endArrow) {
		const endSpan = new Span(lastOf(controlPoints, 1)![1], lastOf(points)!);
		endArrow = { position: endSpan.end, angle: endSpan.angle, size, color, ...endArrow };
		const lineEnd = endSpan.end.subtract(endSpan.vector.normalize().multiply(arrowHeadPullIn * endArrow.size!));
		p = [...p.slice(0, -1), lineEnd];
	}
	return { points: p, startArrow, endArrow };
}

// Convert a Vector point to an SVG point string.
export function getPointSvg(point: Vector): string {
	return `${point.x} ${point.y}`;
}
