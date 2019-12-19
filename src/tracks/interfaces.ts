import Track from './track';
import { D3Scale, Scale, Domain } from '../common/interfaces';
import { LegendConfig } from '../utils/legend-helper';

export interface Transform {
  x: number,
  y: number,
  k: number,
}

interface TrackEvent {
  [propType: string]: any,
}

export interface OnMountEvent extends TrackEvent {
  elm: HTMLElement,
  scale: D3Scale,
}

export interface OnUnmountEvent {
  elm?: HTMLElement,
}

export interface OnUpdateEvent extends TrackEvent {
  elm: HTMLElement,
  scale?: D3Scale,
}

export interface OnRescaleEvent extends TrackEvent {
  scale?: Scale,
  domain?: Domain,
  transform?: Transform,
}

export interface TrackOptions {
  /**
   * Label to use in title if used with TrackGrouop
   */
  label?: string,
  /**
   * Short label to use in title if used with TrackGrouop
   */
  abbr?: string,
  /**
   * An optional loader element that will be made visible during loading
   */
  loader?: Element,
  /**
   * A config object used to display track legend if used with LogController
   */
  legendConfig?: LegendConfig;
  /**
   * Orientation of track. Default is false or unset (vertical).
   */
  horizontal?: boolean,
  /**
   * Relative track width when used in a LogController, i.e. a track with width set to
   * 3 will be three times wider than tracks set to width 1.
   */
  width?: number,
  /**
   * Max width of track in pixels
   */
  maxWidth?: number,
  /**
   * Hook when track is mounted to the DOM
   * @param event event data
   * @param track track instance reference
   */
  onMount?(event: OnMountEvent, track: Track) : void,
  /**
   * Hook when track is unmounted from the DOM
   * @param event event data
   * @param track track instance reference
   */
  onUnmount?(event: OnUnmountEvent, track: Track) : void,
  /**
   * Hook when track is updated in the DOM model.
   * @param event event data
   * @param track track instance reference
   */
  onUpdate?(event: OnUpdateEvent, track: Track) : void,
  /**
   * Hook when track is being rescaled, for example from user interaction
   * if used with a LogController.
   * @param event event data
   * @param track track instance reference
   */
  onRescale?(event: OnRescaleEvent, track: Track) : void,
  /**
   * Hook if a track is set in an error state
   * @param event event data
   * @param track track instance reference
   */
  onError?(error: Error | string, track: Track) : void,
}
