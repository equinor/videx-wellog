import { line, area } from 'd3';
import Plot from './plot';
import DataHelper from '../utils/data-helper';
import { createScale } from '../tracks/graph/factory';

/**
 * Differential plot
 */
export default class DifferentialPlot extends Plot {
  /**
   * Create instance
   * @param {*} id plot id
   * @param {{
   *  serie1: {color:string,lineWidth:number,fill:string},
   *  serie2: {color:string,lineWidth:number,fill:string},
   *  fillOpacity:number,
   * }} options plot options
   */
  constructor(id, options) {
    super(id, options);
    this.scale1 = null;
    this.scale2 = null;
    this.setRange = this.setRange.bind(this);

    if (options.serie1.scale) {
      this.scale1 = createScale(
        options.serie1.scale,
        options.serie1.domain || [0, 1],
      );
    }
    if (options.serie2.scale) {
      this.scale2 = createScale(
        options.serie2.scale,
        options.serie2.domain || [0, 1],
      );
    }
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
   * Update plot options
   * @param {string} key option key to update
   * @param {*} value value to set
   */
  setOption(key, value) {
    if (!this.options) {
      this.options = {};
    }
    let ops = this.options;
    const path = key.split('.');

    if (path.length === 2 && path[0].match(/serie(1|2)/)) {
      if (!ops[path[0]]) {
        ops[path[0]] = {};
      }
      ops = ops[path[0]];

      if (path[1] === 'domain') {
        if (path[0] === 'serie2' && this.scale2) {
          this.scale2.domain(value);
        } else if (path[0] === 'serie1' && this.scale1) {
          this.scale1.domain(value);
        }
      } else if (path[1] === 'scale') {
        if (path[0] === 'serie2' && this.scale2) {
          const range = this.scale2.range();
          this.scale2 = createScale(value, this.scale2.domain()).range(range);
        } else if (path[0] === 'serie1' && this.scale1) {
          const range = this.scale1.range();
          this.scale1 = createScale(value, this.scale1.domain()).range(range);
        }
      }
      key = path[1];
    }
    ops[key] = value;
    return this;
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
        defined: def,
        hidden,
      },
    } = this;


    if (plotdata.length !== 2 || !xscale1 || !xscale2 || hidden) return;

    ctx.save();

    // render correlation areas
    const merged = DataHelper.mergeDataSeries(plotdata[0] || [], plotdata[1] || []);
    ctx.globalAlpha = fillOpacity || 0.5;

    const areaFunction1 = area()
      .context(ctx);

    if (horizontal) {
      areaFunction1
        .defined(d => def(d[1], d[0]) && def(d[2], d[0]) && xscale1(d[1]) <= xscale2(d[2]))
        .y1(d => xscale1(d[1]))
        .y0(d => xscale2(d[2]))
        .x(d => scale(d[0]));
    } else {
      areaFunction1
        .defined(d => def(d[1], d[0]) && def(d[2], def[1]) && xscale1(d[1]) >= xscale2(d[2]))
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
      areaFunction2
        .defined(d => def(d[1], d[0]) && def(d[2], d[0]) && xscale1(d[1]) >= xscale2(d[2]))
        .y1(d => xscale1(d[1]))
        .y0(d => xscale2(d[2]))
        .x(d => scale(d[0]));
    } else {
      areaFunction2
        .defined(d => def(d[1], d[0]) && def(d[2], d[0]) && xscale1(d[1]) <= xscale2(d[2]))
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
      .defined(d => def(d[1], d[0]))
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
      .defined(d => def(d[1], d[0]))
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
