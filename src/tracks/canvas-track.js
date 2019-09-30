import { select } from 'd3';
import Track from './track';

export default class CanvasTrack extends Track {
  // override
  onMount(trackEvent) {
    super.onMount(trackEvent);
    const canvas = select(trackEvent.elm).append('canvas').styles({
      position: 'absolute',
    });
    this.ctx = canvas.node().getContext('2d');
  }

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
