/**
 * Scale Module
 *
 * Provides scale types for data transformation in visualizations.
 * Supports linear, logarithmic, time-based, and categorical transformations.
 *
 * @module visualization/scale
 */

/**
 * Base scale interface for numeric scales
 */
export interface NumericScale {
	/**
	 * Transform a value from domain to range
	 *
	 * @param value - Value to transform
	 * @returns Transformed value
	 */
	scale(value: number): number;

	/**
	 * Transform a value from range back to domain
	 *
	 * @param value - Value to invert
	 * @returns Inverted value
	 */
	invert(value: number): number;

	/**
	 * Get or set the domain (input range)
	 *
	 * @param domain - Optional new domain
	 * @returns Current domain or this scale
	 */
	domain(domain?: [number, number]): [number, number] | NumericScale;

	/**
	 * Get or set the range (output range)
	 *
	 * @param range - Optional new range
	 * @returns Current range or this scale
	 */
	range(range?: [number, number]): [number, number] | NumericScale;

	/**
	 * Get or set whether the scale is clamped
	 *
	 * @param clamp - Optional new clamp value
	 * @returns Current clamp value or this scale
	 */
	clamp(clamp?: boolean): boolean | NumericScale;

	/**
	 * Get or set whether the scale is nice (round numbers)
	 *
	 * @param nice - Optional new nice value
	 * @returns Current nice value or this scale
	 */
	nice(nice?: boolean): boolean | NumericScale;

	/**
	 * Generate ticks for the scale
	 *
	 * @param count - Number of ticks to generate
	 * @returns Array of tick values
	 */
	ticks(count?: number): number[];

	/**
	 * Copy the scale
	 *
	 * @returns A new scale with the same configuration
	 */
	copy(): NumericScale;
}

/**
 * Linear scale for linear transformations
 */
export class LinearScale implements NumericScale {
	/** Domain (input range) */
	private _domain: [number, number];

	/** Range (output range) */
	private _range: [number, number];

	/** Whether to clamp values to range */
	private _clamp = false;

	/** Whether to use nice numbers */
	private _nice = false;

	/** Cached transformation coefficients */
	private _coefficients: {a: number; b: number} | null = null;

	/**
	 * Create a new linear scale
	 *
	 * @param domain - Initial domain
	 * @param range - Initial range
	 */
	constructor(domain: [number, number] = [0, 1], range: [number, number] = [0, 1]) {
		this._domain = [...domain];
		this._range = [...range];
	}

	/**
	 * Get or set the domain
	 */
	domain(domain?: [number, number]): [number, number] | this {
		if (domain === undefined) {
			return [...this._domain];
		}
		this._domain = [...domain];
		this._coefficients = null;
		return this;
	}

	/**
	 * Get or set the range
	 */
	range(range?: [number, number]): [number, number] | this {
		if (range === undefined) {
			return [...this._range];
		}
		this._range = [...range];
		this._coefficients = null;
		return this;
	}

	/**
	 * Get or set clamp
	 */
	clamp(clamp?: boolean): boolean | this {
		if (clamp === undefined) {
			return this._clamp;
		}
		this._clamp = clamp;
		return this;
	}

	/**
	 * Get or set nice
	 */
	nice(nice?: boolean): boolean | this {
		if (nice === undefined) {
			return this._nice;
		}
		this._nice = nice;
		if (nice) {
			this._domain = this.niceDomain(this._domain);
			this._coefficients = null;
		}
		return this;
	}

	/**
	 * Transform a value from domain to range
	 */
	scale(value: number): number {
		if (this._coefficients === null) {
			this._computeCoefficients();
		}

		let result = this._coefficients!.a * value + this._coefficients!.b;

		if (this._clamp) {
			result = Math.max(this._range[0], Math.min(this._range[1], result));
		}

		return result;
	}

	/**
	 * Transform a value from range back to domain
	 */
	invert(value: number): number {
		if (this._coefficients === null) {
			this._computeCoefficients();
		}

		let result = (value - this._coefficients!.b) / this._coefficients!.a;

		if (this._clamp) {
			result = Math.max(this._domain[0], Math.min(this._domain[1], result));
		}

		return result;
	}

	/**
	 * Generate ticks for the scale
	 */
	ticks(count = 10): number[] {
		const [min, max] = this._domain;
		if (min === max) {
			return [min];
		}

		const span = max - min;
		const step = this.niceStep(span / count);
		const start = Math.ceil(min / step) * step;
		const end = Math.floor(max / step) * step;

		const ticks: number[] = [];
		for (let t = start; t <= end + step / 2; t += step) {
			ticks.push(t);
		}

		return ticks;
	}

