import { TrackOptions } from '../interfaces';

export interface DistributionTrackOptions extends TrackOptions {
  /**
   * Data for all plots in the track. May be of any type or a function or promise
   * returning data. The plots will need to have a data accessor function defined, that
   * can pick the data it needs from this value.
   */
  data?: Promise<any> | Function | any,

  /** Whether or not to show the loader (if configured) */
  showLoader?: boolean,

  /** Orientation of track. Default is false or unset (vertical). */
  horizontal?: boolean,

  /** The height to use for discrete values. */
  discreteHeight?: number,

  /** Specifies whether the graph should interpolate between the points. */
  interpolate?: boolean,

  /** List of distribution components. */
  components?: DistributionComponents,
}

/** Represents a collection of distribution components. */
export interface DistributionComponents {
  [key: string]: {
    /** Color of the element. */
    color: string;
    /** Optional color for legend labels. */
    textColor?: string;
  };
}

export interface DistributionData {
  /** Depth of distribution. */
  depth: number,

  /** Composition of the distribution. */
  composition: CompositionEntry[];
}

export interface CompositionEntry {
  /** Name of the entry. */
  key: string;

  /** Percentage value of the entry. */
  value: number;
}
