export type Tuplet<T> = [T, T];

export type Triplet<T> = [T, T, T];

export type Domain = Tuplet<number> | number[];

export type Range = Tuplet<number> | number[];

export type D3Selection = any;

export interface Scale {
  (v: number) : number,
  domain() : Domain,
  range() : Range,
  invert(v:number) : number,
  ticks(nTicks?: number) : number[],
}

export interface D3Scale extends Scale {
  domain() : Domain,
  domain(newDomain?: readonly [number, number] | readonly number[]) : any,
  range() : Range,
  range(newRange?: readonly [number, number] | readonly number[]) : any,
  copy() : D3Scale,
  [propName: string] : any,
}
