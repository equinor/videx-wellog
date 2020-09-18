import { line } from 'd3';
import Plot from './plot';
import { Scale } from '../common/interfaces';
import { PlotData, LinePlotOptions } from './interfaces';
import stepCustom from './generators/step-custom';
/**
 * Line-step plot
 */
export default class LineStepPlot extends Plot {
  options: LinePlotOptions;
  scale: Scale;
  data: PlotData;

  /**
   * Renders line-step plot to canvas context
   */
  plot(ctx: CanvasRenderingContext2D, scale: Scale) : void {
    const {
      scale: xscale,
      data: plotdata,
      options,
    } = this;

    if (!xscale || options.hidden) return;

    ctx.save();

    const lineFunction = line()
      .defined(d => true)
      .curve(stepCustom)
      .context(ctx);
    if (options.horizontal) {
      lineFunction.y(d => (d[1] === null ? NaN : xscale(d[1]))).x(d => (d[0] === null ? NaN : scale(d[0])));
    } else {
      lineFunction.x(d => (d[1] == null ? NaN : xscale(d[1]))).y(d => (d[0] == null ? NaN : scale(d[0])));
    }

    ctx.beginPath();
    lineFunction(plotdata);

    ctx.lineWidth = options.width;
    ctx.lineCap = 'square';
    ctx.strokeStyle = options.color;

    if (options.dash && Array.isArray(options.dash)) {
      ctx.setLineDash(options.dash);
      ctx.stroke();
      ctx.setLineDash([]);
    } else {
      ctx.stroke();
    }

    ctx.restore();
  }
}
