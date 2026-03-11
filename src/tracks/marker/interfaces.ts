import { TrackOptions } from '../interfaces';

export type MarkerData = {
  /** Marker depth value */
  depth: number;

  /** Optional marker color */
  color?: string;

  /** Optional line dash pattern */
  dash?: number[];

  /** Optional custom icon render function */
  renderIcon?: (ctx: CanvasRenderingContext2D) => void;
};

export interface MarkerTrackOptions extends TrackOptions {
  /**
   * Data for all plots in the track. May be of any type or a function or promise
   * returning data. The plots will need to have a data accessor function defined, that
   * can pick the data it needs from this value.
   */
  data?: MarkerData | Promise<MarkerData> | (() => MarkerData);

  /** Whether or not to show the loader (if configured) */
  showLoader?: boolean;

  /** Fallback color for markers. Default is `black`. */
  fallbackColor?: string;
}
