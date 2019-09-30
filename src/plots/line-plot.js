import { line } from 'd3';
import Plot from './plot';

export default class LinePlot extends Plot {
  get color() {
    return this.options.color || '#012';
  }

  get lineWidth() {
    return this.options.width || 1;
  }

  plot(ctx, scale) {
    const {
      scale: xscale,
      data: plotdata,
      color,
      lineWidth,
      options,
    } = this;

    const lineFunction = line()
      .x(d => xscale(d[1]))
      .y(d => scale(d[0]))
      .defined(d => d[1] !== null)
      .context(ctx);

    ctx.beginPath();
    lineFunction(plotdata);

    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;

    if (options.dash && Array.isArray(options.dash)) {
      ctx.setLineDash(options.dash);
      ctx.stroke();
      ctx.setLineDash([]);
    } else {
      ctx.stroke();
    }
  }
}
