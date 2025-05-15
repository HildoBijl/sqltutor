import { ensureInt, ensureNumber, compareNumbers, processOptions } from 'util'

import { Vector, ensureVector } from './Vector'

const defaultLine = {
	start: undefined,
	direction: undefined,
}

export class Line {
	/*
	 * Creation methods.
	 */

	constructor(start, direction) {
		// If no direction is given, try to interpret the only given parameter.
		if (direction === undefined) {
			let line = start

			// On a line, just return it directly.
			if (line instanceof Line)
				return line

			// Ensure that we have an object.
			if (typeof line !== 'object')
				throw new Error(`Invalid Line: expected an object that could be turned into a Line, but received something of type "${typeof line}".`)

			// Extract the given parameters.
			line = processOptions(line, defaultLine)
			start = line.start
			direction = line.direction
		}

		// Check that the given parameters are valid and of equal dimension, and store them.
		this.start = ensureVector(start)
		this.direction = ensureVector(direction, this.start.dimension)
		if (this.direction.isZero())
			throw new Error(`Invalid Line direction: cannot accept a direction Vector with zero magnitude.`)
	}

	get SO() {
		return {
			start: this.start.SO,
			direction: this.direction.SO,
		}
	}

	get type() {
		return this.constructor.type
	}

	/*
	 * Getting and setting.
	 */

	get perpendicularVector() {
		return this.start.getPerpendicularComponent(this.direction)
	}

	get normalizedDirection() {
		return this.direction.normalize()
	}

	get angle() {
		if (this.dimension !== 2)
			throw new Error(`Invalid angle call: cannot retrieve the angle of a ${this.dimension}D line.`)
		return this.direction.argument
	}

	get distance() {
		return this.perpendicularVector.magnitude
	}

	get secondPoint() {
		return this.start.add(this.direction)
	}

	/*
	 * Derived properties.
	 */

	get dimension() {
		return this.start.dimension
	}

	get str() {
		return this.toString()
	}

	toString() {
		return `Line({ start: ${this.start}, direction: ${this.direction} })`
	}

	normalize() {
		return new Line(this.perpendicularVector, this.normalizedDirection)
	}

	reverse() {
		return new Line(this.start, this.direction.reverse())
	}

	/*
	 * Manipulation and computation methods.
	 */

	// transform will apply the given transformation.
	transform(transformation, ...args) {
		return Line.fromPoints(transformation.apply(this.start, ...args), transformation.apply(this.secondPoint, ...args))
	}

	// containsPoint checks if a given point (Vector) is on the given line. 
	containsPoint(vector) {
		vector = ensureVector(vector, this.dimension)

		// Find the vector relative to the line's start and check if it's in the right direction.
		const relativeVector = vector.subtract(this.start)
		return relativeVector.isZero() || compareNumbers(Math.abs(this.normalizedDirection.dotProduct(relativeVector.normalize())), 1)
	}

	// getClosestPoint finds the closest point on the line, with respect to the given vector.
	getClosestPoint(vector) {
		vector = ensureVector(vector, this.dimension)

		// Find the vector relative to the start, project it onto the direction, and then add the start again.
		const relativeVector = vector.subtract(this.start)
		const projection = relativeVector.getProjectionOn(this.direction)
		return this.start.add(projection)
	}

	// getSquaredDistanceFrom gives the squared distance from the line to a given point.
	getSquaredDistanceFrom(vector) {
		vector = ensureVector(vector, this.dimension)
		const closestPoint = this.getClosestPoint(vector)
		const difference = vector.subtract(closestPoint)
		return difference.squaredMagnitude
	}

	// getDistanceFrom gives the distance from the line to a given point.
	getDistanceFrom(vector) {
		return Math.sqrt(this.getSquaredDistanceFrom(vector))
	}

	// getDirectionFactor takes a point on a line, and finds the factor such that start + factor * direction = point. If the point is not on the line, the closest point on the line is taken.
	getDirectionFactor(vector) {
		const closestPoint = this.getClosestPoint(vector)
		const relativeVector = closestPoint.subtract(this.start)
		return relativeVector.magnitude / this.direction.magnitude
	}

	// getPointWithFactor gives the point on the line with position "start + factor * direction".
	getPointWithFactor(factor) {
		return this.start.add(this.direction.multiply(factor))
	}

	// getPointWithCoordinate takes an axis (0 for x, 1 for y, etcetera) and a value of this axis, and finds the point on the line having that coordinate. For instance, with parameters "axis = 1" and "value = 3" it finds the point on the line where y = 3.
	getPointWithCoordinate(axis, value) {
		const factor = this.getFactorOfPointWithCoordinate(axis, value)
		return this.getPointWithFactor(factor)
	}

