import CanvasTrack from '../canvas-track';
import { createScale, plotFactory as defaultPlotFactory } from './factory';
import {
  GridHelper,
  ScaleHelper,
  debouncer,
  DebounceFunction,
} from '../../utils';
import { Plot } from '../../plots';
import { PlotOptions } from '../../plots/interfaces';
import { Scale } from '../../common/interfaces';
import { GraphTrackOptions } from './interfaces';
import { OnMountEvent, OnRescaleEvent, OnUpdateEvent } from '../interfaces';
import { ScaleHandlerTicks } from '../../scale-handlers';

const defaultOptions = {
  scale: 'linear',
  domain: [0, 100],
  togglePlotFromLegend: true,
  forceDataUpdateOnToggle: false,
  plotFactory: defaultPlotFactory,
};

/**
 * An extension to CanvasTrack for rendering plots
 *
 * See ./readme.md in source code for more info
 */
export default class GraphTrack extends CanvasTrack<GraphTrackOptions> {
  trackScale: Scale;
  plots: Plot[];
  debounce: DebounceFunction;

  private _transformedData?: any;
  private _transformCondition?: number = null;

  constructor(id: string | number, options: GraphTrackOptions = {}) {
    super(id, {
      ...defaultOptions,
      ...options,
    });

    this.trackScale = createScale(this.options.scale, this.options.domain);

    this.plots = [];

    if (this.options.plots) {
      this.plots = options.plots.map(p => {
        const createPlot = this.options.plotFactory[p.type];
        if (!createPlot)
          throw Error(`No factory function for creating '${p.type}'-plot!`);
        return createPlot(p, this.trackScale);
      });
    }

    this.plot = this.plot.bind(this);
    this.prepareData = this.prepareData.bind(this);
    this.debounce = debouncer();
  }

  /**
   * Override of onMount to load track data
   */
  onMount(trackEvent: OnMountEvent): void {
    super.onMount(trackEvent);
    const { options, loader } = this;

    if (options.data) {
      const showLoader = options.showLoader ?? Boolean(loader);

      if (showLoader && typeof options.data === 'function') {
        this.loadData(options.data, showLoader);
      } else {
        this.data = options.data;
      }
    }
  }

  /**
   * Override to allow data transformations, like resampling and filtering
   */
  onRescale(trackEvent: OnRescaleEvent): void {
    super.onRescale(trackEvent);
    this.prepareData();
    this.plot();
  }

  /**
   * Override to resize plots and scales
   */
  onUpdate(trackEvent: OnUpdateEvent): void {
    super.onUpdate(trackEvent);
    this.updateRange();
    this.plot();
  }

  /**
   * Callback after data loaded, using loadData.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onDataLoaded(data): void {
    this._transformCondition = null;
    this._transformedData = null;
    this.prepareData();
    this.updateDynamicScales();
    this.plot();
  }

  /**
   * Create range based on domain.
   */
  createRange(isHorizontal: boolean): number[] {
    const domain = this.trackScale.domain();
    const domainIndex = domain.length - 1;
    const elmWidth = isHorizontal
      ? this.elm.clientHeight
      : this.elm.clientWidth;
    const padding = this.options.padding?.size ?? 0;
    // If the total padding to be applied to the track is greater than the available width,
    // or the value provided is a negative value,
    // set the padding to zero
    const disablePadding = padding * 2 > elmWidth || padding < 0;
    const trackPadding = disablePadding ? 0 : Math.abs(padding);
    const trackWidth = elmWidth - trackPadding * 2;
    const range = [];

    // Add start entry
    range.push(trackPadding);

    // If the domain has more than two entries (start and end),
    // add the others equally spaced along the range
    for (let i = 1; i < domainIndex; i++) {
      const rangeEntry = (trackWidth / domainIndex) * i + trackPadding;
      range.push(rangeEntry);
    }

    // Add last entry
    range.push(elmWidth - trackPadding);

    // Reverse the array for horizontal mode
    if (isHorizontal) {
      const horizontalRange = range.reverse();
      return horizontalRange;
    }
    return range;
  }

  /**
   * Set new range to track and plot scales
   */
  updateRange(): void {
    const range = this.createRange(this.options.horizontal);

    this.trackScale.range(range);
    this.plots.forEach(plot => {
      let r = range;
      if (Number.isFinite(plot.options.offset)) {
        const [r0, r1] = range;
        const trackPadding = this.options.padding?.size ?? 0;

        r = this.options.horizontal
          ? [r0 - plot.options.offset * Math.abs(r0 - r1) + trackPadding, r1]
          : [plot.options.offset * (r1 - r0) + trackPadding, r1];
      }
      plot.options.horizontal = this.options.horizontal;
      plot.setRange(r);
    });
  }

