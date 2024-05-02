import { select } from 'd3-selection';
import Track from './track';
import { setProps } from '../utils';
import { TrackOptions, OnMountEvent, OnUpdateEvent } from './interfaces';

/**
 * Base track for tracks that renders to a canvas context
 */
export default class CanvasTrack<TOptions extends TrackOptions> extends Track<TOptions> {
  ctx: CanvasRenderingContext2D;

  /**
   * Override to add canvas element for plotting track data
   */
  onMount(trackEvent: OnMountEvent) : void {
    super.onMount(trackEvent);
    const canvas = select(trackEvent.elm).append('canvas').style('position', 'absolute');
    this.ctx = canvas.node().getContext('2d');
  }

  /**
   * Override to scale canvas element on resize
   */
  onUpdate(trackEvent: OnUpdateEvent) {
    super.onUpdate(trackEvent);
    const {
      ctx,
      elm,
    } = this;

    const boundingClient = elm.getBoundingClientRect();

    if (ctx) {
      const canvas = select(ctx.canvas);
      const props = {
        styles: {
          width: `${boundingClient.width}px`,
          height: `${elm.clientHeight}px`,
        },
        attrs: {
          width: boundingClient.width,
          height: elm.clientHeight,
        },
      };
      setProps(canvas, props);
    }
  }
}