	/**
	 * Copy the scale
	 */
	copy(): this {
		const copy = new LinearScale(this._domain, this._range);
		copy._clamp = this._clamp;
		copy._nice = this._nice;
		return copy as this;
	}

	/**
	 * Compute transformation coefficients
	 */
	private _computeCoefficients(): void {
		const [d0, d1] = this._domain;
		const [r0, r1] = this._range;

		if (d0 === d1) {
			this._coefficients = {a: 0, b: r0};
		} else {
			this._coefficients = {
				a: (r1 - r0) / (d1 - d0),
				b: r0 - (r1 - r0) * d0 / (d1 - d0),
			};
		}
	}

	/**
	 * Get a nice domain with round numbers
	 */
	private niceDomain(domain: [number, number]): [number, number] {
		const [min, max] = domain;
		if (min === max) {
			return [min, max];
		}

		const span = max - min;
		const step = this.niceStep(span / 10);
		const start = Math.floor(min / step) * step;
		const end = Math.ceil(max / step) * step;

		return [start, end];
	}

	/**
	 * Get a nice step size
	 */
	private niceStep(span: number): number {
		const power = Math.floor(Math.log10(span));
		const fraction = span / Math.pow(10, power);

		let niceFraction: number;
		if (fraction < 1.5) {
			niceFraction = 1;
		} else if (fraction < 3) {
			niceFraction = 2;
		} else if (fraction < 7) {
			niceFraction = 5;
		} else {
			niceFraction = 10;
		}

		return niceFraction * Math.pow(10, power);
	}
}

/**
 * Logarithmic scale for logarithmic transformations
 */
export class LogScale implements NumericScale {
	/** Domain (input range) */
	private _domain: [number, number];

	/** Range (output range) */
	private _range: [number, number];

	/** Base of the logarithm */
	private _base = 10;

	/** Whether to clamp values to range */
	private _clamp = false;

	/** Cached transformation coefficients */
	private _coefficients: {a: number; b: number} | null = null;

	/**
	 * Create a new logarithmic scale
	 *
	 * @param domain - Initial domain
	 * @param range - Initial range
	 * @param base - Logarithm base
	 */
	constructor(domain: [number, number] = [1, 10], range: [number, number] = [0, 1], base = 10) {
		this._domain = [...domain];
		this._range = [...range];
		this._base = base;
	}

	/**
	 * Get or set the domain
	 */
	domain(domain?: [number, number]): [number, number] | this {
		if (domain === undefined) {
			return [...this._domain];
		}
		if (domain[0] <= 0 || domain[1] <= 0) {
			throw new Error('Log scale domain must be positive');
		}
		this._domain = [...domain];
		this._coefficients = null;
		return this;
	}

	/**
	 * Get or set the range
	 */
	range(range?: [number, number]): [number, number] | this {
		if (range === undefined) {
			return [...this._range];
		}
		this._range = [...range];
		this._coefficients = null;
		return this;
	}

	/**
	 * Get or set clamp
	 */
	clamp(clamp?: boolean): boolean | this {
		if (clamp === undefined) {
			return this._clamp;
		}
		this._clamp = clamp;
		return this;
	}

	/**
	 * Get or set nice (no-op for log scale)
	 */
	nice(): boolean {
		return false;
	}

	/**
	 * Transform a value from domain to range
	 */
	scale(value: number): number {
		if (value <= 0) {
			return this._range[0];
		}

		if (this._coefficients === null) {
			this._computeCoefficients();
		}

		const logValue = Math.log(value) / Math.log(this._base);
		let result = this._coefficients!.a * logValue + this._coefficients!.b;

		if (this._clamp) {
			result = Math.max(this._range[0], Math.min(this._range[1], result));
		}

		return result;
	}

	/**
	 * Transform a value from range back to domain
	 */
	invert(value: number): number {
		if (this._coefficients === null) {
			this._computeCoefficients();
		}

		let logValue = (value - this._coefficients!.b) / this._coefficients!.a;

		if (this._clamp) {
			const [d0, d1] = this._domain;
			const logMin = Math.log(d0) / Math.log(this._base);
			const logMax = Math.log(d1) / Math.log(this._base);
			logValue = Math.max(logMin, Math.min(logMax, logValue));
		}

		return Math.pow(this._base, logValue);
	}

