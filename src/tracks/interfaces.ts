import Track from './track';
import { D3Selection, D3Scale } from '../common/interfaces';
import { LegendConfig } from '../utils/legend-helper';

export interface Transform {
  x: number,
  y: number,
  k: number,
}

interface TrackEvent {
  elm: HTMLElement,
  [propType: string]: any,
}

export interface OnMountEvent extends TrackEvent {
  scale: D3Scale,
}

export interface OnUnmountEvent {
  elm?: HTMLElement,
}

export interface OnUpdateEvent extends TrackEvent {
  scale?: D3Scale,
}

export interface OnRescaleEvent extends TrackEvent {
  scale?: D3Scale,
  transform?: Transform,
}

export interface TrackOptions {
  label?: string,
  abbr?: string,
  loader?: D3Selection,
  legendConfig?: LegendConfig;
  horizontal?: boolean,
  width?: number,
  maxWidth?: number,
  onMount?(event: OnMountEvent, track: Track) : void,
  onUnmount?(event: OnUnmountEvent, track: Track) : void,
  onUpdate?(event: OnUpdateEvent, track: Track) : void,
  onRescale?(event: OnRescaleEvent, track: Track) : void,
  onError?(error: Error | string, track: Track) : void,
}
