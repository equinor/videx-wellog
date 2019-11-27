import { area } from 'd3';
import Plot from './plot';

/**
 * Area plot
 */
export default class AreaPlot extends Plot {
  /**
   * Create instance
   * @param {*} id plot id
   * @param {{
   *  useMinAsBase:boolean,
   *  color:string,
   *  inverseColor:string,
   *  width:number,
   *  fill:string,
   *  fillOpacity:number,
   * }} options plot options
   */
  constructor(id, options) {
    super(id, options);
    this.useMinAsBase = options.useMinAsBase === undefined ? true : options.useMinAsBase;
  }

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
   * Renders area plot to canvas context
   * @param {CanvasRenderingContext2D} ctx canvas context instance
   * @param {d3.scale} scale y-scale
   */
  plot(ctx, scale) {
    const {
      scale: xscale,
      data: plotdata,
      color,
      lineWidth,
      useMinAsBase,
      options,
    } = this;

    if (!xscale || options.hidden) return;

    const [dmin, dmax] = xscale.domain();
    const zeroValue = xscale(
      useMinAsBase ? Math.min(dmin, dmax) : Math.max(dmin, dmax),
    );

    ctx.save();

    const areaFunction = area()
      .defined(d => options.defined(d[1], d[0]))
      .context(ctx);

    if (options.horizontal) {
      areaFunction
        .y1(d => xscale(d[1]))
        .y0(zeroValue)
        .x(d => scale(d[0]));
    } else {
      areaFunction
        .x1(d => xscale(d[1]))
        .x0(zeroValue)
        .y(d => scale(d[0]));
    }

    ctx.globalAlpha = options.fillOpacity || 1;

    if (options.inverseColor) {
      const inverseValue = xscale(
        useMinAsBase ? Math.max(dmin, dmax) : Math.min(dmin, dmax),
      );

      const inverseAreaFunction = area()
        .defined(d => options.defined(d[1], d[0]))
        .context(ctx);

      if (options.horizontal) {
        inverseAreaFunction
          .y1(d => Math.max(0, xscale(d[1])))
          .y0(inverseValue)
          .x(d => scale(d[0]));
      } else {
        inverseAreaFunction
          .x1(d => Math.max(0, xscale(d[1])))
          .x0(inverseValue)
          .y(d => scale(d[0]));
      }
      ctx.beginPath();
      inverseAreaFunction(plotdata);
      ctx.fillStyle = options.inverseColor;
      ctx.fill();
    }

    ctx.beginPath();
    areaFunction(plotdata);
    ctx.lineWidth = lineWidth;

    ctx.fillStyle = options.fill || color;
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.strokeStyle = color;
    ctx.stroke();

    ctx.restore();
  }
}
