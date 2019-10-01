import { select } from 'd3';
import Track from './track';

/**
 * Base track for tracks that renders to a canvas context
 */
export default class CanvasTrack extends Track {
  /**
   * Override to add canvas element for plotting track data
   * @param {object} trackEvent
   */
  onMount(trackEvent) {
    super.onMount(trackEvent);
    const canvas = select(trackEvent.elm).append('canvas').styles({
      position: 'absolute',
    });
    this.ctx = canvas.node().getContext('2d');
  }

  /**
   * Override to scale canvas element on resize
   * @param {object} trackEvent
   */
  onUpdate(trackEvent) {
    super.onUpdate(trackEvent);
    const {
      ctx,
    } = this;

    if (ctx) {
      select(ctx.canvas).styles({
        width: `${this.elm.clientWidth}px`,
        height: `${this.elm.clientHeight}px`,
      }).attrs({
        width: ctx.canvas.clientWidth,
        height: ctx.canvas.clientHeight,
      });
    }
  }
}
