import CanvasTrack from '../canvas-track';
import { ScaleHelper } from '../../utils';
import { MarkerTrackOptions } from './interfaces';
import { OnMountEvent, OnUpdateEvent, OnRescaleEvent } from '../interfaces';
import { Scale } from '../../common/interfaces';
import { applyMajor, applyMinor } from '../../utils/guide-styles';

const createVerticalLineRenderer =
  (ctx: CanvasRenderingContext2D, scale: Scale, height: number) =>
  (value: number) => {
    const x = scale(value);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  };

const createHorizontalLineRenderer =
  (ctx: CanvasRenderingContext2D, scale: Scale, width: number) =>
  (value: number) => {
    const y = scale(value);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  };

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
    const { ctx, scale, data, options } = this;
    const { horizontal = false } = options ?? {};

    if (!ctx) return;

    const width = ctx.canvas.clientWidth;
    const height = ctx.canvas.clientHeight;

    const renderLine = horizontal
      ? createVerticalLineRenderer(ctx, scale, height)
      : createHorizontalLineRenderer(ctx, scale, width);

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // ===================== DEPTH MARKERS =====================
    const depthTicks = ScaleHelper.createTicks(scale);

    applyMinor(ctx);
    depthTicks.minor.forEach(renderLine);

    applyMajor(ctx);
    depthTicks.major.forEach(renderLine);
    // =========================================================

    data.forEach((d: any) => {
      if (d.depth === undefined) return;

      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      renderLine(d.depth);
    });

    ctx.restore();
  }
}
