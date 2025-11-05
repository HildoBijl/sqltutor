import { ensureInt, compareNumbers } from '../javascript';

// A coordinate can be either an array of numbers or an object with x/y(/z) properties.
export type CoordinatesArray = readonly number[];
export type CoordinatesObject = { x: number; y?: number; z?: number };
export type Coordinates = CoordinatesArray | CoordinatesObject;
export type VectorInput = Vector | Coordinates;
export type VectorSO = CoordinatesArray;

export class Vector {
	public readonly coordinates: number[];

	/*
	 * Static properties.
	 */
	static zero = new Vector(0, 0);
	static i = new Vector(1, 0);
	static j = new Vector(0, 1);
	static '3D' = {
		zero: new Vector(0, 0, 0),
		i: new Vector(1, 0, 0),
		j: new Vector(0, 1, 0),
		k: new Vector(0, 0, 1),
	};

	/*
	 * Creation methods.
	 */

	constructor(vector: VectorInput);
	constructor(...args: CoordinatesArray); // new Vector(1, 2, 3)
	constructor(...args: any[]) {
		// On no args, throw an error.
		if (args.length === 0)
			throw new Error(`Invalid Vector: called without input. Use Vector.zero for a 2D zero vector.`);

		// On a single argument, check what it is.
		if (args.length === 1) {
			const value = args[0];

			// new Vector(existingVector)
			if (value instanceof Vector) {
				this.coordinates = [...value.coordinates];
				return;
			}

			// new Vector([1, 2, 3])
			if (isCoordinatesArray(value)) {
				this.coordinates = [...value];
				return;
			}

			// new Vector({ x: 1, y: 2, z: 3})
			if (isCoordinatesObject(value)) {
				this.coordinates = Vector.fromCoordinates(value).coordinates;
				return;
			}
		}

		// new Vector(1, 2, 3)
		if (args.every(arg => typeof arg === 'number')) {
			this.coordinates = [...args];
			return;
		}

		throw new Error(`Invalid Vector: unsupported constructor input.`);
	}

	get SO(): VectorSO {
		return [...this.coordinates];
	}

	get type(): string {
		return 'Vector';
	}

	/*
	 * Getting and setting coordinates.
	 */
	get x(): number {
		return this.getCoordinate(0);
	}
	get y(): number {
		return this.getCoordinate(1);
	}
	get z(): number {
		return this.getCoordinate(2);
	}

	set x(value: number) {
		this.setCoordinate(0, value);
	}
	set y(value: number) {
		this.setCoordinate(1, value);
	}
	set z(value: number) {
		this.setCoordinate(2, value);
	}

	getCoordinate(index: number): number {
		return this.coordinates[this.ensureValidIndex(index)];
	}
	setCoordinate(index: number, value: number): void {
		this.coordinates[this.ensureValidIndex(index)] = value;
	}

	private ensureValidIndex(index: number): number {
		index = ensureInt(index, true);
		if (index >= this.coordinates.length)
			throw new RangeError(`Invalid vector index: ${index} exceeds vector dimension ${this.coordinates.length}.`);
		return index;
	}

	/*
	 * Derived properties.
	 */

	get dimension(): number {
		return this.coordinates.length;
	}

	get squaredMagnitude(): number {
		return this.coordinates.reduce((sum, coordinate) => sum + coordinate ** 2, 0);
	}

	get magnitude(): number {
		return Math.sqrt(this.squaredMagnitude);
	}

	get unitVector(): Vector {
		return this.normalize();
	}

	// Find the argument (angle) of a 2D vector in radians, counterclockwise from the x-axis
	get argument(): number {
		if (this.dimension !== 2)
			throw new Error(`Cannot compute argument of a ${this.dimension}D vector.`);
		return Math.atan2(this.y, this.x);
	}

	get str(): string {
		return this.toString();
	}

	toString(): string {
		return `[${this.coordinates.join(', ')}]`;
	}

	isZero(): boolean {
		return compareNumbers(this.squaredMagnitude, 0);
	}

	/*
	 * Manipulation methods.
	 */

	reverse(): Vector {
		return this.multiply(-1);
	}

	add(vector: VectorInput): Vector {
		const v = ensureVector(vector, this.dimension);
		return new Vector(this.coordinates.map((value, index) => value + v.getCoordinate(index)));
	}

