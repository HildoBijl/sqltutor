import { ensureInt, ensurePositive, compareNumbers, boundTo, findOptimum, findOptimumIndex, repeat } from '../javascript';
import { Vector, ensureVector, type VectorInput } from './Vector';
import { Span, ensureSpan, type SpanInput, type SpanSO } from './Span';
import { ensureLine, Line, type LineInput } from './Line';

export type RectangleInput = Rectangle | SpanInput;
export interface RectangleSO extends SpanSO { }

export class Rectangle {
	public readonly span: Span;

	/*
	 * Static properties.
	 */
	static zero = new Rectangle(Vector.zero, Vector.zero);

	/*
	 * Creation methods.
	 */

	constructor(rectangle: RectangleInput);
	constructor(start: VectorInput, end: VectorInput);
	constructor(arg1: Rectangle | SpanInput | VectorInput, arg2?: VectorInput) {
		// Case 1: Two points provided.
		if (arg2 !== undefined) {
			this.span = new Span(arg1 as VectorInput, arg2);
			return;
		}

		// Case 2: Already a Rectangle.
		if (arg1 instanceof Rectangle) {
			this.span = arg1.span;
			return;
		}

		// Case 3: SpanInput.
		this.span = ensureSpan(arg1 as SpanInput);
	}

	get SO(): RectangleSO {
		return this.span.SO;
	}

	get type(): string {
		return 'Rectangle';
	}

	/*
	 * Getting and setting.
	 */

	get start(): Vector {
		return this.span.start;
	}

	get vector(): Vector {
		return this.span.vector;
	}

	get end(): Vector {
		return this.span.end;
	}

	/*
	 * Derived properties.
	 */

	get dimension(): number {
		return this.span.dimension;
	}

	get line(): Line {
		return this.span.line;
	}

	get str(): string {
		return this.toString();
	}

	toString(): string {
		return `Rectangle({ start: ${this.start}, end: ${this.end} })`;
	}

	// Give the bounds of this rectangle along a certain axis. It is sorted to ensure the lower value is mentioned first.
	getBounds(axis: number): [number, number] {
		// Ensure axis is valid.
		const a = ensureInt(axis, true);
		if (a >= this.dimension)
			throw new Error(`Invalid axis: ${a}. Must be between 0 and ${this.dimension - 1}.`);

		// Set up the bounds.
		const bounds = [this.start, this.end].map(vector => vector.getCoordinate(a));
		return [Math.min(...bounds), Math.max(...bounds)];
	}

	// Give an array of bounds along each axis, with the minimum and the maximum value in a form [[xmin, xmax], [ymin, ymax], ...].
	get bounds(): [number, number][] {
		return repeat(this.dimension, axis => this.getBounds(axis));
	}

	// Give the size (width/height) of this rectangle along a certain axis.
	getSize(axis: number): number {
		const [min, max] = this.getBounds(axis);
		return max - min;
	}

	// Give an array of sizes along each axis.
	get size(): number[] {
		return repeat(this.dimension, axis => this.getSize(axis));
	}

	// Get the vector that's exactly in the middle of the Rectangle.
	get middle(): Vector {
		return this.span.middle;
	}

	// Get the size in dimensions x, y and z.
	get width(): number {
		return this.getSize(0);
	}
	get height(): number {
		return this.getSize(1);
	}
	get depth(): number {
		return this.getSize(2);
	}

	// Get the corner of the Rectangle with the smallest/largest value for each coordinate.
	get min(): Vector {
		return new Vector(this.start.coordinates.map((_, index) => Math.min(this.start.coordinates[index], this.end.coordinates[index])));
	}
	get max(): Vector {
		return new Vector(this.start.coordinates.map((_, index) => Math.max(this.start.coordinates[index], this.end.coordinates[index])));
	}

	// Get the rectangle with start being min and end being max.
	normalize(): Rectangle {
		return new Rectangle(this.min, this.max);
	}

	// left, right, top and bottom are the four sides of the two-dimensional rectangle.
	runNamedPointCheck() {
		if (this.dimension !== 2)
			throw new Error(`Invalid point request: cannot use named points (like left, top, top-left, bottom-right) for a ${this.dimension}D rectangle. This is only possible for 2D rectangles.`);
	}
	get left(): number {
		this.runNamedPointCheck();
		return this.min.x;
	}
	get right(): number {
		this.runNamedPointCheck();
		return this.max.x;
	}
	get top(): number {
		this.runNamedPointCheck();
		return this.min.y;
	}
	get bottom(): number {
		this.runNamedPointCheck();
		return this.max.y;
	}

