import { ensureInt, compareNumbers } from '../javascript';

import { Vector, type VectorInput, type VectorSO, ensureVector, isCoordinates } from './Vector';

export interface LineDefinition {
	start: VectorInput;
	direction: VectorInput;
}
export type LineInput = Line | LineDefinition;
export interface LineSO {
	start: VectorSO;
	direction: VectorSO;
}

export class Line {
	public readonly start: Vector;
	public readonly direction: Vector;

	/*
	 * Creation methods.
	 */

	constructor(line: LineInput);
	constructor(start: VectorInput, direction: VectorInput);
	constructor(start: VectorInput | LineDefinition | Line, direction?: VectorInput) {
		// If only one argument is given, interpret it intelligently.
		if (direction === undefined) {
			let lineDefinition = start;

			// Directly return an existing Line.
			if (lineDefinition instanceof Line) {
				this.start = lineDefinition.start;
				this.direction = lineDefinition.direction;
				return;
			}

			// Ensure it is a line definition.
			if (!isLineDefinition(lineDefinition))
				throw new Error(`Invalid Line: expected an object that could be turned into a Line, but received "${typeof lineDefinition}".`);

			// Extract parameters.
			start = lineDefinition.start;
			direction = lineDefinition.direction;
		}

		// At this point start may not be a Line anymore. (This should never happen, but is a necessary check for typescript.)
		if (start instanceof Line || isLineDefinition(start))
			throw new Error(`Invalid Line: unexpected Line or LineDefinition in constructor at this point.`);

		// Validate and store.
		this.start = ensureVector(start);
		this.direction = ensureVector(direction, this.start.dimension);

		// Run a final check on validity.
		if (this.direction.isZero())
			throw new Error(`Invalid Line direction: cannot accept a direction vector with zero magnitude.`);
	}

	get SO(): LineSO {
		return {
			start: this.start.SO,
			direction: this.direction.SO,
		};
	}

	get type(): string {
		return 'Line';
	}

	/*
	 * Getters.
	 */

	get normalizedDirection(): Vector {
		return this.direction.normalize();
	}

	get secondPoint(): Vector {
		return this.start.add(this.direction);
	}

	get angle(): number {
		if (this.dimension !== 2)
			throw new Error(`Invalid angle call: cannot retrieve the angle of a ${this.dimension}D Line.`);
		return this.direction.argument;
	}

	// Find the Vector from the origin to this Line.
	get perpendicularVector(): Vector {
		return this.start.getPerpendicularComponent(this.direction);
	}

	// Find the distance from the origin to this Line.
	get distance(): number {
		return this.perpendicularVector.magnitude;
	}

	/*
	 * Derived properties.
	 */

	get dimension(): number {
		return this.start.dimension;
	}

	get str(): string {
		return this.toString();
	}

	toString(): string {
		return `Line({ start: ${this.start}, direction: ${this.direction} })`;
	}

	normalize(): Line {
		return new Line(this.perpendicularVector, this.normalizedDirection);
	}

	reverse(): Line {
		return new Line(this.start, this.direction.reverse());
	}

	/*
	 * Manipulation and computation methods.
	 */

	// Find the closest point on the line, as seen from the given point.
	getClosestPoint(vector: VectorInput): Vector {
		const v = ensureVector(vector, this.dimension);

		// Compute relative vector and project onto the line direction.
		const relativeVector = v.subtract(this.start);
		const projection = relativeVector.getProjectionOn(this.direction);
		return this.start.add(projection);
	}

	// Find the squared distance from the line to a given point.
	getSquaredDistanceFrom(vector: VectorInput): number {
		const v = ensureVector(vector, this.dimension);
		const closestPoint = this.getClosestPoint(v);
		const difference = v.subtract(closestPoint);
		return difference.squaredMagnitude;
	}

	// Find the distance from the line to a given point.
	getDistanceFrom(vector: VectorInput): number {
		return Math.sqrt(this.getSquaredDistanceFrom(vector));
	}

	// Check if a given point (Vector) is on the given line. 
	containsPoint(vector: VectorInput): boolean {
		return compareNumbers(this.getSquaredDistanceFrom(vector), 0);
	}

