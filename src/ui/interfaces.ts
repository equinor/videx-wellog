import WellogComponent from './wellog-component';
import { ScaleHandler } from '../scale-handlers';
import { Domain, D3Selection } from '../common/interfaces';
import Track from '../tracks/track';
import TrackGroup from './track-group';
import { Transform } from '../tracks/interfaces';

export interface Margin {
  top: number,
  right: number,
  bottom: number,
  left: number,
}

interface OverlayEvent {
  target: HTMLElement,
  source: HTMLElement,
  caller: TrackGroup,
}

export interface OverlayResizeEvent extends OverlayEvent {
  width: number,
  height: number,
}

export interface OverlayMouseMoveEvent extends OverlayEvent {
  x: number,
  y: number,
}

export interface OverlayMouseExitEvent extends OverlayEvent {}

export interface OverlayRescaleEvent extends OverlayEvent {
  transform?: Transform,
}



export interface OverlayOptions {
  onMouseMove?(event: OverlayMouseMoveEvent): void,
  onMouseExit?(event: OverlayMouseExitEvent): void,
  onResize?(event: OverlayResizeEvent) : void,
  onRescale?(event: OverlayRescaleEvent) : void,
}

export interface OverlayElement {
  elm: HTMLElement,
  options: OverlayOptions,
}

export interface Overlay {
  add(key: string, options: OverlayOptions) : HTMLElement,
  remove(key: string) : void,
  elm: D3Selection,
  elements: { [propName: string]: OverlayElement },
  enabled: boolean,
}

export interface RubberBandUpdateEvent {
  x: number,
  y: number,
  source: WellogComponent,
  getTrackElement: () => HTMLElement,
  getTrackDatum: () => any,
}

export interface RubberBandExitEvent {
  source: WellogComponent,
}

export interface TrackGroupResizeEvent {
  elm: HTMLElement,
  width: number,
  height: number,
  trackHeight: number,
  source: TrackGroup,
}

export interface TrackGroupOptions {
  scaleHandler?: ScaleHandler,
  maxZoom?: number,
  panExcess?: number,
  domain?: Domain,
  showTitles?: boolean,
  showLegend?: boolean,
  autoResize?: boolean,
  horizontal?: boolean,
  useOverlay?: boolean,
  onResize?(event: TrackGroupResizeEvent) : void,
  onTrackEnter?(elm: HTMLElement, track: Track) : void,
  onTrackUpdate?(elm: HTMLElement, track: Track) : void,
  onTrackExit?() : void,
}