	// topLeft, topMiddle, topRight, rightMiddle, bottomRight, bottomMiddle, bottomLeft and leftMiddle are the vectors representing each of these points for the rectangle.
	get topLeft(): Vector {
		this.runNamedPointCheck();
		return this.min;
	}
	get topMiddle(): Vector {
		this.runNamedPointCheck();
		return new Vector(this.middle.x, this.min.y);
	}
	get topRight(): Vector {
		this.runNamedPointCheck();
		return new Vector(this.max.x, this.min.y);
	}
	get middleRight(): Vector {
		this.runNamedPointCheck();
		return new Vector(this.max.x, this.middle.y);
	}
	get bottomRight(): Vector {
		this.runNamedPointCheck();
		return this.max;
	}
	get bottomMiddle(): Vector {
		this.runNamedPointCheck();
		return new Vector(this.middle.x, this.max.y);
	}
	get bottomLeft(): Vector {
		this.runNamedPointCheck();
		return new Vector(this.min.x, this.max.y);
	}
	get middleLeft(): Vector {
		this.runNamedPointCheck();
		return new Vector(this.min.x, this.middle.y);
	}
	get leftTop(): Vector {
		return this.topLeft;
	}
	get middleTop(): Vector {
		return this.topMiddle;
	}
	get rightTop(): Vector {
		return this.topRight;
	}
	get rightMiddle(): Vector {
		return this.middleRight;
	}
	get rightBottom(): Vector {
		return this.bottomRight;
	}
	get middleBottom(): Vector {
		return this.bottomMiddle;
	}
	get leftBottom(): Vector {
		return this.bottomLeft;
	}
	get leftMiddle(): Vector {
		return this.middleLeft;
	}

	// Find the point connected to the given anchor. If given [0, 0] (or in whatever dimension the rectangle is) then the middle is returned. For [1, 1] the end is returned and for [-1, -1] the start is returned. Optionally, the useMinMax flag can be turned on, in which case [1, 1] is the max-point and [-1, -1] is the min-point.
	getReferencePoint(anchor: VectorInput, useMinMax = false): Vector {
		// Process input data.
		const anchorVector = ensureVector(anchor, this.dimension);
		const { start, end } = useMinMax ? this.normalize() : this;

		// Set up the reference point.
		const coordinates = this.middle.coordinates.map((mid, index) => mid + anchorVector.coordinates[index] * (end.coordinates[index] - start.coordinates[index]) / 2);
		return new Vector(coordinates);
	}

	/*
	 * Manipulation and calculation methods.
	 */

	// Apply the given transformation.
	transform(...args: Parameters<Vector["transform"]>): Rectangle {
		return new Rectangle(this.start.transform(...args), this.end.transform(...args));
	}

	// Check if a vector (a point) falls within the rectangle.
	contains(vector: VectorInput): boolean {
		const v = ensureVector(vector, this.dimension);
		return this.bounds.every((bound, axis) => v.getCoordinate(axis) >= bound[0] && v.getCoordinate(axis) <= bound[1]);
	}

	// Bound a given vector to fall within the rectangle. It returns a new vector that is guaranteed to lie within the rectangle. If a coordinate falls outside of the range, it is brought inside. If a coordinate falls inside the range, it stays the same, unless 'alwaysPutOnEdge' is set to true, in which case the point is always brought to the nearest point on the edge of the rectangle.
	applyBounds(vector: VectorInput, alwaysPutOnEdge = false): Vector {
		const v = ensureVector(vector, this.dimension);

		// Handle the easy case where we don't forcefully put it on the edge.
		if (!alwaysPutOnEdge || !this.contains(v))
			return new Vector(v.coordinates.map((coord, axis) => boundTo(coord, ...this.getBounds(axis))));

		// The point is inside the Rectangle and must be moved to the edge. Find the axis along which the shortest distance can be moved to reach the rectangle, and then along this axis find the bound that is closest to the given point.
		const distancesAlongAxes = v.coordinates.map((coord, axis) => Math.min(...this.getBounds(axis).map(bound => Math.abs(bound - coord))));
		const shiftAxis = findOptimumIndex(distancesAlongAxes, (a, b) => a < b);

		// Set up a new Vector which, for the given axis, is shifted to the Rectangle.
		return new Vector(v.coordinates.map((coord, axis) => {
			if (axis !== shiftAxis)
				return coord;
			const distances = this.getBounds(axis).map(bound => Math.abs(bound - coord));
			return findOptimum(distances, (a, b) => a < b) as number;
		}));
	}

