import { area } from 'd3-shape';
import Plot from './plot';
import { PlotData, AreaPlotOptions } from './interfaces';
import { Scale } from '../common/interfaces';

/**
 * Area plot
 */
export default class AreaPlot extends Plot<AreaPlotOptions> {

  /**
   * Renders area plot to canvas context
   * @param ctx canvas context instance
   * @param scale y-scale
   */
  plot(ctx: CanvasRenderingContext2D, scale: Scale) : void {
    const {
      scale: xscale,
      data: plotdata,
      options,
    } = this;

    if (!xscale || options.hidden) return;

    const useMinAsBase = options.useMinAsBase === undefined ? true : options.useMinAsBase;

    const [d0, d1] = xscale.domain();
    const dmin = Math.min(d0, d1);
    const dmax = Math.max(d0, d1);

    const rmin = xscale(dmin);
    const rmax = xscale(dmax);

    const zeroValue = useMinAsBase ? rmin : rmax;

    let index = 0;
    const splitted = plotdata.reduce((acc, v) => {
      if (acc.length > 0 && v[1] === null) {
        acc[++index] = [];
      } else {
        acc[index].push(v);
      }
      return acc;
    }, [[]]);

    splitted.forEach(data => {
      ctx.save();

      const areaFunction = area()
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
        const inverseValue = useMinAsBase ? rmax : rmin;

        const inverseAreaFunction = area()
          .context(ctx);

        if (options.horizontal) {
          inverseAreaFunction
            .y1(d => xscale(d[1]))
            .y0(inverseValue)
            .x(d => scale(d[0]));
        } else {
          inverseAreaFunction
            .x1(d => xscale(d[1]))
            .x0(inverseValue)
            .y(d => scale(d[0]));
        }
        ctx.beginPath();
        inverseAreaFunction(data);
        ctx.fillStyle = options.inverseColor;
        ctx.fill();
      }

      ctx.beginPath();
      areaFunction(data);
      ctx.lineWidth = options.width;

      ctx.fillStyle = options.fill || options.color;
      ctx.fill();

      ctx.globalAlpha = 1;
      ctx.strokeStyle = options.color;
      ctx.stroke();

      ctx.restore();
    });
  }
}
