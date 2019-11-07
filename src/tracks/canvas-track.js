import { select } from 'd3';
import Track from './track';
import { setProps } from '../utils';

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
    const canvas = select(trackEvent.elm).append('canvas').style('position', 'absolute');
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
      elm,
    } = this;

    if (ctx) {
      const canvas = select(ctx.canvas);
      const props = {
        styles: {
          width: `${elm.clientWidth}px`,
          height: `${elm.clientHeight}px`,
        },
        attrs: {
          width: elm.clientWidth,
          height: elm.clientHeight,
        },
      };
      setProps(canvas, props);
    }
  }
}