	/**
	 * Generate ticks for the scale
	 */
	ticks(count = 10): number[] {
		const [min, max] = this._domain;
		const logMin = Math.log(min) / Math.log(this._base);
		const logMax = Math.log(max) / Math.log(this._base);
		const span = logMax - logMin;

		const step = Math.max(1, Math.floor(span / count));
		const start = Math.floor(logMin / step) * step;
		const end = Math.ceil(logMax / step) * step;

		const ticks: number[] = [];
		for (let t = start; t <= end; t += step) {
			const value = Math.pow(this._base, t);
			if (value >= min && value <= max) {
				ticks.push(value);
			}
		}

		return ticks;
	}

	/**
	 * Copy the scale
	 */
	copy(): this {
		const copy = new LogScale(this._domain, this._range, this._base);
		copy._clamp = this._clamp;
		return copy as this;
	}

	/**
	 * Compute transformation coefficients
	 */
	private _computeCoefficients(): void {
		const [d0, d1] = this._domain;
		const [r0, r1] = this._range;

		const logD0 = Math.log(d0) / Math.log(this._base);
		const logD1 = Math.log(d1) / Math.log(this._base);

		if (logD0 === logD1) {
			this._coefficients = {a: 0, b: r0};
		} else {
			this._coefficients = {
				a: (r1 - r0) / (logD1 - logD0),
				b: r0 - (r1 - r0) * logD0 / (logD1 - logD0),
			};
		}
	}
}

/**
 * Time scale for time-based transformations
 */
export class TimeScale implements NumericScale {
	/** Domain (input range as timestamps) */
	private _domain: [number, number];

	/** Range (output range) */
	private _range: [number, number];

	/** Whether to clamp values to range */
	private _clamp = false;

	/** Cached transformation coefficients */
	private _coefficients: {a: number; b: number} | null = null;

	/**
	 * Create a new time scale
	 *
	 * @param domain - Initial domain (as Date objects or timestamps)
	 * @param range - Initial range
	 */
	constructor(domain: [Date | number, Date | number] = [0, 1], range: [number, number] = [0, 1]) {
		this._domain = [
			domain[0] instanceof Date ? domain[0].getTime() : domain[0],
			domain[1] instanceof Date ? domain[1].getTime() : domain[1],
		];
		this._range = [...range];
	}

	/**
	 * Get or set the domain
	 */
	domain(domain?: [Date | number, Date | number]): [number, number] | this {
		if (domain === undefined) {
			return [...this._domain];
		}
		this._domain = [
			domain[0] instanceof Date ? domain[0].getTime() : domain[0],
			domain[1] instanceof Date ? domain[1].getTime() : domain[1],
		];
		this._coefficients = null;
		return this;
	}

	/**
	 * Get or set the range
	 */
	range(range?: [number, number]): [number, number] | this {
		if (range === undefined) {
			return [...this._range];
		}
		this._range = [...range];
		this._coefficients = null;
		return this;
	}

	/**
	 * Get or set clamp
	 */
	clamp(clamp?: boolean): boolean | this {
		if (clamp === undefined) {
			return this._clamp;
		}
		this._clamp = clamp;
		return this;
	}

	/**
	 * Get or set nice (no-op for time scale)
	 */
	nice(): boolean {
		return false;
	}

	/**
	 * Transform a value from domain to range
	 */
	scale(value: Date | number): number {
		const timestamp = value instanceof Date ? value.getTime() : value;

		if (this._coefficients === null) {
			this._computeCoefficients();
		}

		let result = this._coefficients!.a * timestamp + this._coefficients!.b;

		if (this._clamp) {
			result = Math.max(this._range[0], Math.min(this._range[1], result));
		}

		return result;
	}

	/**
	 * Transform a value from range back to domain
	 */
	invert(value: number): number {
		if (this._coefficients === null) {
			this._computeCoefficients();
		}

		let result = (value - this._coefficients!.b) / this._coefficients!.a;

		if (this._clamp) {
			result = Math.max(this._domain[0], Math.min(this._domain[1], result));
		}

		return result;
	}

	/**
	 * Generate ticks for the scale
	 */
	ticks(count = 10): number[] {
		const [min, max] = this._domain;
		if (min === max) {
			return [min];
		}

		const span = max - min;
		const step = this.niceTimeStep(span / count);
		const start = Math.ceil(min / step) * step;
		const end = Math.floor(max / step) * step;

		const ticks: number[] = [];
		for (let t = start; t <= end + step / 2; t += step) {
			ticks.push(t);
		}

		return ticks;
	}