	// Find the distance of a point to this rectangle. A point inside the rectangle always has distance zero, unless toBounds is set to true, in which case the distance to the nearest bound is taken.
	getDistanceTo(vector: VectorInput, toBounds = false): number {
		const v = ensureVector(vector, this.dimension);
		return this.applyBounds(vector, toBounds).subtract(v).magnitude;
	}

	// Take a line and check wich part of the line is within the rectangle. Then return the factors for this line where it intersects the rectangle. If the line does not intersect the rectangle, undefined is returned.
	getLinePartFactors(line: LineInput): [number, number] | undefined {
		const l = ensureLine(line, this.dimension);

		// Get the minimum and maximum factor of all the intersection points of the line with the box.
		let lower: number | undefined;
		let upper: number | undefined;
		repeat(this.dimension, axis => {
			// Special case: if the line is parallel to this axis, check if the given coordinate falls within the rectangle.
			if (compareNumbers(l.direction.getCoordinate(axis), 0)) {
				const coord = l.start.getCoordinate(axis);
				const [min, max] = this.getBounds(axis);
				if (coord < min || coord > max) {
					lower = Infinity;
					upper = -Infinity;
				}
				return;
			}

			// Find the factors of the points at which the line intersects with the given coordinates.
			const factors = [this.start, this.end].map(corner => l.getFactorOfPointWithCoordinate(axis, corner.getCoordinate(axis))).sort((a, b) => a - b);
			if (lower === undefined || factors[0] > lower)
				lower = factors[0];
			if (upper === undefined || factors[1] < upper)
				upper = factors[1];
		});

		// Check if the lower and upper limits are still sensible.
		return upper! < lower! ? undefined : [lower!, upper!];
	}

	// getSpanWithin takes a line and finds which part of the line falls within the Rectangle. This Span is returned. It returns null on a line that's outside the given rectangle.
	getLinePart(line: LineInput): Span | null {
		const l = ensureLine(line, this.dimension);
		const factors = this.getLinePartFactors(l);
		if (!factors)
			return null;
		return new Span(l.getPointWithFactor(factors[0]), l.getPointWithFactor(factors[1]));
	}

	// Check if a span touches or lies within this rectangle. If 'contains' is set to true, then the entire span must fall within the rectangle.
	touchesSpan(span: SpanInput, contains = false): boolean {
		const s = ensureSpan(span, this.dimension);
		const factors = this.getLinePartFactors(s.line);
		if (!factors)
			return false; // The line never intersects the rectangle.
		const [lower, upper] = factors;
		return contains ? (lower >= 0 && upper <= 1) : (lower <= 1 && upper >= 0);
	}

	// Check if a circle touches or lies within this rectangle. If 'contains' is set to true, then it requires the circle to be fully inside the rectangle.
	touchesCircle(center: VectorInput, radius: number, contains = false): boolean {
		const c = ensureVector(center, this.dimension);
		const r = ensurePositive(radius);
		return contains
			? this.contains(c) && this.getDistanceTo(c, true) >= r
			: this.getDistanceTo(c) <= r;
	}

	/*
	 * Comparison methods.
	 */

	// equals runs an exact equality check on the full set-up. Rectangles that have the same points but defined in a different way are still considered equal.
	equals(rectangle: RectangleInput): boolean {
		const r = ensureRectangle(rectangle);
		return this.normalize().span.equals(r.normalize().span);
	}
}

// Turn the given parameter into a Rectangle object, or die trying.
export function ensureRectangle(rectangle: RectangleInput, dimension?: number): Rectangle {
	const rect = new Rectangle(rectangle);
	if (dimension !== undefined && rect.dimension !== dimension)
		throw new Error(`Invalid Rectangle dimension: expected dimension ${dimension}, got ${rect.dimension}.`);
	return rect;
}