	// Take a point on a line, and find the factor such that start + factor * direction = point. If the point is not on the line, the closest point on the line is taken.
	getDirectionFactor(vector: VectorInput): number {
		const closestPoint = this.getClosestPoint(vector);
		const relativeVector = closestPoint.subtract(this.start);
		return relativeVector.magnitude / this.direction.magnitude;
	}

	// Find the point on the line with position "start + factor * direction".
	getPointWithFactor(factor: number): Vector {
		return this.start.add(this.direction.multiply(factor));
	}

	// Take an axis (0 for x, 1 for y, etcetera) and a value of this axis, and find the point on the line having that coordinate. For instance, with parameters "axis = 1" and "value = 3" it finds the point on the line where y = 3.
	getPointWithCoordinate(axis: number, value: number): Vector {
		const factor = this.getFactorOfPointWithCoordinate(axis, value);
		return this.getPointWithFactor(factor);
	}

	// This function is the same as getPointWithCoordinates, but then it only returns the factor of the given point.
	getFactorOfPointWithCoordinate(axis: number, value: number): number {
		// Check the input.
		const a = ensureInt(axis, true);
		if (a >= this.dimension)
			throw new Error(`Invalid axis: the axis (${a}) cannot be higher than or equal to the dimension (${this.dimension}) of the Line.`);

		// Check if the Line is parallel to this axis.
		if (compareNumbers(this.direction.getCoordinate(a), 0))
			throw new Error(`Invalid getPointWithCoordinate call: the line is parallel to the given axis (${a}), so no intersecting point can be computed.`);

		// Find the factor by which we must multiply the direction vector.
		return (value - this.start.getCoordinate(a)) / this.direction.getCoordinate(a);
	}

	// getIntersection finds the intersection point of two lines. If this intersection does not exist, null is returned.
	getIntersection(line: Line | LineDefinition): Vector | null {
		const l = ensureLine(line, this.dimension);

		// Lines must have the same dimension.
		if (this.dimension !== l.dimension)
			throw new Error(`Invalid getIntersection call: line dimensions do not match (${this.dimension} vs ${l.dimension}).`);

		// For parallel lines, there is no valid answer.
		if (this.isParallel(l))
			return null;

		// Alias parameters.
		const s1 = this.start;
		const d1 = this.direction;
		const s2 = l.start;
		const d2 = l.direction;
		const delta = s2.subtract(s1);

		// Handle the 2D case.
		if (this.dimension === 2) {
			const det = d1.x * d2.y - d2.x * d1.y;
			const factor = (delta.x * d2.y - delta.y * d2.x) / det;
			return this.getPointWithFactor(factor);
		}

		// Handle nD case (3D and higher).
		const a = d1.dotProduct(d1);
		const b = d1.dotProduct(d2);
		const c = d2.dotProduct(d2);
		const d = d1.dotProduct(delta);
		const e = d2.dotProduct(delta);

		// Solve for the factors for each line.
		const denom = a * c - b * b;
		const factor1 = (c * d - b * e) / denom;
		const factor2 = (b * d - a * e) / denom;

		// Get the closest points on each line. If they are the same, the lines intersect.
		const p1 = this.getPointWithFactor(factor1);
		const p2 = l.getPointWithFactor(factor2);
		return p1.equals(p2) ? p1 : null;
	}

	// Apply the given transformation to the line.
	transform(...args: Parameters<Vector["transform"]>): Line {
		return Line.fromPoints(this.start.transform(...args), this.secondPoint.transform(...args));
	}

	/*
	 * Comparison methods.
	 */

	// Check if the line is parallel with another line.
	isParallel(line: Line | LineDefinition): boolean {
		const l = ensureLine(line, this.dimension);
		if (this.dimension !== l.dimension)
			throw new Error(`Invalid parallel check: line dimensions do not match (${this.dimension} vs ${l.dimension}).`);

		// Check if the direction vectors are in the same direction.
		return this.direction.isEqualDirection(l.direction, true);
	}

	// Check if the line is perpendicular with another line.
	isPerpendicular(line: Line | LineDefinition): boolean {
		const l = ensureLine(line, this.dimension);
		if (this.dimension !== l.dimension)
			throw new Error(`Invalid perpendicular check: line dimensions do not match (${this.dimension} vs ${l.dimension}).`);

		// Check if the direction vectors are perpendicular.
		return this.direction.isPerpendicular(l.direction);
	}

