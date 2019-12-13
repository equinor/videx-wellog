import { TrackOptions } from '../interfaces';
import { PlotOptions } from '../../plots/interfaces';
import { D3Scale, Domain } from '../../common/interfaces';
import { Plot } from '../../plots';

export type PlotCreatorFunction = (config: PlotConfig, trackScale: D3Scale) => Plot;

/**
 * Config object used to define a plot in the graph track options
 */
export interface PlotConfig {
  id: string|number,
  type: string,
  options: PlotOptions,
}

/**
 * Factory object for creating an instance of a plot given a type
 */
export interface PlotFactory {
  [propName: string]: PlotCreatorFunction,
}

/**
 * Available graph track options
 */
export interface GraphTrackOptions extends TrackOptions {
  /**
   * Collection of plot config objects
   */
  plots?: PlotConfig[],
  /**
   * Data for all plots in the track. May be of any type or a function or promise
   * returning data. The plots will need to have a data accessor function defined, that
   * can pick the data it needs from this value.
   */
  data?: Promise<any> | Function | any,
  /**
   * Whether or not to show the loader or not (if configured)
   */
  showLoader?: boolean,
  /**
   * Scale type to use. This scale applies to all plots unless the plot config has its
   * own scale and domain set. Can be 'linear' or 'log'.
   */
  scale?: string,
  /**
   * Domain to use for the graph data range
   */
  domain?: Domain,
  /**
   * Determines if the legend should be clickable to toggle plots on/off when used within a
   * TrackGroup with graphLegendConfig enabled. Default is true.
   */
  togglePlotFromLegend?: boolean,
  /**
   * Plot factory to use. If using custom plot types, you need to pass an extended/custom plot
   * factory that knows how to create an instance of plot types which are not part of the libs
   * standard plot types.
   */
  plotFactory?: PlotFactory,
  /**
   * An optional function to transform the track data before being passed to the plots. This
   * is typically used to downsample data at low zoom levels.
   */
  transform?: (data:any, scale: D3Scale) => Promise<any>,
  /**
   * Set to true to always run data transform function. By default (false), transforms will only run
   * if the domain (zoom level) changes.
   */
  alwaysTransform?: boolean,
}