	/**
	 * Copy the scale
	 */
	copy(): this {
		const copy = new TimeScale(this._domain, this._range);
		copy._clamp = this._clamp;
		return copy as this;
	}

	/**
	 * Compute transformation coefficients
	 */
	private _computeCoefficients(): void {
		const [d0, d1] = this._domain;
		const [r0, r1] = this._range;

		if (d0 === d1) {
			this._coefficients = {a: 0, b: r0};
		} else {
			this._coefficients = {
				a: (r1 - r0) / (d1 - d0),
				b: r0 - (r1 - r0) * d0 / (d1 - d0),
			};
		}
	}

	/**
	 * Get a nice time step size
	 */
	private niceTimeStep(span: number): number {
		const timeUnits = [
			1000, // 1 second
			5000, // 5 seconds
			10000, // 10 seconds
			30000, // 30 seconds
			60000, // 1 minute
			300000, // 5 minutes
			600000, // 10 minutes
			1800000, // 30 minutes
			3600000, // 1 hour
			7200000, // 2 hours
			14400000, // 4 hours
			28800000, // 8 hours
			86400000, // 1 day
			172800000, // 2 days
			604800000, // 1 week
			1209600000, // 2 weeks
			2592000000, // 1 month (30 days)
			7776000000, // 3 months
			31536000000, // 1 year
		];

		for (const unit of timeUnits) {
			if (span <= unit) {
				return unit;
			}
		}

		return 31536000000; // Default to 1 year
	}
}

/**
 * Category scale for categorical transformations
 */
export class CategoryScale {
	/** Domain (categories) */
	private _domain: string[];

	/** Range (output range) */
	private _range: [number, number];

	/** Padding between categories */
	private _padding = 0;

	/** Whether to clamp values to range */
	private _clamp = false;

	/**
	 * Create a new category scale
	 *
	 * @param domain - Initial categories
	 * @param range - Initial range
	 */
	constructor(domain: string[] = [], range: [number, number] = [0, 1]) {
		this._domain = [...domain];
		this._range = [...range];
	}

	/**
	 * Get or set the domain
	 */
	domain(domain?: string[]): string[] | this {
		if (domain === undefined) {
			return [...this._domain];
		}
		this._domain = [...domain];
		return this;
	}

	/**
	 * Get or set the range
	 */
	range(range?: [number, number]): [number, number] | this {
		if (range === undefined) {
			return [...this._range];
		}
		this._range = [...range];
		return this;
	}

	/**
	 * Get or set clamp
	 */
	clamp(clamp?: boolean): boolean | this {
		if (clamp === undefined) {
			return this._clamp;
		}
		this._clamp = clamp;
		return this;
	}

	/**
	 * Get or set nice (no-op for category scale)
	 */
	nice(): boolean {
		return false;
	}

	/**
	 * Get or set padding
	 */
	padding(padding?: number): number | this {
		if (padding === undefined) {
			return this._padding;
		}
		this._padding = Math.max(0, Math.min(0.5, padding));
		return this;
	}

	/**
	 * Transform a category to a range value
	 */
	scale(value: string | number): number {
		let index: number;
		if (typeof value === 'string') {
			index = this._domain.indexOf(value);
		} else {
			index = value;
		}

		if (index < 0 || index >= this._domain.length) {
			return this._range[0];
		}

		const [r0, r1] = this._range;
		const span = r1 - r0;
		const step = span / this._domain.length;
		const padding = step * this._padding;

		let result = r0 + index * step + padding;

		if (this._clamp) {
			result = Math.max(r0, Math.min(r1, result));
		}

		return result;
	}

	/**
	 * Transform a range value back to a category index
	 */
	invert(value: number): number {
		const [r0, r1] = this._range;
		const span = r1 - r0;
		const step = span / this._domain.length;
		const padding = step * this._padding;

		let index = Math.floor((value - r0 - padding) / step);

		if (this._clamp) {
			index = Math.max(0, Math.min(this._domain.length - 1, index));
		}

		return index;
	}

	/**
	 * Generate ticks for the scale
	 */
	ticks(): number[] {
		return this._domain.map((_, i) => i);
	}

	/**
	 * Copy the scale
	 */
	copy(): this {
		const copy = new CategoryScale(this._domain, this._range);
		copy._padding = this._padding;
		copy._clamp = this._clamp;
		return copy as this;
	}

	/**
	 * Get the category at a given index
	 */
	getCategory(index: number): string | undefined {
		return this._domain[index];
	}

	/**
	 * Get the index of a category
	 */
	getIndex(category: string): number {
		return this._domain.indexOf(category);
	}
}
