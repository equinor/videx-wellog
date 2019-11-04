import GraphTrack from './graph-track';
import { GridHelper, ScaleHelper } from '../../utils/index';

/**
 * Track that renders plots horizontally. Designed to be used
 * stand-alone.
 */
export default class HorizontalGraphTrack extends GraphTrack {
  constructor(id, options) {
    super(id, options);
    this.plots.forEach(plot => { plot.options.horizontal = true; });
  }

  /**
   * Set new range to track and plot scales
   */
  updateRange() {
    const range = [this.elm.clientHeight, 0];
    this.trackScale.range(range);
    this.plots.forEach(plot => {
      let r = range;
      if (Number.isFinite(plot.options.offset)) {
        const [r0, r1] = range;
        r = [r0, plot.options.offset * Math.abs(r0 - r1)];
      }
      plot.setRange(r);
    });
    this.plot();
  }

  /**
   * Plot graph track
   */
  plot() {
    const {
      ctx,
      scale: xscale,
      trackScale: yscale,
      plots,
    } = this;

    if (!ctx) return;

    const yticks = yscale.base ?
      ScaleHelper.createLogTicks(yscale) :
      ScaleHelper.createLinearTicks(yscale);

    const xticks = ScaleHelper.createTicks(xscale);

    ctx.save();
    ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);

    GridHelper.drawGrid(ctx, xscale, xticks, yscale, yticks);
    ctx.restore();
    plots.forEach(plot => plot.plot(ctx, xscale));
  }
}
