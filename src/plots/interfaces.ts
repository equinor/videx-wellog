import { Tuplet, Triplet, Domain } from '../common/interfaces';

/**
 * Data format used by plots
 * @example [[0, 10], [10, 21], [20, 19] ... ]
 */
export type PlotData = Tuplet<number>[];

/**
 * Data format used by differential plot
 * @example [[0, 10, 0.5], [10, 21, 0.78], [20, 19, 1.21] ... ]
 */
export type DifferentialPlotData = Triplet<number>[];

/**
 * Function to control what data to plot, where
 * y is the value/range part of a plot data tuplet
 * and x is the domain part of a prop data tuplet
 * @example (y, x) => Number.isFinite(y) && Number.isFinite(x)
 */
export type DefinedFunction = (y?:number, x?:number) => boolean;

/**
 * When used in combination with a Track, it is the track's responsibillity to fetch
 * and pass down data to the plots. This is configured by providing a data accessor
 * callback function, where the track's data are made available as the input argument
 * and the returned value will be used by the plot.
 * @example data => data //default
 * @example data => data.dataSeries[1].dataPoints
 */
export type DataAccessorFunction = (data: any, plotOptions?: Map<string | number, PlotOptions>) => (PlotData|[PlotData, PlotData]|any);

/**
 * Base interface for plot options
 */
export interface PlotOptions {
  /**
   * offset position to draw the plot
   * @example 0.5 // renders the plot 50 % off from origin
   */
  offset?: number,
  /**
   * Scale type: 'linear' or 'log'. Default is 'linear'.
   */
  scale?: string,
  /**
   * Y axis (range) for plot data. Default is [0, 100].
   */
  domain?: Domain | Function,
  /**
   * Stroke color
   */
  color?: string,
  /**
   * Set condition for what data to plot. Default is v => v !== null
   */
  defined?: DefinedFunction,
  /**
   * Flag to hide/show a plot. Default is false.
   */
  hidden?: boolean,
  /**
   * Set plot orientation. Default is true (horizontally).
   */
  horizontal?: boolean;
  /**
   * @deprecated
   * use dataAccessor
   */
  data?: DataAccessorFunction,
  /**
   * Plot data accessor function when used with GraphTrack
   */
  dataAccessor?: DataAccessorFunction,
  /**
   * The number of rows in the legend section (if used with LogController) this particular plot requires
   */
  legendRows?: number,
  /**
   * Automatically filter data to current scale. This may increase performance for larger datasets,
   * as data outside the current domain is not passed to the plots. Overlap may be controlled by the
   * filterOverlapFactor option. Filtering is off (false) by default.
   */
  filterToScale?: boolean,
  /**
   * Used to control how much overlap or excess is added when filtering data compared to the current domain.
   * Ex. if the current domain is [100, 200], and with an overlap factor of 0.5, data will
   * be filtered using the extended domain [50, 250], leaving an excess of 50 units in both ends. This improves
   * the user experience during panning.
   */
  filterOverlapFactor?: number,
}

/**
 * Available line plot options
 */
export interface LinePlotOptions extends PlotOptions {
  /**
   * Stroke color
   */
  color?: string,
  /**
   * Stroke width
   */
  width?: number,
  /**
   * Dash array
   * @example [4, 4] // 4 pixels stroked, 4 pixels skipped
   */
  dash?: number[],
}

/**
 * Available dot plot options
 */
export interface DotPlotOptions extends LinePlotOptions {
  /**
   * Dot radius
   */
  radius?: number,
}

/**
 * Available area plot options
 */
export interface AreaPlotOptions extends PlotOptions {
  /**
   * Fill color
   */
  fill?: string,
  /**
   * Stroke color
   */
  color?: string,
  /**
   * Stroke width
   */
  width?: number,
  /**
   * Fill opacity
   */
  fillOpacity?: number,
  /**
   * Use the minimum value of the domain as base for the area polygon.
   * Default is true, setting to false will invert the drawing of the polygon.
   */
  useMinAsBase?: boolean,
  /**
   * If set, will also fill the opposite area in the color specified. Not set by default.
   */
  inverseColor?: string,
}

/**
 * Available differential plot serie options
 */
interface DifferentialPlotSerieOptions {
  /**
   * Scale type: 'linear' or 'log'
   */
  scale?: string,
  /**
   * Y axis (range) for plot data
   */
  domain?: Domain | Function,
  /**
   * Stroke color
   */
  color?: string,
  /**
   * Fill color of areas defined between the curves
   */
  fill?: string,
  /**
   * Stroke width
   */
  lineWidth?: number,
}
/**
 * Available differential plot serie options
 */
export interface DifferentialPlotOptions extends PlotOptions {
  /**
   * Options for data serie 1
   */
  serie1?: DifferentialPlotSerieOptions,
  /**
   * Options for data serie 2
   */
  serie2?: DifferentialPlotSerieOptions,
  /**
   * Fill opacity for both series
   */
  fillOpacity?: number,

  forceDataUpdateOnToggle?: boolean,

}
