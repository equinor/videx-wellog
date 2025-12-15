import { TrackOptions } from '../interfaces';

export interface ColorStripTrackOptions extends TrackOptions {
  /**
   * Data for all plots in the track. May be of any type or a function or promise
   * returning data. The plots will need to have a data accessor function defined, that
   * can pick the data it needs from this value.
   */
  data?: Promise<any> | Function | any;

  /** Whether or not to show the loader (if configured) */
  showLoader?: boolean;

  /** Orientation of track. Default is false or unset (vertical). */
  horizontal?: boolean;
}
