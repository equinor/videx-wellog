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
  /** set scale's current domain */
  domain(newDomain?: Domain) : Scale,
  /** get scale's current range */
  range() : Range,
  /** set scale's current range */
  range(newRange?: Range) : Scale,
  /** inverse scale range value to domain value */
  invert(v:number) : number,
  /** get a list of ticks based on scale domain and range, and optionally desired number of ticks */
  ticks(nTicks?: number) : number[],
  /** clone scale */
  copy() : Scale,
  /** Allow any other properties */
  [propName:string]: any,
}
