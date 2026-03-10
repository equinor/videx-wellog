import CanvasTrack from '../canvas-track';
import { ScaleHelper } from '../../utils';
import { MarkerTrackOptions } from './interfaces';
import { OnMountEvent, OnUpdateEvent, OnRescaleEvent } from '../interfaces';
import { Scale } from '../../common/interfaces';
import { applyMajor, applyMinor } from '../../utils/guide-styles';

export class MarkerTrack extends CanvasTrack<MarkerTrackOptions> {
  /** Override of onMount from base class. */
  onMount(event: OnMountEvent) {
    super.onMount(event);

    const { options, loader } = this;

    // Load data
    if (options.data) {
      const showLoader = options.showLoader ?? Boolean(loader);

      if (showLoader && typeof options.data === 'function') {
        this.loadData(options.data, showLoader);
      } else {
        this.data = options.data;
      }
    }
  }

  /** Called by container when track is resized. */
  onUpdate(event: OnUpdateEvent) {
    super.onUpdate(event);
    this.plot();
  }

  /** Called by container when y-scale domain/transform is changed. */
  onRescale(event: OnRescaleEvent) {
    super.onRescale(event);
    this.plot();
  }

  protected plot() {
    const { ctx, scale, data } = this;

    if (!ctx) return;

    const width = ctx.canvas.clientWidth;
    const height = ctx.canvas.clientHeight;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    this.drawDepthTicks(ctx, scale, width);

    data.forEach((d: any) => {
      if (d.depth === undefined) return;

      const y = scale(d.depth);

      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    ctx.restore();
  }

  private drawDepthTicks(
    ctx: CanvasRenderingContext2D,
    scale: Scale,
    width: number,
  ) {
    const ticks = ScaleHelper.createTicks(scale);

    ctx.save();

    function drawTick(tick: number) {
      const y = scale(tick);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Minor
    applyMinor(ctx);
    ticks.minor.forEach(drawTick);

    // Major
    applyMajor(ctx);
    ticks.major.forEach(drawTick);

    ctx.restore();
  }
}