	subtract(vector: VectorInput): Vector {
		const v = ensureVector(vector, this.dimension);
		return this.add(v.reverse());
	}

	// Multiply the vector by a scalar, scaling it up.
	multiply(number: number): Vector {
		return new Vector(this.coordinates.map(value => value * number));
	}

	// Divide the vector by a scalar.
	divide(number: number): Vector {
		return this.multiply(1 / number);
	}

	// Take another vector and interpolate between the two vectors. 0 means this vector is kept and 1 means the other vector is used. Default is 0.5.
	interpolate(vector: VectorInput, factor = 0.5): Vector {
		const v = ensureVector(vector, this.dimension);
		return this.multiply(1 - factor).add(v.multiply(factor))
	}

	// Find the unit vector in the given direction, effectively normalizing the vector.
	normalize(): Vector {
		return this.setMagnitude(1);
	}

	// Create a new vector that is the same as this vector, but then resized to have the given magnitude.
	setMagnitude(magnitude: number): Vector {
		const ownMagnitude = this.magnitude;
		if (compareNumbers(ownMagnitude, 0))
			throw new Error(`Cannot set magnitude of the zero vector.`);
		return this.multiply(magnitude / ownMagnitude);
	}

	// Shorten the vector by a set amount while keeping its direction. If the distance is larger than the magnitude of this vector, the zero vector (of same dimension) is returned.
	shorten(distance: number): Vector {
		return this.multiply(Math.max(0, 1 - distance / this.magnitude));
	}

	// Find the dot product between this vector and another.
	dotProduct(vector: VectorInput): number {
		const v = ensureVector(vector, this.dimension);
		return this.coordinates.reduce((sum, value, index) => sum + value * v.getCoordinate(index), 0);
	}

	// Find the cross product between this vector and another. Returns a Vector for 3D, or a number for 2D (z-component).
	crossProduct(vector: VectorInput): Vector | number {
		// Check the input.
		const v = ensureVector(vector, this.dimension);
		if (this.dimension !== v.dimension)
			throw new Error(`Cross product dimension mismatch: ${this.dimension} vs ${v.dimension}`);
		if (this.dimension !== 2 && this.dimension !== 3)
			throw new Error(`Cross product only defined for 2D or 3D vectors.`);

		const a = this.coordinates;
		const b = v.coordinates;

		// 2D case.
		if (this.dimension === 2)
			return a[0] * b[1] - a[1] * b[0];

		// 3D case.
		return new Vector([
			a[1] * b[2] - a[2] * b[1],
			a[2] * b[0] - a[0] * b[2],
			a[0] * b[1] - a[1] * b[0],
		]);
	}

	// Find the distance to a given point.
	getDistanceTo(vector: VectorInput): number {
		return Math.sqrt(this.getSquaredDistanceTo(vector));
	}

	// Find the squared distance to a given point.
	getSquaredDistanceTo(vector: VectorInput): number {
		const v = ensureVector(vector, this.dimension);
		return this.subtract(v).squaredMagnitude;
	}

	// Find the component of a given vector along another given vector: its projection onto this vector.
	getProjectionOn(vector: VectorInput): Vector {
		const v = ensureVector(vector, this.dimension);
		return v.multiply(this.dotProduct(v) / v.squaredMagnitude);
	}

	// getPerpendicularComponent gets the perpendicular component of the given vector with respect to another vector. 
	getPerpendicularComponent(vector: VectorInput): Vector {
		return this.subtract(this.getProjectionOn(vector));
	}

	/*
	 * Transformation methods.
	 */

	// Apply a transformation matrix (an array of arrays, like [[1,0],[0,1]]) to a vector. This transformation is done as seen from the given vector position (default the zero position). 
	transform(matrix: number[][], relativeTo?: VectorInput): Vector {
		// Check the input.
		if (
			!Array.isArray(matrix) ||
			matrix.length !== this.dimension ||
			matrix.some(row => !Array.isArray(row) || row.length !== this.dimension || row.some(element => typeof element !== 'number'))
		)
			throw new Error(`Invalid transformation matrix: expected ${this.dimension} by ${this.dimension} matrix of numbers.`);
		const origin = ensureVector(relativeTo, this.dimension, true); // Default to zero vector

		// Apply the transformation.
		const relativeVector = this.subtract(origin);
		const transformedVector = new Vector(matrix.map(row => relativeVector.dotProduct(new Vector(row))));
		return origin.add(transformedVector);
	}

