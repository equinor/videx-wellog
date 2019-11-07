import { line, area } from 'd3';
import Plot from './plot';
import DataHelper from '../utils/data-helper';

/**
 * Differential plot
 */
export default class DifferentialPlot extends Plot {
  /**
   * Create instance
   * @param {*} id plot id
   * @param {d3.scale} scale1 scale for data serie 1 values
   * @param {d3.scale} scale2 scale for data serie 2 values
   * @param {{
   *  serie1: {color:string,lineWidth:number,fill:string},
   *  serie2: {color:string,lineWidth:number,fill:string},
   *  fillOpacity:number,
   * }} options plot options
   */
  constructor(id, scale1, scale2, options) {
    super(id, null, options);
    this.scale1 = scale1;
    this.scale2 = scale2;
    this.setRange = this.setRange.bind(this);
  }

  /**
   * Override of base to support multiple scales
   * @param {number[]} range new range
   */
  setRange(range) {
    if (this.scale1) this.scale1.range(range);
    if (this.scale2) this.scale2.range(range);
  }

  /**
   * Renders differential plot to canvas context
   * @param {CanvasRenderingContext2D} ctx canvas context instance
   * @param {d3.scale} scale y-scale
   */
  plot(ctx, scale) {
    const {
      scale1: xscale1,
      scale2: xscale2,
      data: plotdata,
      options: {
        serie1,
        serie2,
        fillOpacity,
        horizontal,
      },
    } = this;


    if (plotdata.length !== 2) return;

    ctx.save();

    // render correlation areas
    const merged = DataHelper.mergeDataSeries(plotdata[0] || [], plotdata[1] || []);
    ctx.globalAlpha = fillOpacity || 0.5;

    const areaFunction1 = area()
      .context(ctx);

    if (horizontal) {
      areaFunction1.defined(d => d[1] !== null && d[2] !== null && xscale1(d[1]) < xscale2(d[2]))
        .y1(d => xscale1(d[1]))
        .y0(d => xscale2(d[2]))
        .x(d => scale(d[0]));
    } else {
      areaFunction1.defined(d => d[1] !== null && d[2] !== null && xscale1(d[1]) > xscale2(d[2]))
        .x1(d => xscale1(d[1]))
        .x0(d => xscale2(d[2]))
        .y(d => scale(d[0]));
    }
    ctx.beginPath();
    areaFunction1(merged);
    ctx.fillStyle = serie1.fill;
    ctx.fill();

    const areaFunction2 = area().context(ctx);

    if (horizontal) {
      areaFunction2.defined(d => d[1] !== null && d[2] !== null && xscale1(d[1]) > xscale2(d[2]))
        .y1(d => xscale1(d[1]))
        .y0(d => xscale2(d[2]))
        .x(d => scale(d[0]));
    } else {
      areaFunction2.defined(d => d[1] !== null && d[2] !== null && xscale1(d[1]) < xscale2(d[2]))
        .x1(d => xscale1(d[1]))
        .x0(d => xscale2(d[2]))
        .y(d => scale(d[0]));
    }

    ctx.beginPath();
    areaFunction2(merged);
    ctx.fillStyle = serie2.fill;
    ctx.fill();

    // render line series

    ctx.globalAlpha = 1;

    const lineFunction1 = line()
      .defined(d => d[1] !== null)
      .context(ctx);

    if (horizontal) {
      lineFunction1.y(d => xscale1(d[1])).x(d => scale(d[0]));
    } else {
      lineFunction1.x(d => xscale1(d[1])).y(d => scale(d[0]));
    }

    ctx.beginPath();
    lineFunction1(plotdata[0]);
    ctx.lineWidth = serie1.lineWidth || 1;
    ctx.strokeStyle = serie1.color || 'red';
    ctx.stroke();

    const lineFunction2 = line()
      .defined(d => d[1] !== null)
      .context(ctx);

    if (horizontal) {
      lineFunction2.y(d => xscale2(d[1])).x(d => scale(d[0]));
    } else {
      lineFunction2.x(d => xscale2(d[1])).y(d => scale(d[0]));
    }

    ctx.beginPath();
    lineFunction2(plotdata[1]);
    ctx.lineWidth = serie2.lineWidth || 1;
    ctx.strokeStyle = serie2.color || 'blue';
    ctx.stroke();

    ctx.restore();
  }
}
