import Plot from './plot';

export default class DotPlot extends Plot {
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
      options,
    } = this;

    const r = options.radius || Math.min(5, xscale.range()[1] * 0.04);

    ctx.fillStyle = color;
    const arcL = Math.PI * 2;
    plotdata.forEach(d => {
      ctx.beginPath();
      ctx.arc(xscale(d[1]), scale(d[0]), r, 0, arcL);
      ctx.fill();
    });
  }
}
