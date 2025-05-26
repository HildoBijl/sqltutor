import { processOptions } from 'util'

import { ensureVector } from './Vector'
import { Line, ensureLine } from './Line'

const defaultSpan = {
	start: undefined,
	vector: undefined,
	end: undefined,
}

const pointNames = ['start', 'end']

export class Span {
	/*
	 * Creation methods.
	 */

	constructor(span) {
		// Check the input type.
		if (typeof span !== 'object')
			throw new Error(`Invalid Span value: expected to receive some kind of object, but instead received something of type "${typeof span}".`)

		// If it is already a span, keep it.
		if (span instanceof Span)
			return span

		// If it is an array of length two, use the two elements as start and end.
		if (Array.isArray(span) && span.length === 2)
			span = { start: span[0], end: span[1] }

		// Process the Span.
		span = processOptions(span, defaultSpan)
		if (!span.end) {
			this.start = ensureVector(span.start)
			this.vector = ensureVector(span.vector, this.start.dimension)
			this.end = this.start.add(this.vector)
		} else if (!span.start) {
			this.end = ensureVector(span.end)
			this.vector = ensureVector(span.vector, this.end.dimension)
			this.start = this.end.subtract(this.vector)
		} else {
			this.start = ensureVector(span.start)
			this.end = ensureVector(span.end, this.start.dimension)
			this.vector = this.end.subtract(this.start)
			if (span.vector && !this.vector.equals(span.vector))
				throw new Error(`Invalid Span: the given vector "${span.vector}" is not the difference between the start "${span.start}" and the end "${span.end}".`)
		}
	}

	get SO() {
		return {
			start: this.start.SO,
			end: this.end.SO,
		}
	}

	get type() {
		return this.constructor.type
	}

	/*
	 * Getting and setting.
	 */

	// No functions.

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
		return `Span({ start: ${this.start}, vector: ${this.vector}, end: ${this.end} })`
	}

	get line() {
		if (this.vector.isZero())
			throw new Error(`Invalid line request: cannot give the line of a Span with zero magnitude.`)
		return new Line(this.start, this.vector)
	}

	get middle() {
		return this.start.interpolate(this.end)
	}

	get angle() {
		return this.line.angle
	}

	/*
	 * Manipulation and calculation methods.
	 */

	// reverse turns the vector around, making it go from end to start.
	reverse() {
		return new Span({ start: this.end, end: this.start })
	}

	// round takes all coordinates and rounds them to the nearest value.
	round() {
		return new Span({ start: this.start.round(), end: this.end.round() })
	}

	// add and subtract will add/subtract a vector to the start and end vectors of the Span, effectively shifting the span.
	add(vector) {
		return new Span({ start: this.start.add(vector), end: this.end.add(vector) })
	}
	subtract(vector) {
		return new Span({ start: this.start.subtract(vector), end: this.end.subtract(vector) })
	}

	/*
	 * Comparison methods.
	 */

	// equals runs an exact equality check on the full set-up.
	equals(span, allowReverse = false) {
		if (this.start.equals(span.start) && this.end.equals(span.end))
			return true
		if (allowReverse && this.start.equals(span.end) && this.end.equals(span.start))
			return true
		return false
	}

	// alongEqualLine checks if the two Spans are along the same line. (Special case: two zero Spans are always along the same line.)
	alongEqualLine(span, requireSameDirection, requireMatchingPoint = false) {
		span = ensureSpan(span, this.dimension)

		// Check for an extra requirement.
		if (requireMatchingPoint && !this.hasMatchingPoint(span))
			return false

		// Check for zero vectors. If they are not around, take the line and check if the other Span is along it.
		if (span.vector.isZero()) {
			if (this.vector.isZero())
				return true
			return span.isAlongLine(this.line, requireSameDirection)
		}
		return this.isAlongLine(span.line, requireSameDirection)
	}

	// isPerpendicular checks if this Span is perpendicular to the given Span. Only the direction of the vector is considered.
	isPerpendicular(span) {
		span = ensureSpan(span, this.dimension)
		return this.vector.isPerpendicular(span.vector)
	}

	// isAlongLine checks if this Span is along the given Line.
	isAlongLine(line, requireSameDirection = false) {
		line = ensureLine(line, this.dimension)

		// Check for a zero vector, meaning this Span is a point. If so, there is no direction, so the direction is off anyway. If that's not important, check if the point is on the line.
		if (this.vector.isZero())
			return !requireSameDirection && line.containsPoint(this.start)

		// Compare lines.
		return this.line.equals(line, requireSameDirection)
	}

	// hasPoint checks if this Span has one of its endpoints at the given point.
	hasPoint(point) {
		point = ensureVector(point, this.dimension)
		return pointNames.some(pointName => this[pointName].equals(point))
	}

	// hasMatchingPoint checks if the two Spans have a point (start or end) in common, checking all four combinations.
	hasMatchingPoint(span) {
		span = ensureSpan(span, this.dimension)
		return pointNames.some(pointName => this.hasPoint(span[pointName]))
	}

	/*
	 * Static methods.
	 */

	// None yet.
}
Span.type = 'Span'

// ensureSpan ensures that the given parameter is a Span object. If not, it tries to turn it into one, or throws an error upon failure. Optionally, a dimension may be given which is then checked too.
export function ensureSpan(span, dimension) {
	// Ensure that we have a Span.
	span = new Span(span)

	// If a required dimension is specified, check this.
	if (dimension !== undefined && span.dimension !== dimension)
		throw new Error(`Invalid Span dimension: expected a Span of dimension ${dimension} but received one of dimension ${span.dimension}.`)

	// All in order.
	return span
}
