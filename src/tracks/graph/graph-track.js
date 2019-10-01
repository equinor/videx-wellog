
import CanvasTrack from '../canvas-track';
import { createScale, plotFactory as defaultPlotFactory } from './factory';
import { GridHelper, ScaleHelper } from '../../utils/index';

export default class GraphTrack extends CanvasTrack {
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
    this.debounce = this.debounce.bind(this);

    this.debounced = {};
  }

  // override
  onMount(trackEvent) {
    super.onMount(trackEvent);

    const {
      options,
    } = this;

    if (options.data) {
      this.isLoading = true;
      options.data().then(data => {
        this.data = data;
        this.isLoading = false;
        this.prepareData();
        if (this.legendUpdate) this.legendUpdate();
      });
    }
  }

  debounce(func, key, delay = 20) {
    const {
      debounced,
    } = this;

    if (debounced[key]) {
      clearTimeout(debounced[key]);
    }
    debounced[key] = setTimeout(() => {
      func();
      delete debounced[key];
    }, delay);
  }

  // override
  onRescale(trackEvent) {
    super.onRescale(trackEvent);
    this.debounce(this.prepareData, 'prepareData', 20);
    this.plot();
  }

  // override
  onUpdate(trackEvent) {
    super.onUpdate(trackEvent);
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
    this.plot();
  }

  setPlotData(data) {
    const { plots } = this;

    plots.forEach(p => {
      if (typeof p.options.data !== 'function') {
        throw Error(`Plot '${p.id}' does not have a data accessor configured`);
      }
      p.setData(p.options.data(data));
    });
  }

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
