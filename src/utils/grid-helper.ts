import { Scale } from '../common/interfaces';
import { ScaleHandlerTicks } from '../scale-handlers/interfaces';
import { applyMajor, applyMinor } from './guide-styles';

/** Helper for rendering grid to canvas, used by GraphTrack. */
export default class GridHelper {
  /**
   * Draws grid to canvas according to input scales and ticks dictionaries.
   * Ticks are dictionaries of major and minor number arrays
   */
  static drawGrid(
    ctx: CanvasRenderingContext2D,
    xscale: Scale,
    xticks: ScaleHandlerTicks,
    yscale: Scale,
    yticks: ScaleHandlerTicks,
  ): void {
    const xScaleRange = xscale.range();
    const yScaleRange = yscale.range();

    function drawVerticalTick(tick: number) {
      const x = xscale(tick);
      ctx.beginPath();
      const [first, ...rest] = yScaleRange;
      ctx.moveTo(x, first);
      rest.forEach(y => ctx.lineTo(x, y));
      ctx.stroke();
    }

    function drawHorizontalTick(tick: number) {
      const y = yscale(tick);
      ctx.beginPath();
      const [first, ...rest] = xScaleRange;
      ctx.moveTo(first, y);
      rest.forEach(x => ctx.lineTo(x, y));
      ctx.stroke();
    }

    ctx.save();

    // Vertical - MUST check if scale is linear/log
    applyMinor(ctx, 0.5);
    xticks.minor.forEach(drawVerticalTick);

    applyMajor(ctx, 0.5);
    xticks.major.forEach(drawVerticalTick);

    // Horizontal
    applyMinor(ctx);
    yticks.minor.forEach(drawHorizontalTick);

    applyMajor(ctx);
    yticks.major.forEach(drawHorizontalTick);

    ctx.restore();
  }
}