	// getFactorOfPointWithCoordinate is the same as getPointWithCoordinates, but then it only returns the factor of the given point.
	getFactorOfPointWithCoordinate(axis, value) {
		axis = ensureInt(axis, true)
		value = ensureNumber(value)
		if (axis >= this.dimension)
			throw new Error(`Invalid axis: the axis (${axis}) cannot be higher than the dimension (${this.dimension}) of the line.`)

		// Check if the line is parallel to this axis.
		if (compareNumbers(this.direction.getCoordinate(axis), 0))
			throw new Error(`Invalid getPointWithCoordinate call: the line is parallel to the given axis (${axis}), so no intersecting point can be computed.`)

		// Find the factor by which we must multiply the direction Vector.
		return (value - this.start.getCoordinate(axis)) / this.direction.getCoordinate(axis)
	}

	// intersects checks if the line intersects with the given line. It returns true or false.
	intersects(line) {
		line = ensureLine(line, this.dimension)

		// Check a special case.
		if (this.dimension === 1)
			return true

		// Check if the intersection exists.
		return this.getIntersection(line) !== null
	}

	// getIntersection finds the intersection point of two lines. If this intersection does not exist, null is returned.
	getIntersection(line) {
		line = ensureLine(line, this.dimension)
		if (this.dimension === 1)
			throw new Error(`Invalid intersects call: two lines in one dimension intersect everywhere. Ensure that you do not have a one-dimensional case.`)

		// We want to solve the equation s1 + a*d1 = s2 + b*d2, for coefficients a and b. First check if such coefficients exist, or if the two lines are parallel.
		const d1 = this.direction
		const d2 = line.direction
		const determinant = d1.x * d2.y - d2.x * d1.y
		if (compareNumbers(determinant, 0))
			return null

		// Find the factors a and b required to satisfy s1 + a*d1 = s2 + b*d2.
		const delta = line.start.subtract(this.start) // s2 - s1
		const a = (delta.x * d2.y - delta.y * d2.x) / determinant
		// const b = (delta.x * d1.y - delta.y * d1.x) / determinant
		const intersection = this.start.add(this.direction.multiply(a))
		return this.containsPoint(intersection) ? intersection : null
	}

	/*
	 * Comparison methods.
	 */

	// equals runs an exact equality check on the full set-up.
	equals(line, requireSameDirection = false) {
		line = ensureLine(line, this.dimension)

		// Check the starting point of the lines.
		if (!this.perpendicularVector.equals(line.perpendicularVector))
			return false

		// Check the directions of the lines.
		const dotProduct = this.normalizedDirection.dotProduct(line.normalizedDirection)
		return compareNumbers(requireSameDirection ? dotProduct : Math.abs(dotProduct), 1)
	}

	// isPerpendicular checks if the lines are perpendicular. (They do not have to intersect.)
	isPerpendicular(line) {
		line = ensureLine(line, this.dimension)
		return this.direction.isPerpendicular(line.direction)
	}

	/*
	 * Static methods.
	 */

	// fromPoints gets a line that goes through two points (Vectors).
	static fromPoints(point1, point2) {
		point1 = ensureVector(point1)
		point2 = ensureVector(point2, point1.dimension)
		return new Line(point1, point2.subtract(point1))
	}

	// fromAngleAndDistance creates a 2D line with the given angle (argument) and the given distance from the origin. It is assumed that, after traveling the given distance, we turn a hard left to go into the given angle. So (Math.PI/2, 3) lets us go three steps to the right before we go straight up. Similarly, (Math.PI*3/2, 4) lets us go four steps to the left before going straight down.
	static fromAngleAndDistance(angle, distance) {
		return new Line(
			Vector.fromPolar(distance, angle - Math.PI / 2),
			Vector.fromPolar(1, angle),
		)
	}

	// fromPointAndAngle returns a line from the given point in the direction of the given angle. This only works for 2D points.
	static fromPointAndAngle(point, angle) {
		point = ensureVector(point, 2)
		return new Line(
			point,
			Vector.fromPolar(1, angle),
		)
	}

	// getAxisLineThrough takes a Vector (a point in space) and an axis (0 for x-axis, 1 for y-axis, etcetera) and gets the line through the given point along the given axis.
	static getAxisLineThrough(point, axis) {
		point = ensureVector(point)
		axis = ensureInt(axis)
		if (axis < 0 || axis >= point.dimension)
			throw new Error(`Invalid axis: expected a number between 0 (inclusive) and the point dimension ${point.dimension} (exclusive) but received ${axis}.`)

		// Get the direction vector and use it to set up a line.
		const direction = (new Array(point.dimension)).fill(0)
		direction[axis] = 1
		return new Line(point, new Vector(direction))
	}

	static getHorizontalThrough(point) {
		return Line.getAxisLineThrough(point, 0)
	}

	static getVerticalThrough(point) {
		return Line.getAxisLineThrough(point, 1)
	}
}
Line.type = 'Line'

// ensureLine turns the given line parameter into a Line object or dies trying. It can optionally also check for the given dimension.
export function ensureLine(line, dimension) {
	// Ensure that we have a Line.
	line = new Line(line)

	// If a required dimension is specified, check this.
	if (dimension !== undefined && line.dimension !== dimension)
		throw new Error(`Invalid Line dimension: expected a Line of dimension ${dimension} but received one of dimension ${line.dimension}.`)

	// All in order. Return the Line.
	return line
}
