import CanvasTrack from '../canvas-track';
import { ScaleHelper } from '../../utils';
import { MarkerData, MarkerTrackOptions } from './interfaces';
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
    const { ctx, scale, options } = this;
    const data: MarkerData[] = this.data ?? [];
    const {
      horizontal = false,
      fallbackColor = 'black',
      iconSize = 10,
    } = options ?? {};

    if (!ctx) return;

    const { width, height } = ctx.canvas;

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

    // Draw in reverse order to ensure higher markers are drawn on top
    [...data]
      .sort((a, b) => b.depth - a.depth)
      .forEach(d => {
        if (d.depth === undefined) return;

        ctx.strokeStyle = d.color ?? fallbackColor;
        ctx.lineWidth = 2;

        // Save and restore because we don't want the dash applied to the icon
        ctx.save();
        ctx.setLineDash(d.dash ?? []);
        renderLine(d.depth);
        ctx.restore();

        if (d.renderIcon) {
          ctx.save();

          if (horizontal) {
            const iconX = scale(d.depth);
            ctx.translate(iconX, height / 2);
            ctx.rotate(-Math.PI / 2);
          } else {
            const iconY = scale(d.depth);
            ctx.translate(width / 2, iconY);
          }

          d.renderIcon(ctx, iconSize);
          ctx.restore();
        }
      });

    ctx.restore();
  }
}
