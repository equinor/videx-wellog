import { line } from 'd3';
import Plot from './plot';

/**
 * Line plot
 */
export default class LinePlot extends Plot {
  /**
   * @returns {string} plot color
   */
  get color() {
    return this.options.color || '#012';
  }

  /**
   * @returns {number} line width
   */
  get lineWidth() {
    return this.options.width || 1;
  }

  /**
   * Renders line plot to canvas context
   * @param {CanvasRenderingContext2D} ctx canvas context instance
   * @param {d3.scale} scale y-scale
   */
  plot(ctx, scale) {
    const {
      scale: xscale,
      data: plotdata,
      color,
      lineWidth,
      options,
    } = this;

    ctx.save();

    const lineFunction = line().defined(d => d[1] !== null).context(ctx);

    if (options.horizontal) {
      lineFunction.y(d => xscale(d[1])).x(d => scale(d[0]));
    } else {
      lineFunction.x(d => xscale(d[1])).y(d => scale(d[0]));
    }

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

    ctx.restore();
  }
}
