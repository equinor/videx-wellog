import WellogComponent from './wellog-component';
import { ScaleHandler } from '../scale-handlers';
import { Domain, D3Selection } from '../common/interfaces';
import Track from '../tracks/track';
import TrackGroup from './track-group';

export interface Margin {
  top: number,
  right: number,
  bottom: number,
  left: number,
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
  overlay?: boolean,
  onResize?(event: TrackGroupResizeEvent) : void,
  onTrackEnter?(elm: HTMLElement, track: Track) : void,
  onTrackUpdate?(elm: HTMLElement, track: Track) : void,
  onTrackExit?() : void,
}