	// Scale the point according to the given scales. When a single number is given, this is just like multiply. When an array of numbers is given, with equal length as the dimension, then a different scale can be applied to each dimension.
	scale(scales: number | number[], relativeTo?: VectorInput): Vector {
		// Check the scales array.
		let scaleArray: number[];
		if (Array.isArray(scales)) {
			if (scales.length !== this.dimension)
				throw new Error(`Scale array must have length ${this.dimension}`);
			scaleArray = scales;
		} else {
			scaleArray = new Array(this.dimension).fill(scales);
		}

		// Set up a matrix to apply as transformation, and apply it.
		const matrix = scaleArray.map((s, rowIndex) => scaleArray.map((_, colIndex) => (rowIndex === colIndex ? s : 0)));
		return this.transform(matrix, relativeTo);
	}

	// Rotate the point according to the given angle. When an extra vector is given, the rotation is done according to the given point. This only works in 2D.
	rotate(rotation: number, relativeTo?: VectorInput): Vector {
		// Check the dimension.
		if (this.dimension !== 2)
			throw new Error(`Rotation is only defined for 2D vectors.`);

		// Apply the transformation matrix.
		const matrix = [
			[Math.cos(rotation), -Math.sin(rotation)],
			[Math.sin(rotation), Math.cos(rotation)],
		]
		return this.transform(matrix, relativeTo)
	}

	// Reflect a point along the given direction. Yes, ALONG. So to flip across the vertical axis, reflect ALONG the horizontal axis, and hence give [1, 0] as vector. This function also works for higher dimensions. By default, reflection is done along the x-axis.
	reflect(direction?: VectorInput, relativeTo?: VectorInput): Vector {
		// Process the given reflection direction.
		const d = ensureVector(direction ?? Vector.getUnitVector(0, this.dimension), this.dimension, undefined, true).normalize();

		// Apply the respective transformation matrix I - 2*v*v^T/|v|^2.
		const matrix = d.coordinates.map((rowElement, rowIndex) => d.coordinates.map((colElement, colIndex) => (rowIndex === colIndex ? 1 : 0) - 2 * rowElement * colElement));
		return this.transform(matrix, relativeTo);
	}

	/*
	 * Comparison methods.
	 */

	// Check equality for two vectors.
	equals(vector: VectorInput): boolean {
		const v = ensureVector(vector, this.dimension);
		return this.dimension === v.dimension && this.coordinates.every((value, index) => compareNumbers(value, v.getCoordinate(index)));
	}

	// Check if two vectors have equal magnitude.
	isEqualMagnitude(vector: VectorInput): boolean {
		const v = ensureVector(vector, this.dimension);
		return compareNumbers(this.squaredMagnitude, v.squaredMagnitude);
	}

	// Check if two vectors have equal direction. When allowReverse is set to true, then an exactly opposite direction also results in true.
	isEqualDirection(vector: VectorInput, allowReverse = false): boolean {
		const v = ensureVector(vector, this.dimension);
		const dot = this.dotProduct(v);
		return compareNumbers(allowReverse ? Math.abs(dot) : dot, this.magnitude * v.magnitude);
	}

	// isPerpendicular checks if two vectors are perpendicular with respect to each other.
	isPerpendicular(vector: VectorInput): boolean {
		const v = ensureVector(vector, this.dimension);
		return compareNumbers(this.dotProduct(v), 0);
	}

	/*
	 * Static methods.
	 */

	// Turn a storage object into a Vector.
	static fromSO(vectorSO: VectorSO): Vector {
		return new Vector(vectorSO);
	}

	// Get the zero vector for the given dimension.
	static getZero(dimension: number): Vector {
		dimension = ensureInt(dimension, true)
		return new Vector(Array(dimension).fill(0))
	}

	// Get the unit vector along the given axis (0 for x, 1 for y, etcetera) for the given dimension.
	static getUnitVector(axis: number, dimension: number): Vector {
		// Check the input.
		axis = ensureInt(axis, true);
		dimension = ensureInt(dimension, true, true);
		if (axis >= dimension)
			throw new Error(`Invalid axis: cannot have an axis (${axis}) larger than or equal to the dimension (${dimension}).`);

		// Set up the vector with 1 at the desired axis.
		const coordinates = Array(dimension).fill(0);
		coordinates[axis] = 1;
		return new Vector(coordinates);
	}

