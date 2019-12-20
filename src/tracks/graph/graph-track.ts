
import CanvasTrack from '../canvas-track';
import { createScale, plotFactory as defaultPlotFactory } from './factory';
import { GridHelper, ScaleHelper, debouncer, DebounceFunction, DataHelper } from '../../utils';
import { Plot } from '../../plots';
import { D3Scale, Scale } from '../../common/interfaces';
import { GraphTrackOptions } from './interfaces';
import { OnMountEvent, OnRescaleEvent, OnUpdateEvent } from '../interfaces';
import { ScaleHandlerTicks } from '../../scale-handlers';

const defaultOptions = {
  scale: 'linear',
  domain: [0, 100],
  togglePlotFromLegend: true,
  plotFactory: defaultPlotFactory,
};

/**
 * Updates all plots with data by triggering each plot's data accessor function
 */
function setPlotData(plots: Plot[], data: any, scale: Scale) : void {
  plots.forEach(p => {
    if (typeof p.options.dataAccessor !== 'function') {
      throw Error(`Plot '${p.id}' does not have a data accessor configured`);
    }
    let plotData = p.options.dataAccessor(data);
    if (p.options.filterToScale) {
      const filterOverlapFactor = p.options.filterOverlapFactor || 0.5;
      plotData = DataHelper.filterData(plotData, scale.domain(), filterOverlapFactor);
    }
    p.setData(plotData);
  });
}

/**
 * An extension to CanvasTrack for rendering plots
 *
 * See ./readme.md in source code for more info
 */
export default class GraphTrack extends CanvasTrack {
  trackScale: D3Scale;
  options: GraphTrackOptions;
  plots: Plot[];
  debounce: DebounceFunction;

  private _transformedData?: any;
  private _transformCondition?: number = null;

  constructor(id: string|number, options: GraphTrackOptions = {}) {
    super(id, {
      ...defaultOptions,
      ...options,
    });

    this.trackScale = createScale(
      this.options.scale,
      this.options.domain,
    );

    this.plots = [];

    if (this.options.plots) {
      this.plots = options.plots.map(p => {
        const createPlot = this.options.plotFactory[p.type];
        if (!createPlot) throw Error(`No factory function for creating '${p.type}'-plot!`);
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
  onMount(trackEvent: OnMountEvent) : void {
    super.onMount(trackEvent);
    const {
      options,
      loader,
    } = this;

    if (options.data) {
      const showLoader = options.showLoader === undefined ? !!loader : options.showLoader;

      if (showLoader && typeof (options.data) === 'function') {
        this.loadData(options.data, showLoader);
      } else {
        this.data = options.data;
      }
    }
  }

  /**
   * Override to allow data transformations, like resampling and filtering
   */
  onRescale(trackEvent: OnRescaleEvent) : void {
    super.onRescale(trackEvent);
    this.debounce(this.prepareData);
    this.plot();
  }

  /**
   * Override to resize plots and scales
   */
  onUpdate(trackEvent: OnUpdateEvent) : void {
    super.onUpdate(trackEvent);
    this.updateRange();
    this.plot();
  }

  /**
   * Callback after data loaded, using loadData.
   */
  onDataLoaded() : void {
    this._transformCondition = null;
    this.prepareData();
  }

  /**
   * Set new range to track and plot scales
   */
  updateRange() : void {
    const range = this.options.horizontal
      ? [this.elm.clientHeight, 0]
      : [0, this.elm.clientWidth];
    this.trackScale.range(range);

    this.plots.forEach(plot => {
      let r = range;
      if (Number.isFinite(plot.options.offset)) {
        const [r0, r1] = range;
        r = this.options.horizontal
          ? [r0 - plot.options.offset * Math.abs(r0 - r1), r1]
          : [plot.options.offset * (r1 - r0), r1];
      }
      plot.options.horizontal = this.options.horizontal;
      plot.setRange(r);
    });
  }

  /**
   * Execute configured transform function if applicable on the track's data
   * and update plots with the result
   */
  prepareData() : void {
    const {
      data,
      scale,
      options,
      plot,
      plots,
      _transformCondition: previousCondition,
    } = this;
    if (!data) return;
    if (options.transform) {
      const currentCondition = Math.round(ScaleHelper.getDomainSpan(scale, false) * 10);
      this._transformCondition = currentCondition;
      if (options.alwaysTransform || !previousCondition || previousCondition !== currentCondition) {
        options.transform(data, scale).then(transformed => {
          this._transformedData = transformed;
          setPlotData(plots, transformed, scale);
          plot();
        });
      }
      setPlotData(plots, this._transformedData || this._data, scale);
      plot();
    } else {
      setPlotData(plots, data, scale);
      plot();
    }
  }

  /**
   * Set option on a Plot by id
   */
  setPlotOption(id: string | number, key: string, value: any) : GraphTrack {
    const plot = this.plots.find(d => d.id === id);
    if (plot) {
      plot.setOption(key, value);
      this.plot();
      return this;
    }
    throw Error(`Plot not found with id ${id}`);
  }

  /**
   * Plot graph track
   */
  plot() : void {
    const {
      ctx,
      scale: dscale,
      trackScale: vscale,
      plots,
      options: {
        horizontal,
      },
    } = this;

    if (!ctx) return;

    ctx.save();
    ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);

    let xticks: ScaleHandlerTicks;
    let yticks: ScaleHandlerTicks;

    if (horizontal) {
      yticks = vscale.base
        ? ScaleHelper.createLogTicks(vscale)
        : ScaleHelper.createLinearTicks(vscale);

      xticks = ScaleHelper.createTicks(dscale);

      GridHelper.drawGrid(ctx, dscale, xticks, vscale, yticks);
    } else {
      xticks = vscale.base
        ? ScaleHelper.createLogTicks(vscale)
        : ScaleHelper.createLinearTicks(vscale);

      yticks = ScaleHelper.createTicks(dscale);

      GridHelper.drawGrid(ctx, vscale, xticks, dscale, yticks);
    }
    plots.forEach(plot => plot.plot(ctx, dscale));
    ctx.restore();
  }
}
