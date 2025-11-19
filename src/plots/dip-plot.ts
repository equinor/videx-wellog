import Plot from './plot';
import { Scale } from '../common/interfaces';
import { DipPlotDataEntry, DipPlotOptions } from './interfaces';
import DipShape from './dip-shape';

/**
 * Dip plot
 */
export default class DipPlot extends Plot<DipPlotOptions> {
  /**
   * Renders dip plot to canvas context
   */
  plot(ctx: CanvasRenderingContext2D, scale: Scale) : void {
    const {
      scale: xscale,
      data: plotdata,
      options,
    } = this;

    if (!xscale || options.hidden) return;

    ctx.save();

    plotdata?.forEach((d: DipPlotDataEntry) => {
      if (!options.defined(...d)) return;
      const category = d[3];
      // move azimuth start point so that zero points vertically up, or "north"
      const azimuth = d[2] - 90;
      // convert from degrees to radians
      const azimuthInRadians = azimuth * (Math.PI / 180);
      const x1 = options.horizontal ? scale(d[0]) : xscale(d[1]);
      const y1 = options.horizontal ? xscale(d[1]) : scale(d[0]);
      const dipSize = options.dipSize;
      const dipShape = new DipShape(ctx, category, azimuthInRadians, x1, y1, dipSize);
      dipShape.draw();
    });

    ctx.restore();
  }
}
