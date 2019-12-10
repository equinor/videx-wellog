/** Generic array of two values [T, T] */
export type Tuplet<T> = [T, T];

/** Generic array of three values [T, T, T] */
export type Triplet<T> = [T, T, T];

/** Domain of a scale. Represented as a number array on the form [from, to] */
export type Domain = Tuplet<number> | number[];

/** Range to scale a domain value to. Represented as a number array on the form [from, to] */
export type Range = Tuplet<number> | number[];


/** Interface to abstract d3 selection */
export type D3Selection = any;

/**
 * The scale interface supports a subset of the scale in d3js.
 * It is defined to support using scaling functions that interpolates or
 * otherwise changes the input values (decorator pattern).
 */
export interface Scale {
  /** scale value from domain to range */
  (v: number) : number,
  /** get scale's current domain */
  domain() : Domain,
  /** get scale's current range */
  range() : Range,
  /** inverse scale range value to domain value */
  invert(v:number) : number,
  /** get a list of ticks based on scale domain and range, and optionally desired number of ticks */
  ticks(nTicks?: number) : number[],
}

/**
 * Interface to abstract d3 scaleLinear and scaleLog
 */
export interface D3Scale extends Scale {
  domain() : Domain,
  domain(newDomain?: readonly [number, number] | readonly number[]) : any,
  range() : Range,
  range(newRange?: readonly [number, number] | readonly number[]) : any,
  copy() : D3Scale,
  base?() : number,
}
