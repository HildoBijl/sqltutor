import { ensureNumber, compareNumbers, boundTo, numberArray, findOptimumIndex, repeat } from 'util'

import { Vector, ensureVector } from './Vector'
import { Span, ensureSpan } from './Span'
import { ensureLine } from './Line'

export class Rectangle {
	/*
	 * Creation methods.
	 */

	constructor(rectangle) {
		if (rectangle instanceof Rectangle)
			return rectangle

		// Turn the data into a Span.
		this.span = ensureSpan(rectangle)
	}

	get SO() {
		return this.span.SO
	}

	get type() {
		return this.constructor.type
	}

	/*
	 * Getting and setting.
	 */

	get start() {
		return this.span.start
	}

	get vector() {
		return this.span.vector
	}

	get end() {
		return this.span.end
	}

	// No functions.

	/*
	 * Derived properties.
	 */

	get dimension() {
		return this.span.dimension
	}

	get str() {
		return this.toString()
	}

	toString() {
		return `Rectangle({ start: ${this.start}, end: ${this.end} })`
	}

	get line() {
		return this.span.line
	}

	// getBounds gives the bounds of this rectangle along a certain axis. It is sorted to ensure the lower value is mentioned first.
	getBounds(axis) {
		return ['start', 'end'].map(label => this[label].getCoordinate(axis)).sort((a, b) => a - b)
	}

	// bounds gives an array of bounds along each axis, with the minimum and the maximum value in a form [[xmin, xmax], [ymin, ymax], ...].
	get bounds() {
		return numberArray(0, this.dimension - 1).map(axis => this.getBounds(axis))
	}

	// getSize gives the size of this rectangle along a certain axis.
	getSize(axis) {
		const bound = this.getBounds(axis)
		return bound[1] - bound[0]
	}

	// size gives an array of sizes along each axis.
	get size() {
		return numberArray(0, this.dimension - 1).map(axis => this.getSize(axis))
	}

	// middle gives the vector that's exactly in the middle of the Rectangle.
	get middle() {
		return this.span.middle
	}

	// width, height and depth are the sizes in dimensions x, y and z.
	get width() {
		return this.getSize(0)
	}
	get height() {
		return this.getSize(1)
	}
	get depth() {
		return this.getSize(2)
	}

	// min and max are the smallest and largest values for each coordinate.
	get min() {
		return new Vector(this.start.coordinates.map((_, index) => Math.min(this.start.coordinates[index], this.end.coordinates[index])))
	}
	get max() {
		return new Vector(this.start.coordinates.map((_, index) => Math.max(this.start.coordinates[index], this.end.coordinates[index])))
	}

	// left, right, top and bottom are the four sides of the two-dimensional rectangle.
	get left() {
		return this.min.x
	}
	get right() {
		return this.max.x
	}
	get top() {
		return this.min.y
	}
	get bottom() {
		return this.max.y
	}

	// topLeft, topMiddle, topRight, rightMiddle, bottomRight, bottomMiddle, bottomLeft and leftMiddle are the vectors representing each of these points for the rectangle.
	get topLeft() {
		this.runNamedPointCheck()
		return this.min
	}
	get topMiddle() {
		this.runNamedPointCheck()
		return new Vector(this.middle.x, this.min.y)
	}
	get topRight() {
		this.runNamedPointCheck()
		return new Vector(this.max.x, this.min.y)
	}
	get middleRight() {
		this.runNamedPointCheck()
		return new Vector(this.max.x, this.middle.y)
	}
	get bottomRight() {
		this.runNamedPointCheck()
		return this.max
	}
	get bottomMiddle() {
		this.runNamedPointCheck()
		return new Vector(this.middle.x, this.max.y)
	}
	get bottomLeft() {
		this.runNamedPointCheck()
		return new Vector(this.min.x, this.max.y)
	}
	get middleLeft() {
		this.runNamedPointCheck()
		return new Vector(this.min.x, this.middle.y)
	}
	runNamedPointCheck() {
		if (this.dimension !== 2)
			throw new Error(`Invalid point request: cannot use named points (like top-left, bottom-right) for a ${this.dimension}D rectangle. This is only possible for 2D rectangles.`)
	}
	get leftTop() {
		return this.topLeft
	}
	get middleTop() {
		return this.topMiddle
	}
	get rightTop() {
		return this.topRight
	}
	get rightMiddle() {
		return this.middleRight
	}
	get rightBottom() {
		return this.bottomRight
	}
	get middleBottom() {
		return this.bottomMiddle
	}
	get leftBottom() {
		return this.bottomLeft
	}
	get leftMiddle() {
		return this.middleLeft
	}

	// getReferencePoint returns a point related on the given anchor. If given [0, 0] (or in whatever dimension the rectangle is) then the middle is returned. For [1, 1] the end is returned and for [-1, -1] the start is returned. Optionally, the useMinMax flag can be turned on, in which case [1, 1] is the max-point and [-1, -1] is the min-point.
	getReferencePoint(anchor, useMinMax = false) {
		anchor = ensureVector(anchor, this.dimension)
		const [start, end] = useMinMax ? [this.min, this.max] : [this.start, this.end]
		return new Vector(this.middle.coordinates.map((mid, index) => mid + anchor.coordinates[index] * (end.coordinates[index] - start.coordinates[index]) / 2))
	}

	/*
	 * Manipulation and calculation methods.
	 */

	// transform applies the given transformation.
	transform(transformation, ...args) {
		return new Rectangle(this.span.transform(transformation, ...args))
	}