	// Turn an object like { x: 2, y: 4 } into a Vector.
	static fromCoordinates(coordinates: CoordinatesObject) {
		// Check the input.
		if (coordinates == null || typeof coordinates !== "object")
			throw new Error(`Invalid coordinates: expected an object with numeric properties x, y, z.`);
		const { x, y, z, ...rest } = coordinates;

		// Disallow any extra properties.
		const extraKeys = Object.keys(rest);
		if (extraKeys.length > 0)
			throw new Error(`Invalid coordinates: unexpected extra properties ${extraKeys.join(", ")}.`);

		// Set up the resulting vector.
		return new Vector(y === undefined ? [x] : z === undefined ? [x, y] : [x, y, z]);
	}

	// Turn a magnitude and argument into a 2D vector.
	static fromPolar(magnitude: number, argument: number) {
		return new Vector(magnitude * Math.cos(argument), magnitude * Math.sin(argument));
	}
}

// Check the type of parameter that we have.
export function isCoordinatesArray(value: unknown): value is CoordinatesArray {
	return Array.isArray(value) && value.every(v => typeof v === 'number');
}
export function isCoordinatesObject(value: unknown): value is CoordinatesObject {
	// Check that it's a valid object.
	if (typeof value !== 'object' || value === null)
		return false;
	const obj = value as Record<string, unknown>;

	// Ensure there's only x, y and z.
	const keys = Object.keys(obj);
	if (!keys.every(k => ['x', 'y', 'z'].includes(k)))
		return false;

	// Check that all coordinates are numbers.
	const hasValidX = typeof obj.x === 'number';
	const hasValidY = obj.y === undefined || typeof obj.y === 'number';
	const hasValidZ = obj.z === undefined || (!hasValidY && typeof obj.z === 'number');
	return hasValidX && hasValidY && hasValidZ;
}
export function isCoordinates(value: unknown): value is Coordinates {
	return isCoordinatesArray(value) || isCoordinatesObject(value);
}

// Take vector-like object (like { x: 2, y: 3 } or [2, 3]) and ensure it's a Vector. If the dimension is given, it also ensures it's a vector of the given dimension.
export function ensureVector(
	input: VectorInput | undefined,
	dimension?: number,
	useDefaultZero: boolean = false,
	preventZero: boolean = false
): Vector {
	// Validate settings
	if (useDefaultZero && preventZero)
		throw new Error(`Invalid ensureVector settings: cannot have both useDefaultZero and preventZero set to true.`);

	// Provide default zero vector if requested.
	if (input === undefined) {
		if (useDefaultZero) {
			if (dimension === undefined)
				throw new Error(`Cannot create default zero vector: dimension is undefined.`);
			return Vector.getZero(dimension);
		} else {
			throw new Error(`Cannot process vector: undefined was given.`);
		}
	}

	// Ensure the input is a Vector instance.
	if (!(input instanceof Vector)) {
		if (Array.isArray(input))
			input = new Vector(input as CoordinatesArray);
		else
			input = new Vector(input as CoordinatesObject);
	}
	const vector = input as Vector;

	// Validate dimension if provided.
	if (dimension !== undefined && vector.dimension !== dimension)
		throw new Error(`Invalid Vector dimension: expected dimension ${dimension}, got ${vector.dimension}.`);

	// Check for zero vector if not allowed.
	if (preventZero && vector.isZero())
		throw new Error(`Zero vector is not allowed.`);

	return vector;
}

// Ensure that the given parameter is an array of vectors. It turns the result into vectors if they're not vectors yet, like an array of coordinates [200, 300] or an object { x: 200, y: 300 }.
export function ensureVectorArray(
	vectors: VectorInput[],
	dimension?: number,
	numElements?: number
): Vector[] {
	if (!Array.isArray(vectors))
		throw new Error(`Invalid Vector array: expected an array of vectors or vector-like objects (arrays or objects with coordinates) but received a parameter of type "${typeof vectors}".`);
	if (numElements !== undefined && vectors.length !== numElements)
		throw new Error(`Invalid Vector array: expected an array with ${numElements} vectors, but the array had ${vectors.length} elements instead.`);
	return vectors.map(vector => ensureVector(vector, dimension));
}
