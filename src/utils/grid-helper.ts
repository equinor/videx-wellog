import { Scale } from '../common/interfaces';
import { ScaleHandlerTicks } from '../scale-handlers/interfaces';

/** major ticks color */
const colorMajor = '#ccc';
/** minor ticks color */
const colorMinor = '#ddd';
/** major stroke width */
const strokeMajor = 2;
/** minor stroke width */
const strokeMinor = 1;

/**
 * Helper for rendering grid to canvas, used by GraphTrack
 */
export default class GridHelper {
  /**
   * Draws grid to canvas according to input scales and ticks dictionaries.
   * Ticks are dictionaries of major and minor number arrays
   */
  static drawGrid(ctx: CanvasRenderingContext2D, xscale: Scale, xticks: ScaleHandlerTicks, yscale: Scale, yticks: ScaleHandlerTicks) : void {
    const [x0, x1] = xscale.range();
    const [y0, y1] = yscale.range();

    ctx.save();
    // vertical gridlines: MUST check if scale is linear/log
    ctx.strokeStyle = colorMinor;
    ctx.lineWidth = strokeMinor * 0.5;

    xticks.minor.forEach(tick => {
      const x = xscale(tick);
      ctx.beginPath();
      ctx.moveTo(x, y0);
      ctx.lineTo(x, y1);
      ctx.stroke();
    });
    ctx.strokeStyle = colorMajor;
    ctx.lineWidth = strokeMajor * 0.5;
    xticks.major.forEach(tick => {
      const x = xscale(tick);
      ctx.beginPath();
      ctx.moveTo(x, y0);
      ctx.lineTo(x, y1);
      ctx.stroke();
    });

    // horizontal
    ctx.strokeStyle = colorMinor;
    ctx.lineWidth = strokeMinor;
    yticks.minor.forEach(tick => {
      const y = yscale(tick);
      ctx.beginPath();
      ctx.moveTo(x0, y);
      ctx.lineTo(x1, y);
      ctx.stroke();
    });
    ctx.strokeStyle = colorMajor;
    ctx.lineWidth = strokeMajor;
    yticks.major.forEach(tick => {
      const y = yscale(tick);
      ctx.beginPath();
      ctx.moveTo(x0, y);
      ctx.lineTo(x1, y);
      ctx.stroke();
    });

    ctx.restore();
  }
}