	// Check if the line equals another line.
	equals(line: Line | LineDefinition, requireSameDirection = false): boolean {
		// Check the input.
		const l = ensureLine(line, this.dimension);
		if (this.dimension !== l.dimension)
			throw new Error(`Invalid equals check: line dimensions do not match (${this.dimension} vs ${l.dimension}).`);

		// The lines must be parellel and contain each other's starting point.
		if (!this.direction.isEqualDirection(l.direction, !requireSameDirection))
			return false;
		return this.containsPoint(l.start);
	}

	// Check if the line intersects with the given line. It returns true or false.
	intersects(line: Line | LineDefinition): boolean {
		const l = ensureLine(line, this.dimension);

		// 1D lines always "intersect" (they overlap entirely).
		if (this.dimension === 1)
			return true;

		// Equal lines also always intersect.
		if (this.equals(l))
			return true;

		// Otherwise, check if an intersection exists.
		return this.getIntersection(l) !== null;
	}

	/*
	 * Static methods.
	 */

	// Turn a storage object into a Line.
	static fromSO(lineSO: LineSO): Line {
		return new Line(lineSO.start, lineSO.direction);
	}

	// Get a line that goes through two points (Vectors).
	static fromPoints(point1: VectorInput, point2: VectorInput): Line {
		const p1 = ensureVector(point1);
		const p2 = ensureVector(point2, p1.dimension);
		return new Line(p1, p2.subtract(p1));
	}

	// Get a 2D line with the given angle (argument) and the given distance from the origin. It is assumed that, after traveling the given distance, we turn a hard left to go into the given angle. So (Math.PI/2, 3) lets us go three steps to the right before we go straight up. Similarly, (Math.PI*3/2, 4) lets us go four steps to the left before going straight down.
	static fromAngleAndDistance(angle: number, distance: number): Line {
		return new Line(
			Vector.fromPolar(distance, angle - Math.PI / 2),
			Vector.fromPolar(1, angle),
		);
	}

	// Get a line from the given point in the direction of the given angle. This only works for 2D points.
	static fromPointAndAngle(point: VectorInput, angle: number): Line {
		const start = ensureVector(point, 2);
		return new Line(start, Vector.fromPolar(1, angle));
	}

	// Take a Vector and an axis (0 for x-axis, 1 for y-axis, etcetera) and get the line through the given point along the given axis.
	static getAxisLineThrough(point: VectorInput, axis: number): Line {
		// Check the input.
		const p = ensureVector(point);
		axis = ensureInt(axis, true);
		if (axis >= p.dimension)
			throw new Error(`Invalid axis: expected a number between 0 (inclusive) and the point dimension ${p.dimension} (exclusive) but received ${axis}.`);

		// Set up the line.
		return new Line(p, Vector.getUnitVector(axis, p.dimension));
	}

	static getHorizontalLineThrough(point: VectorInput): Line {
		return Line.getAxisLineThrough(point, 0);
	}

	static getVerticalLineThrough(point: VectorInput): Line {
		return Line.getAxisLineThrough(point, 1);
	}
}

// Check that the given value is a definition of a line.
export function isLineDefinition(value: unknown): value is LineDefinition {
	// Check that it is a valid object.
	if (typeof value !== 'object' || value === null)
		return false;
	const candidate = value as Partial<LineDefinition>;

	// Check the arguments.
	const validStart = candidate.start instanceof Vector || isCoordinates(candidate.start);
	const validDirection = candidate.direction instanceof Vector || isCoordinates(candidate.direction);
	return validStart && validDirection;
}

// Turn the given Line or LineDefinition parameter into a Line object or die trying. It can optionally also check for the given dimension.
export function ensureLine(line: Line | LineDefinition, dimension?: number): Line {
	// Ensure that we have a Line instance.
	const l = new Line(line);

	// If a required dimension is specified, validate it.
	if (dimension !== undefined && l.dimension !== dimension)
		throw new Error(`Invalid Line dimension: expected a Line of dimension ${dimension} but received one of dimension ${l.dimension}.`);

	return l;
}
