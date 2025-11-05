import { Vector, ensureVector, type VectorInput, type VectorSO, isCoordinates } from './Vector'
import { Line, ensureLine, type LineInput } from './Line'

export type SpanObjectDefinition =
	| { start: VectorInput; end: VectorInput; vector?: undefined }
	| { start: VectorInput; vector: VectorInput; end?: undefined }
	| { end: VectorInput; vector: VectorInput; start?: undefined };
export type SpanArrayDefinition = [VectorInput, VectorInput]; // [start, end]
export type SpanDefinition = SpanObjectDefinition | SpanArrayDefinition;
export type SpanInput = SpanDefinition | Span;
export interface SpanSO {
	start: VectorSO;
	end: VectorSO;
}

export class Span {
	public readonly start: Vector;
	public readonly end: Vector;

	/*
	 * Creation methods.
	 */

	constructor(span: SpanInput);
	constructor(start: VectorInput, end: VectorInput);
	constructor(span: SpanInput | VectorInput, endInput?: VectorInput) {
		// If a second parameter is given, there should be two vectors.
		if (endInput !== undefined) {
			this.start = ensureVector(span as VectorInput);
			this.end = ensureVector(endInput, this.start.dimension);
			return;
		}

		// If already a Span, return it as-is.
		if (span instanceof Span) {
			this.start = span.start;
			this.end = span.end;
			return;
		}

		// If it's an array, we have a start and end.
		if (Array.isArray(span)) {
			if (span.length !== 2)
				throw new Error(`Invalid Span: Expected [start, end] tuple`);
			this.start = ensureVector(span[0]);
			this.end = ensureVector(span[1], this.start.dimension);
			return;
		}

		// If it's an object, process it accordingly.
		const { start, end, vector } = span as SpanObjectDefinition;
		const definedProps = [start, end, vector].filter(v => v !== undefined);
		if (definedProps.length !== 2)
			throw new Error(`Span definition requires exactly two of {start, end, vector}`);
		if (start && end) {
			this.start = ensureVector(start);
			this.end = ensureVector(end, this.start.dimension);
			return;
		}
		if (start && vector) {
			this.start = ensureVector(start);
			this.end = this.start.add(ensureVector(vector, this.start.dimension));
			return;
		}
		if (end && vector) {
			this.end = ensureVector(end);
			this.start = this.end.subtract(ensureVector(vector, this.end.dimension));
			return;
		}

		// No valid case is found.
		throw new Error(`Span definition requires two of {start, end, vector}`);
	}

	get SO(): SpanSO {
		return {
			start: this.start.SO,
			end: this.end.SO,
		}
	}

	get type(): string {
		return 'Span';
	}

	/*
	 * Derived properties.
	 */

	get dimension(): number {
		return this.start.dimension;
	}

	get vector(): Vector {
		return this.end.subtract(this.start);
	}

	get str(): string {
		return this.toString();
	}

	toString(): string {
		return `Span({ start: ${this.start}, vector: ${this.vector}, end: ${this.end} })`;
	}

	get line() {
		const vector = this.vector;
		if (vector.isZero())
			throw new Error(`Invalid line request: cannot give the line of a Span with zero magnitude.`);
		return new Line(this.start, vector);
	}

	get middle(): Vector {
		return this.start.interpolate(this.end);
	}

	get angle(): number {
		return this.line.angle;
	}

	/*
	 * Manipulation and calculation methods.
	 */

	// Turn the Span around, making it go from end to start.
	reverse(): Span {
		return new Span(this.end, this.start);
	}

	// Add/subtract a vector to the start and end vectors of the Span, effectively shifting the span.
	add(vector: VectorInput): Span {
		const v = ensureVector(vector, this.dimension);
		return new Span(this.start.add(v), this.end.add(v));
	}
	subtract(vector: VectorInput): Span {
		const v = ensureVector(vector, this.dimension);
		return new Span(this.start.subtract(v), this.end.subtract(v));
	}

	/*
	 * Comparison methods.
	 */

	// Run an equality check.
	equals(span: SpanInput, allowReverse = false): boolean {
		const s = ensureSpan(span);
		if (this.start.equals(s.start) && this.end.equals(s.end))
			return true;
		if (allowReverse && this.equals(s.reverse()))
			return true;
		return false;
	}

	// Check if the two Spans are along the same line. (Special case: two zero Spans are always along the same line.)
	alongEqualLine(span: SpanInput, requireSameDirection = false, requireMatchingPoint = false): boolean {
		const s = ensureSpan(span, this.dimension);
		if (requireMatchingPoint && !this.hasMatchingPoint(span))
			return false;
		if (this.vector.isZero()) {
			if (s.vector.isZero())
				return true;
			return this.isAlongLine(s.line, requireSameDirection);
		}
		return this.isAlongLine(s.line, requireSameDirection);
	}

	// Check if this Span is perpendicular to the given Span. Only the direction of the vector is considered.
	isPerpendicular(span: SpanInput): boolean {
		const s = ensureSpan(span, this.dimension);
		return this.vector.isPerpendicular(s.vector);
	}

	// Check if this Span is along the given Line.
	isAlongLine(line: LineInput, requireSameDirection = false): boolean {
		const l = ensureLine(line, this.dimension);
		if (this.vector.isZero())
			return !requireSameDirection && l.containsPoint(this.start);
		return this.line.equals(l, requireSameDirection);
	}

	// Check if this Span has one of its endpoints at the given point.
	hasPoint(point: VectorInput): boolean {
		const vector = ensureVector(point, this.dimension);
		return this.start.equals(vector) || this.end.equals(vector);
	}

	// Check if the two Spans have a point (start or end) in common, checking all four combinations.
	hasMatchingPoint(span: SpanInput): boolean {
		const s = ensureSpan(span, this.dimension);
		return this.hasPoint(s.start) || this.hasPoint(s.end);
	}
}

// Turn the given parameter is a Span object, or die trying. Optionally, a dimension may be given which is then checked too.
export function ensureSpan(input: SpanInput, dimension?: number): Span {
	const span = new Span(input);
	if (dimension !== undefined && span.dimension !== dimension)
		throw new Error(`Invalid Span dimension: expected ${dimension}D, got ${span.dimension}D.`);
	return span
}

// Check that the given value is a definition of a Span.
export function isSpanDefinition(value: unknown): value is SpanDefinition {
	// Case 1: Tuple form [start, end].
	if (Array.isArray(value) && value.length === 2) {
		const [start, end] = value;
		return (start instanceof Vector || isCoordinates(start)) && (end instanceof Vector || isCoordinates(end));
	}

	// Case 2: Object form with any two of the three properties (start, end, vector).
	if (typeof value === 'object' && value !== null) {
		const obj = value as Record<string, unknown>;
		const { start, end, vector } = obj;

		// There must be two parameters.
		const count = [start, end, vector].filter(v => v !== undefined).length;
		if (count !== 2)
			return false;

		const isValid = (vector: unknown) => vector !== undefined && (vector instanceof Vector || isCoordinates(vector));
		if (start !== undefined && !isValid(start))
			return false;
		if (end !== undefined && !isValid(end))
			return false;
		if (vector !== undefined && !isValid(vector))
			return false;
		return true
	}

	// None of the cases apply.
	return false;
}
