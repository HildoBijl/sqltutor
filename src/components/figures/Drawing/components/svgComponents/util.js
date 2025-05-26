import { mod, firstOf, lastOf, repeat, filterProperties, Vector, useEnsureRef, useEventListeners } from 'util'

// Define event handlers that objects can use.
export const defaultEventHandlers = {}
const eventHandlers = ['mouseenter', 'mouseleave', 'click', 'mousedown', 'mouseup']
eventHandlers.forEach(name => { defaultEventHandlers[name] = undefined })
export const filterEventHandlers = (options) => filterProperties(options, eventHandlers)
export const useRefWithEventHandlers = (props, ref) => {
	ref = useEnsureRef(ref)
	const handlers = filterEventHandlers(props)
	useEventListeners(handlers, ref)
	return ref
}

// These are the parameters inherited by all object types.
export const defaultObject = {
	...defaultEventHandlers,
	type: undefined,
	ref: undefined,
	className: '',
	style: {},
}

// getPointSvg takes a point and displays its coordinates.
export function getPointSvg(point) {
	return `${point.x} ${point.y}`
}

// getLinePath takes an array of points and turns it into an SVG line string.
export function getLinePath(points, close) {
	return `M${points.map(getPointSvg).join(' L')}${close ? ' Z' : ''}`
}

// getCurvePathAlong takes an array of points and turns it into an SVG curve string by smoothly going along (but not through) the points.
export function getCurvePathAlong(points, close, part, spread) {
	// Filter out duplicate points.
	points = points.filter((point, index) => index === 0 || !point.equals(points[index - 1]))

	// On a closed path, add the start to the end of the points list.
	if (close && !firstOf(points).equals(lastOf(points)))
		points = [...points, firstOf(points)]

	// Walk through the line segments and get the connecting points.
	const lines = repeat(points.length - 1, index => {
		const start = points[index]
		const end = points[index + 1]
		if (spread !== undefined) {
			const distance = start.subtract(end).magnitude
			const factor = Math.min(spread / distance, 0.5)
			return [start.interpolate(end, factor), end.interpolate(start, factor)]
		}
		return [start.interpolate(end, part / 2), end.interpolate(start, part / 2)]
	})

	// For a non-closed curve, ensure that the first and last points are the starting and ending points.
	if (!close) {
		lines[0][0] = firstOf(points)
		lines[lines.length - 1][1] = lastOf(points)
	}

	// Walk through the line segments and set up SVG.
	let svg = `M${getPointSvg(firstOf(lines)[0])}`
	repeat(lines.length, index => {
		// Set up the SVG for the line. If this is the last line segment, return it.
		const line = lines[index]
		const lineSvg = `L${getPointSvg(line[1])}` // Line to the end.
		if (index === lines.length - 1 && !close) {
			svg += lineSvg
			return
		}

		// Merge together with the SVG for the subsequent curve.
		const cornerPoint = points[index + 1]
		const nextLine = lines[(index + 1) % lines.length]
		const curveSvg = `Q${getPointSvg(cornerPoint)} ${getPointSvg(nextLine[0])}`
		svg += `${lineSvg}${curveSvg}`
	})
	return svg
}

// getCurvePathThrough takes an array of points and turns it into an SVG curve string by smoothly going through the points.
export function getCurvePathThrough(points, close, part, spread) {
	// Filter out duplicate points.
	points = points.filter((point, index) => index === 0 || !point.equals(points[index - 1]))

	// For each point, calculate control points.
	const controlPoints = points.map((point, index) => {
		// For the starting/ending point, do not add control points.
		if (!close && (index === 0 || index === points.length - 1))
			return [point, point]

		// Find the control direction: the direction which the forward-pointing control point must be positioned.
		const prevPoint = points[mod(index - 1, points.length)]
		const nextPoint = points[mod(index + 1, points.length)]
		const prevRelative = prevPoint.subtract(point)
		const nextRelative = nextPoint.subtract(point)
		let controlDirection = nextRelative.normalize().subtract(prevRelative.normalize())

		// Check a special case: there's a 180 degree angle.
		if (controlDirection.magnitude === 0)
			return [point, point]
		controlDirection = controlDirection.normalize()

		// On a spread, apply the control points with the given distance.
		if (spread !== undefined) {
			const relativeControlPoint = controlDirection.multiply(spread)
			return [point.subtract(relativeControlPoint), point.add(relativeControlPoint)]
		}

		// On a part, project the relative vector onto the control direction vector.
		return [point.add(prevRelative.getProjectionOn(controlDirection).multiply(part / 2)), point.add(nextRelative.getProjectionOn(controlDirection).multiply(part / 2))]
	})

	// Apply the control points: walk through the line segments and use them one by one.
	let svg = `M${getPointSvg(firstOf(points))}`
	repeat(points.length - (close ? 0 : 1), index => {
		const nextIndex = mod(index + 1, points.length)
		const controlPoint1 = controlPoints[index][1]
		const controlPoint2 = controlPoints[nextIndex][0]
		const endPoint = points[nextIndex]
		svg += `C${getPointSvg(controlPoint1)} ${getPointSvg(controlPoint2)} ${getPointSvg(endPoint)}`
	})
	return svg
}

// getArcPath takes a circle center (a Vector), a radius, a start angle and an end angle, and gives the SVG path string that makes this path. For angles, mathematical notation is used: the right (point [1, 0]) is taken as zero and clockwise is taken as positive.
export function getArcPath(center, radius, startAngle, endAngle) {
	// Determine arc start and end.
	const start = center.add(Vector.fromPolar(radius, startAngle))
	const end = center.add(Vector.fromPolar(radius, endAngle))

	// Determine the flags needed by SVG.
	const largeArcFlag = Math.abs(endAngle - startAngle) <= Math.PI ? '0' : '1'
	const sweepFlag = endAngle < startAngle ? '0' : '1'

	// Set up the path.
	return `M${start.x} ${start.y} A${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`
}
