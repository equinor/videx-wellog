
import { Tuplet, Triplet, Domain } from '../common/interfaces';

export type PlotData = Tuplet<number>[];

export type DifferentialPlotData = Triplet<number>[];

export type DefinedFunction = (y?:number, x?:number) => boolean;

export type DataAccessorFunction = (data: any) => (PlotData|[PlotData, PlotData]|any);

export interface PlotOptions {
  offset?: number,
  scale?: string,
  domain?: Domain,
  defined?: DefinedFunction,
  hidden?: boolean,
  horizontal?: boolean;
  data?: DataAccessorFunction, // depricated - use dataAccessor
  dataAccessor?: DataAccessorFunction,
  legendRows?: number,
}

export interface LinePlotOptions extends PlotOptions {
  color?: string,
  width?: number,
  dash?: number[],
}

export interface DotPlotOptions extends LinePlotOptions {
  radius?: number,
}

export interface AreaPlotOptions extends PlotOptions {
  fill?: string,
  color?: string,
  width?: number,
  fillOpacity?: number,
  useMinAsBase?: boolean,
  inverseColor?: string,
}

interface DifferentialPlotSerieOptions {
  scale?: string,
  domain?: Domain,
  color?: string,
  fill?: string,
  lineWidth?: number,
}

export interface DifferentialPlotOptions extends PlotOptions {
  serie1?: DifferentialPlotSerieOptions,
  serie2?: DifferentialPlotSerieOptions,
  fillOpacity?: number,
}
