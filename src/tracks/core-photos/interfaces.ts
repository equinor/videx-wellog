import { TrackOptions } from '../interfaces';


/**
 * Available core photos track options
 */
export interface CorePhotosTrackOptions extends TrackOptions {
  data?: Promise<any> | Function | any,
}
