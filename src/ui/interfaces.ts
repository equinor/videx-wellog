import { ScaleHandler } from '../scale-handlers';
import { Domain, D3Selection } from '../common/interfaces';
import Track from '../tracks/track';
import LogController from './log-controller';
import { Transform } from '../tracks/interfaces';

export interface Margin {
  top: number,
  right: number,
  bottom: number,
  left: number,
}

interface OverlayEvent {
  target?: HTMLElement,
  source: HTMLElement,
  caller: LogController,
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

export interface OverlayCallbacks {
  onMouseMove?(event: OverlayMouseMoveEvent): void,
  onMouseExit?(event: OverlayMouseExitEvent): void,
  onResize?(event: OverlayResizeEvent) : void,
  onRescale?(event: OverlayRescaleEvent) : void,
}

export interface Overlay {
  create(key: string, callbacks?: OverlayCallbacks) : HTMLElement,
  register(key: string, callbacks: OverlayCallbacks) : void,
  remove(key: string) : void,
  elm: D3Selection,
  elements: { [propName: string]: HTMLElement },
  listeners: { [propName: string]: OverlayCallbacks },
  enabled: boolean,
}

export interface LogControllerResizeEvent {
  elm: HTMLElement,
  width: number,
  height: number,
  trackHeight: number,
  source: LogController,
}

export interface LogControllerOptions {
  scaleHandler?: ScaleHandler,
  maxZoom?: number,
  panExcess?: number,
  domain?: Domain,
  showTitles?: boolean,
  showLegend?: boolean,
  autoResize?: boolean,
  horizontal?: boolean,
  transitionDuration?: number,
  onResize?(event: LogControllerResizeEvent) : void,
  onTrackEnter?(elm: HTMLElement, track: Track) : void,
  onTrackUpdate?(elm: HTMLElement, track: Track) : void,
  onTrackExit?() : void,
}
