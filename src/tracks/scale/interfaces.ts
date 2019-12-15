import { TrackOptions } from '../interfaces';

export interface ScaleTrackOptions extends TrackOptions {
  /**
   * Units to show in legend if used in LogController
   */
  units?: string,
}

export interface DualScaleTrackOptions extends ScaleTrackOptions {
  /**
   * What mode to show the scale in (0=master, 1=slave). Designed to be used
   * with the InterpolatedScaleHandler, which allows you to toggle between two
   * different scale domains.
   */
  mode?: number,
}
