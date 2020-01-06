import Plot from './plot';
import { Scale } from '../common/interfaces';
import { PlotData, DotPlotOptions } from './interfaces';
import { ScaleHelper } from '../utils';

/**
 * Dot plot
 */
export default class DotPlot extends Plot {
  options: DotPlotOptions;
  scale: Scale;
  data: PlotData;

  /**
   * Renders dot plot to canvas context
   */
  plot(ctx: CanvasRenderingContext2D, scale: Scale) : void {
    const {
      scale: xscale,
      data: plotdata,
      options,
    } = this;

    if (!xscale || options.hidden) return;

    const r = options.radius || Math.min(5, ScaleHelper.getRangeSpan(xscale) * 0.04);

    ctx.save();

    ctx.fillStyle = options.color;
    const arcL = Math.PI * 2;
    plotdata.forEach(d => {
      if (!options.defined(d[1], d[0])) return;

      ctx.beginPath();
      if (options.horizontal) {
        ctx.arc(scale(d[0]), xscale(d[1]), r, 0, arcL);
      } else {
        ctx.arc(xscale(d[1]), scale(d[0]), r, 0, arcL);
      }
      ctx.fill();
    });

    ctx.restore();
  }
}
