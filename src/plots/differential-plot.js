import { line, area } from 'd3';
import Plot from './plot';
import DataHelper from '../utils/data-helper';

export default class DifferentialPlot extends Plot {
  constructor(id, scale1, scale2, options) {
    super(id, null, options);
    this.scale1 = scale1;
    this.scale2 = scale2;
    this.setRange = this.setRange.bind(this);
  }

  setRange(range) {
    if (this.scale1) this.scale1.range(range);
    if (this.scale2) this.scale2.range(range);
  }

  plot(ctx, scale) {
    const {
      scale1: xscale1,
      scale2: xscale2,
      data: plotdata,
      options: {
        serie1,
        serie2,
        fillOpacity,
      },
    } = this;


    if (plotdata.length !== 2) return;

    // render correlation areas
    const merged = DataHelper.mergeDataSeries(plotdata[0] || [], plotdata[1] || []);
    ctx.globalAlpha = fillOpacity || 0.5;

    const areaFunction1 = area()
      .x1(d => xscale1(d[1]))
      .x0(d => xscale2(d[2]))
      .y(d => scale(d[0]))
      .defined(d => d[1] !== null && d[2] !== null && xscale1(d[1]) > xscale2(d[2]))
      .context(ctx);

    ctx.beginPath();
    areaFunction1(merged);
    ctx.fillStyle = serie1.fill;
    ctx.fill();

    const areaFunction2 = area()
      .x1(d => xscale1(d[1]))
      .x0(d => xscale2(d[2]))
      .y(d => scale(d[0]))
      .defined(d => d[1] !== null && d[2] !== null && xscale1(d[1]) < xscale2(d[2]))
      .context(ctx);

    ctx.beginPath();
    areaFunction2(merged);
    ctx.fillStyle = serie2.fill;
    ctx.fill();

    // render line series

    ctx.globalAlpha = 1;

    const lineFunction1 = line()
      .x(d => xscale1(d[1]))
      .y(d => scale(d[0]))
      .defined(d => d[1] !== null)
      .context(ctx);

    ctx.beginPath();
    lineFunction1(plotdata[0]);
    ctx.lineWidth = serie1.lineWidth || 1;
    ctx.strokeStyle = serie1.color || 'red';
    ctx.stroke();

    const lineFunction2 = line()
      .x(d => xscale2(d[1]))
      .y(d => scale(d[0]))
      .defined(d => d[1] !== null)
      .context(ctx);

    ctx.beginPath();
    lineFunction2(plotdata[1]);
    ctx.lineWidth = serie2.lineWidth || 1;
    ctx.strokeStyle = serie2.color || 'blue';
    ctx.stroke();
  }
}
