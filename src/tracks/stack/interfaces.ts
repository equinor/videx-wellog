import { TrackOptions } from '../interfaces';

interface StackedTrackOptions extends TrackOptions {
  /*
  * Data for all plots in the track. May be of any type or a function or promise
  * returning data. The plots will need to have a data accessor function defined, that
  * can pick the data it needs from this value.
  */
  data?: Promise<any> | Function | any,

  showLabels?: boolean,
  showLines?: boolean,
}

interface TransformedAreaData {
  /**
   * Name of area, used in rendering label
   */
  name: string,
  /**
   * Start value for area
   */
  yFrom: number,
  /**
   * End value for area
   */
  yTo: number,
  /**
   * Fill color for area
   */
  color: string,
  /**
   * Opacity for area
   */
  opacity?: number,
}

interface AreaData {
  /**
   * Name of area, used in rendering label
   */
  name?: string,
  /**
   * Start value for area
   */
  from: number,
  /**
   * End value for area
   */
  to: number,
  /**
   * Fill color for area
   */
  color: {
    r: number,
    g: number,
    b: number,
    a?: number,
  },
}

export {
  StackedTrackOptions,
  TransformedAreaData,
  AreaData,
};
