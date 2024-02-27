/* eslint-disable no-continue */
import { Line, line } from 'd3-shape';
import Plot from './plot';
import { Scale, Tuplet } from '../common/interfaces';
import { PlotData, LinePlotOptions } from './interfaces';

/**
 * Line plot
 */
export default class LinePlot extends Plot<LinePlotOptions> {
  /**
   * Renders line plot to canvas context
   */
  plot(ctx: CanvasRenderingContext2D, scale: Scale) : void {
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

    // Plot wrapping segments
    if (options.allowWrapping) {
      this.plotWrapped(ctx, lineFunction);
    }

    ctx.restore();
  }

  /**
   * Renders segments outside of domain.
   */
  plotWrapped(ctx: CanvasRenderingContext2D, lineFunction: Line<[number, number]>) {
    const {
      scale: xscale,
      data: plotdata,
      options,
    } = this;

    const isLogarithmic = (options.scale === 'log');

    // Return if plot has no points, or is horizontal
    // TODO: Add support for horizontal plots?
    if (!plotdata?.length || options.horizontal) {
      return;
    }

    ctx.setLineDash(options.dashWrapped || [2, 3]);

    /** Helper function for plotting segment with given displacement. */
    const plotSegment = (segment: PlotData, disp: number) => {
      ctx.beginPath();
      lineFunction(segment.map(
        ([y, x]) => (isLogarithmic ? [y, 10 ** (Math.log10(x) + disp)] : [y, x + disp]),
      ));
      ctx.stroke();
    };

    const [min, max] = isLogarithmic ? xscale.domain().map(Math.log10) : xscale.domain();
    const range = (max - min);

    let prev: Tuplet<number>;
    let segment: PlotData = [];

    // Distance to displace the segment in order to wrap
    let segmentDisp: number;

    for (let i = 0; i < plotdata.length; i++) {
      const cur = plotdata[i];

      // If point is not valid, clear prev and skip
      if (cur[1] === null || cur[1] === undefined) {
        prev = null;
        continue;
      }

      const curX = isLogarithmic ? Math.log10(cur[1]) : cur[1];
      if (curX > max || curX < min) {
        segmentDisp = (curX > max) ? -range : range;
        if (segment.length === 0 && prev) {
          segment.push(prev);
        }
        segment.push(cur);
      } else if (segment.length > 0) {
        segment.push(cur);
        plotSegment(segment, segmentDisp);
        segment = [];
      }
      prev = cur;
    }

    // If the data ends with point outside of range
    if (segment.length > 0) {
      plotSegment(segment, segmentDisp);
    }

    ctx.setLineDash([]);
  }
}
