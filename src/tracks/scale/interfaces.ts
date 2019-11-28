import { TrackOptions } from '../interfaces';

export interface ScaleTrackOptions extends TrackOptions {
  units?: string,
}

export interface DualScaleTrackOptions extends ScaleTrackOptions {
  mode?: number,
}
