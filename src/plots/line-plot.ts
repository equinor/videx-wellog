import { line } from 'd3';
import Plot from './plot';
import { D3Scale } from '../common/interfaces';
import { PlotData, LinePlotOptions } from './interfaces';

/**
 * Line plot
 */
export default class LinePlot extends Plot {
  options: LinePlotOptions;
  scale: D3Scale;
  data: PlotData;

  /**
   * Renders line plot to canvas context
   */
  plot(ctx: CanvasRenderingContext2D, scale: D3Scale) : void {
    const {
      scale: xscale,
      data: plotdata,
      options,
    } = this;

    if (!xscale || options.hidden) return;

    ctx.save();

    const lineFunction = line()
      .defined(d => options.defined(d[1], d[0]))
      .context(ctx);

    if (options.horizontal) {
      lineFunction.y(d => xscale(d[1])).x(d => scale(d[0]));
    } else {
      lineFunction.x(d => xscale(d[1])).y(d => scale(d[0]));
    }

    ctx.beginPath();
    lineFunction(plotdata);

    ctx.lineWidth = options.width;
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