  /**
   * Execute configured transform function if applicable on the track's data
   */
  prepareData(): void {
    const { data, options, _transformCondition: previousCondition } = this;

    this.setPlotData(this._transformedData || data);

    if (options.transform) {
      const currentCondition = this.getCurrentCondition();
      if (
        options.alwaysTransform ||
        !previousCondition ||
        previousCondition !== currentCondition
      ) {
        if (!this._transformedData) {
          this.updateTransform(currentCondition);
        } else {
          this.scheduleUpdateTransform(currentCondition);
        }
      }
    }
  }

  updateDynamicScales(): void {
    const { plots, data } = this;
    plots.forEach(plot => {
      plot.updateDynamicScale(data, this.options);
    });
  }

  getCurrentCondition(): number {
    return Math.round(ScaleHelper.getDomainSpan(this.scale, false) * 10);
  }

  scheduleUpdateTransform(condition: number): void {
    this.debounce(() => this.updateTransform(condition));
  }

  updateTransform(condition: number): void {
    const { data, scale, options, plot } = this;

    this._transformCondition = condition;
    options.transform(data, scale).then(transformedData => {
      if (this._transformCondition === condition) {
        this._transformedData = transformedData;
        this.setPlotData(transformedData);
        plot();
      }
    });
  }

  /**
   * Set option on a Plot by id
   */
  setPlotOption(id: string | number, key: string, value: any): GraphTrack {
    const plot = this.plots.find(d => d.id === id);
    if (plot) {
      plot.setOption(key, value);
      this.plot();
      return this;
    }
    throw Error(`Plot not found with id ${id}`);
  }

  /**
   * Set padding on track
   */
  setPadding(): void {
    const {
      ctx,
      options: { horizontal, padding },
    } = this;

    const trackPadding = padding?.size;
    const elmHeight = horizontal ? this.elm.clientWidth : this.elm.clientHeight;
    const elmWidth = horizontal ? this.elm.clientHeight : this.elm.clientWidth;
    // If padding is being applied to the track,
    // check if we should hide the excess data
    if (padding?.hideExcessData && elmWidth > trackPadding * 2) {
      ctx.fillStyle = '#eee';
      if (horizontal) {
        ctx.fillRect(0, 0, elmHeight, trackPadding);
        ctx.fillRect(0, elmWidth - trackPadding, elmHeight, elmWidth);
      } else {
        ctx.fillRect(0, 0, trackPadding, elmHeight);
        ctx.fillRect(elmWidth - trackPadding, 0, trackPadding, elmHeight);
      }
    }
  }

  /**
   * Plot graph track
   */
  plot(): void {
    const {
      ctx,
      scale: dscale,
      trackScale: vscale,
      plots,
      options: { horizontal, scale: scaleType, majorTicksOnly },
    } = this;

    if (!ctx) return;

    ctx.save();
    ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);

    let xticks: ScaleHandlerTicks;
    let yticks: ScaleHandlerTicks;

    // If the domain is piecewise eg [0, 20, 50 90],
    // display using standard tick rendering.
    let linearTicks = null;
    if (vscale.domain().length > 2) {
      linearTicks = majorTicksOnly
        ? ScaleHelper.createMajorTicks(vscale)
        : ScaleHelper.createTicks(vscale);
    } else {
      linearTicks = ScaleHelper.createLinearTicks(vscale);
    }

    if (horizontal) {
      yticks =
        scaleType === 'log' ? ScaleHelper.createLogTicks(vscale) : linearTicks;

      xticks = ScaleHelper.createTicks(dscale);

      GridHelper.drawGrid(ctx, dscale, xticks, vscale, yticks);
    } else {
      xticks =
        scaleType === 'log' ? ScaleHelper.createLogTicks(vscale) : linearTicks;

      yticks = ScaleHelper.createTicks(dscale);

      GridHelper.drawGrid(ctx, vscale, xticks, dscale, yticks);
    }
    ctx.restore();
    plots.forEach(plot => plot.plot(ctx, dscale));

    this.setPadding();
  }

  /** Updates all plots with data by triggering each plot's data accessor function. */
  setPlotData(data: any): void {
    // Create a map of plot IDs to plot options
    const plotOptions: Map<string | number, PlotOptions> = new Map();
    this.plots.forEach(plot => {
      plotOptions.set(plot.id, plot.options);
    });

    this.plots.forEach(p => p.setData(data, this.scale, plotOptions));
  }
}