	// contains checks if a vector (a point) falls within the rectangle.
	contains(vector) {
		vector = ensureVector(vector, this.dimension)
		return numberArray(0, this.dimension - 1).every(axis => {
			const vectorCoordinate = vector.getCoordinate(axis)
			const [min, max] = this.getBounds(axis)
			return vectorCoordinate >= min && vectorCoordinate <= max
		})
	}

	// applyBounds will make sure that a given vector falls within the rectangle. It returns a new vector that is guaranteed to lie within the rectangle. If a coordinate falls outside of the range, it is brought inside. If a coordinate falls inside the range, it stays the same, unless 'alwaysPutOnEdge' is set to true, in which case the point is always brought to the nearest point on the edge of the rectangle.
	applyBounds(vector, alwaysPutOnEdge = false) {
		vector = ensureVector(vector, this.dimension)
		if (!alwaysPutOnEdge || !this.contains(vector))
			return new Vector(vector.coordinates.map((coordinate, axis) => boundTo(coordinate, ...this.getBounds(axis))))

		// The point is inside the Rectangle and must be moved to the edge. Find the axis along which the shortest distance can be moved to reach the rectangle, and then along this axis find the bound that is closest to the given point.
		const distancesAlongAxes = vector.coordinates.map((coordinate, axis) => Math.min(...this.getBounds(axis).map(bound => Math.abs(bound - coordinate)))) // How far is the point away from the side if we move it along this axis?
		const shiftAxis = findOptimumIndex(distancesAlongAxes, (a, b) => a < b) // Along which axis should we move?
		return new Vector(vector.coordinates.map((coordinate, axis) => {
			if (axis !== shiftAxis)
				return coordinate
			const bounds = this.getBounds(axis)
			const distances = bounds.map(bound => Math.abs(bound - coordinate))
			const boundIndex = findOptimumIndex(distances, (a, b) => a < b)
			return bounds[boundIndex]
		}))
	}

	// getDistanceTo returns the distance of a point to this rectangle. A point inside the rectangle always has distance zero, unless toBounds is set to true, in which case the distance to the nearest bound is taken.
	getDistanceTo(vector, toBounds = false) {
		return this.applyBounds(vector, toBounds).subtract(vector).magnitude
	}

	// getLinePartFactors takes a line. It checks wich part of the line is within the rectangle. For this, it gives the lower and upper factor of the points on the line. If the line does not fall within the rectangle, undefined is returned.
	getLinePartFactors(line) {
		line = ensureLine(line, this.dimension)

		// Get the minimum and maximum factor of all the intersection points of the line with the box.
		let lower, upper
		repeat(this.dimension, axis => {
			// Special case: if the line is parallel to this axis, check if the given coordinate falls within the rectangle.
			if (compareNumbers(line.direction.getCoordinate(axis), 0)) {
				const coordinate = line.start.getCoordinate(axis)
				const bounds = this.getBounds(axis)
				if (coordinate < bounds[0] || coordinate > bounds[1]) {
					lower = Infinity
					upper = -Infinity
				}
				return
			}

			// Find the factors of the points at which the line intersects with the given coordinates.
			const factors = ['start', 'end'].map(label => line.getFactorOfPointWithCoordinate(axis, this[label].getCoordinate(axis))).sort((a, b) => a - b)

			// Update the minimum and maximum factor when appropriate.
			if (lower === undefined || factors[0] > lower)
				lower = factors[0]
			if (upper === undefined || factors[1] < upper)
				upper = factors[1]
		})

		// Check if the lower and upper limits are still sensible.
		if (upper < lower)
			return undefined
		return [lower, upper]
	}

	// getLinePart takes a line. It considers the current (this) Span as a rectangle (with start and end as corners, diagonally across) and checks which part of the line is inside the rectangle. It returns that part as a Span. It returns null on a line that's outside the given rectangle.
	getLinePart(line) {
		const linePartFactors = this.getLinePartFactors(line)
		return linePartFactors && new Span({
			start: line.getPointWithFactor(linePartFactors[0]),
			end: line.getPointWithFactor(linePartFactors[1]),
		})
	}

	// touchesSpan checks if a part of the span falls within or touches this rectangle. If 'contains' is set to true, then the entire span must fall within the rectangle.
	touchesSpan(span, contains = false) {
		// Examine the line through the span. If it doesn't go through the rectangle, return false.
		const linePartFactors = this.getLinePartFactors(span.line)
		if (!linePartFactors)
			return false

		// Check which part of the line falls within the rectangle.
		const [lower, upper] = linePartFactors
		return contains ?
			(lower >= 0 && upper <= 1) :
			(lower <= 1 && upper >= 0)
	}

	// touchesCircle checks if a part of the given circle falls within or touches this rectangle. If 'contains' is set to true, then it requires the circle to be fully inside the rectangle.
	touchesCircle(center, radius, contains = false) {
		center = ensureVector(center, this.dimension)
		radius = ensureNumber(radius, true)
		return contains ?
			this.contains(center) && this.getDistanceTo(center, true) >= radius :
			this.getDistanceTo(center) <= radius
	}

	/*
	 * Comparison methods.
	 */

	// equals runs an exact equality check on the full set-up.
	equals(rectangle) {
		rectangle = ensureRectangle(rectangle)
		return this.span.equals(rectangle.span)
	}

	/*
	 * Static methods.
	 */

	// None yet.
}
Rectangle.type = 'Rectangle'

// ensureRectangle ensures that the given parameter is a Rectangle object.
export function ensureRectangle(rectangle) {
	return new Rectangle(rectangle)
}
