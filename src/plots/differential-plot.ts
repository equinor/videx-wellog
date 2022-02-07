import { line, area } from 'd3';
import Plot from './plot';
import DataHelper from '../utils/data-helper';
import { createScale } from '../tracks/graph/factory';
import { PlotData, DifferentialPlotOptions, DifferentialPlotData } from './interfaces';
import { Scale, Triplet, Range } from '../common/interfaces';


/**
 * Differential plot
 */
export default class DifferentialPlot extends Plot {
  scale: Scale;
  scale1: Scale;
  scale2: Scale;
  range: Range;
  options: DifferentialPlotOptions;
  data: [PlotData, PlotData];
  extent: [number, number];
  constructor(id : string | number, options : DifferentialPlotOptions = {}) {
    const opts: DifferentialPlotOptions = {
      serie1: {
        color: 'red',
        fill: 'red',
      },
      serie2: {
        color: 'darkblue',
        fill: 'darkblue',
      },
      ...options,
    };
    super(id, opts);

    this.scale1 = null;
    this.scale2 = null;
    this.setRange = this.setRange.bind(this);

    const { serie1, serie2 } = options;

    if (options.scale && options.domain && typeof options.domain !== 'function') {
      this.scale = createScale(
        options.scale,
        options.domain || [0, 1],
      );
      this.scale1 = this.scale;
      this.scale2 = this.scale;
    }
    if (serie1?.scale && typeof serie1.domain !== 'function') {
      this.scale1 = createScale(
        serie1.scale,
        <number[]>serie1.domain || [0, 1],
      );
    }
    if (serie2?.scale && typeof serie2.domain !== 'function') {
      this.scale2 = createScale(
        serie2.scale,
        <number[]>serie2.domain || [0, 1],
      );
    }
  }

  setData(data : any, scale?: Scale) : DifferentialPlot {
    let diffplotData = data;
    if (this.options.dataAccessor && typeof this.options.dataAccessor === 'function') {
      diffplotData = this.options.dataAccessor(data);
    }
    if (this.options.filterToScale && scale) {
      const filterOverlapFactor = this.options.filterOverlapFactor || 0.5;
      diffplotData = diffplotData.map((d: PlotData) => DataHelper.filterData(d, scale.domain(), filterOverlapFactor));
    }
    this.data = diffplotData;
    return this;
  }

  /**
   * Override of base to support multiple scales
   */
  setRange(range: Range) : DifferentialPlot {
    if (this.scale1) this.scale1.range(range);
    if (this.scale2) this.scale2.range(range);
    this.range = range;
    return this;
  }

  /**
   * Update plot options
   */
  setOption(key: string, value: any) : DifferentialPlot {
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

  updateDynamicScale(data, graphOptions): void {
    const { options, range } = this;

    if (typeof options.domain === 'function') {
      const domain = options.domain(data);
      this.scale = createScale(
        options.scale || graphOptions.scale,
        domain,
      );
      this.scale1 = this.scale;
      this.scale2 = this.scale;
    }
    if (typeof options.serie1.domain === 'function') {
      const domain = options.serie1.domain(data);
      this.scale1 = createScale(
        options.scale || graphOptions.scale,
        domain,
      );
    }
    if (typeof options.serie2.domain === 'function') {
      const domain = options.serie2.domain(data);
      this.scale2 = createScale(
        options.scale || graphOptions.scale,
        domain,
      );
    }

    if (range) {
      this.scale1.range(range);
      this.scale2.range(range);
    }
  }

  /**
   * Renders differential plot to canvas context
   */
  plot(ctx: CanvasRenderingContext2D, scale: Scale) : void {
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

    const l = Math.max(plotdata[0].length, plotdata[1].length);
    const scaleddata = [[], []];
    let min = +Infinity;
    let max = -Infinity;
    for (let i = 0; i < l; i++) {
      const a = plotdata[0][i];
      const b = plotdata[1][i];
      if (a) {
        scaleddata[0][i] = def(a[1], a[0]) ? [scale(a[0]), xscale1(a[1])] : [scale(a[0]), a[1]];
        if (scaleddata[0][i][1] < min) min = scaleddata[0][i][1];
        if (scaleddata[0][i][1] > max) max = scaleddata[0][i][1];
      }
      if (b) {
        scaleddata[1][i] = def(b[1], b[0]) ? [scale(b[0]), xscale2(b[1])] : [scale(b[0]), b[1]];
        if (scaleddata[1][i][1] < min) min = scaleddata[1][i][1];
        if (scaleddata[1][i][1] > max) max = scaleddata[1][i][1];
      }
    }

    const merged = DataHelper.mergeDataSeries(scaleddata[0] || [], scaleddata[1] || []);

    // render correlation areas
    const areaFunction1 = area<Triplet<number>>().context(ctx);
    const areaFunction2 = area<Triplet<number>>().context(ctx);

    if (horizontal) {
      areaFunction1
        .defined(
          d => def(d[1], d[0])
            && def(d[2], d[0])
        )
        .y0(max)
        .y1(d => d[1])
        .x(d => d[0]);

      areaFunction2
        .defined(
          d => def(d[1], d[0])
            && def(d[2], d[0])
        )
        .y0(min)
        .y1(d => d[2])
        .x(d => d[0]);
    } else {
      areaFunction1
        .defined(
          d => def(d[1], d[0])
            && def(d[2], d[0])
        )
        .x0(min)
        .x1(d => d[1])
        .y(d => d[0]);

      areaFunction2
        .defined(
          d => def(d[1], d[0])
            && def(d[2], d[0])
        )
        .x0(max)
        .x1(d => d[2])
        .y(d => d[0]);
    }

    ctx.save();
    ctx.globalAlpha = fillOpacity || 0.5;
    ctx.beginPath();
    areaFunction2(merged);
    ctx.clip();

    ctx.beginPath();
    areaFunction1(merged);
    ctx.fillStyle = serie1.fill;
    ctx.fill();
    ctx.restore();

    if (horizontal) {
      areaFunction1.y0(min);
      areaFunction2.y0(max);
    } else {
      areaFunction1.x0(max);
      areaFunction2.x0(min);
    }

    ctx.save();
    ctx.globalAlpha = fillOpacity || 0.5;
    ctx.beginPath();
    areaFunction1(merged);
    ctx.clip();

    ctx.beginPath();
    areaFunction2(merged);
    ctx.fillStyle = serie2.fill;
    ctx.fill();
    ctx.restore();

    // render line series
    const lineFunction1 = line()
      .defined(d => def(d[1], d[0]))
      .context(ctx);

    if (horizontal) {
      lineFunction1.y(d => d[1]).x(d => d[0]);
    } else {
      lineFunction1.x(d => d[1]).y(d => d[0]);
    }

    ctx.save();
    ctx.globalAlpha = 1;
    ctx.beginPath();
    lineFunction1(scaleddata[0]);
    ctx.lineWidth = serie1.lineWidth || 1;
    ctx.strokeStyle = serie1.color || 'red';
    ctx.stroke();

    const lineFunction2 = line()
      .defined(d => def(d[1], d[0]))
      .context(ctx);

    if (horizontal) {
      lineFunction2.y(d => d[1]).x(d => d[0]);
    } else {
      lineFunction2.x(d => d[1]).y(d => d[0]);
    }

    ctx.beginPath();
    lineFunction2(scaleddata[1]);
    ctx.lineWidth = serie2.lineWidth || 1;
    ctx.strokeStyle = serie2.color || 'blue';
    ctx.stroke();

    ctx.restore();
  }
}
