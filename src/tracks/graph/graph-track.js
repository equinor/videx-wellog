
import CanvasTrack from '../canvas-track';
import { createScale, plotFactory as defaultPlotFactory } from './factory';
import { GridHelper, ScaleHelper, debouncer } from '../../utils/index';

/**
 * An extension to CanvasTrack for rendering plots
 *
 * See ./readme.md in source code for more info
 */
export default class GraphTrack extends CanvasTrack {
  /**
   * Create instance
   * @param {*} id Track id
   * @param {{
   *  scale:string,
   *  domain:number[],
   *  plotFactory: [object],
   *  plots: object[],
   *  data: function,
   * }} options Track options
   */
  constructor(id, options) {
    super(id, options);

    this.trackScale = createScale(
      options.scale || 'linear',
      options.domain || [0, 100],
    );

    this.plots = [];

    if (options.plots) {
      const plotFactory = options.plotFactory || defaultPlotFactory;
      this.plots = options.plots.map(p => {
        const createPlot = plotFactory[p.type];
        if (!createPlot) throw Error(`No factory function for creating '${p.type}'-plot!`);
        return createPlot(p, this.trackScale);
      });
    }

    this.plot = this.plot.bind(this);
    this.setPlotData = this.setPlotData.bind(this);
    this.prepareData = this.prepareData.bind(this);

    this.debounce = debouncer();
  }

  /**
   * Override of onMount to load track data
   * @param {object} trackEvent track onMount event data
   */
  onMount(trackEvent) {
    super.onMount(trackEvent);

    const {
      options,
    } = this;

    if (options.data) {
      const showLoader = options.showLoader === undefined ? true : options.showLoader;
      this.loadData(options.data, showLoader);
    }
  }

  /**
   * Override to allow data transformations, like resampling and filtering
   * @param {object} trackEvent onRescale event
   */
  onRescale(trackEvent) {
    super.onRescale(trackEvent);
    this.debounce(this.prepareData);
    this.plot();
  }

  /**
   * Override to resize plots and scales
   * @param {object} trackEvent onUpdate event type
   */
  onUpdate(trackEvent) {
    super.onUpdate(trackEvent);
    this.updateRange();
    this.plot();
  }

  /**
   * Callback after data loaded, using loadData.
   */
  onDataLoaded() {
    this.prepareData();
  }

  /**
   * Set new range to track and plot scales
   */
  updateRange() {
    const range = [0, this.elm.clientWidth];
    this.trackScale.range(range);
    this.plots.forEach(plot => {
      let r = range;
      if (Number.isFinite(plot.options.offset)) {
        const [r0, r1] = range;
        r = [plot.options.offset * (r1 - r0), r1];
      }
      plot.setRange(r);
    });
  }

  /**
   * Updates all plots with data by triggering each plot's data accessor function
   * @param {object} data track data object
   */
  setPlotData(data) {
    const { plots } = this;

    plots.forEach(p => {
      if (typeof p.options.data !== 'function') {
        throw Error(`Plot '${p.id}' does not have a data accessor configured`);
      }
      p.setData(p.options.data(data));
    });
  }

  /**
   * Execute configured transform function if applicable on the track's data
   * and update plots with the result
   */
  prepareData() {
    const {
      setPlotData,
      data,
      scale,
      options,
      plot,
    } = this;
    if (!data) return;
    if (options.transform) {
      // console.log('PREPARE DATA', this.id);
      options.transform(data, scale).then(transformed => {
        setPlotData(transformed);
        plot();
      });
    } else {
      setPlotData(data);
      plot();
    }
  }

  /**
   * Plot graph track
   */
  plot() {
    const {
      ctx,
      scale: yscale,
      trackScale: xscale,
      plots,
    } = this;

    if (!ctx) return;

    ctx.save();
    ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);

    const xticks = xscale.base ?
      ScaleHelper.createLogTicks(xscale) :
      ScaleHelper.createLinearTicks(xscale);

    const yticks = ScaleHelper.createTicks(yscale);

    GridHelper.drawGrid(ctx, xscale, xticks, yscale, yticks);

    plots.forEach(plot => plot.plot(ctx, yscale));
    ctx.restore();
  }
}
