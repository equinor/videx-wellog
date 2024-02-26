import { createScale } from '../tracks/graph/factory';
import { Range, Scale } from '../common/interfaces';
import { PlotData, PlotOptions } from './interfaces';
import { DataHelper } from '../utils';

/**
 * Abstract base class for plots
 */
export default abstract class Plot<PLOT_OPTIONS extends PlotOptions = PlotOptions> {
  id: string | number;
  options: PLOT_OPTIONS;
  data: PlotData | any;
  scale: Scale;
  range: Range;

  constructor(id: string | number, options: PLOT_OPTIONS = {} as PLOT_OPTIONS) {
    this.id = id;
    this.options = {
      defined: v => v !== null,
      horizontal: true,
      ...options,
    };
    this.data = [];
    this.scale = options.scale && typeof options.domain !== 'function' ? createScale(options.scale, options.domain || [0, 1]) : null;
    this.setRange = this.setRange.bind(this);
    this.setData = this.setData.bind(this);
  }

  get offset() : number {
    return this.options.offset || 0;
  }

  /**
   * Set range of plot scale
   */
  setRange(range: Range) : Plot {
    if (this.scale) this.scale.range(range);
    this.range = range;
    return this;
  }

  /**
   * Sets the plot data
   * @param data Data for all plots on track
   * @param scale
   * @param plots Plots on track
   */
  setData(data : any, scale?: Scale, plotOptions?: Map<string | number, PLOT_OPTIONS>) : Plot {
    let plotData = data;
    if (this.options.dataAccessor && typeof this.options.dataAccessor === 'function') {
      plotData = this.options.dataAccessor(data, plotOptions);
    }
    if (this.options.filterToScale && scale) {
      const filterOverlapFactor = this.options.filterOverlapFactor || 0.5;
      plotData = DataHelper.filterData(plotData, scale.domain(), filterOverlapFactor);
    }
    this.data = plotData;
    return this;
  }

  /**
   * Set option
   */
  setOption(key: string, value: any) : Plot {
    if (!this.options) {
      this.options = {} as PLOT_OPTIONS;
    }
    this.options[key] = value;
    if (key === 'domain' && this.scale) {
      this.scale.domain(value);
    } else if (key === 'scale' && this.scale) {
      const domain = this.scale.domain();
      const range = this.scale.range();
      this.scale = createScale(value, domain);
      this.scale.range(range.slice());
    }
    return this;
  }

  /**
   * Set multiple options
   * @param options object containing options to set
   */
  setOptions(options: any) : Plot {
    Object.entries(options).forEach(o => {
      this.setOption(o[0], o[1]);
    });
    return this;
  }

  updateDynamicScale(data, graphOptions): void {
    const { options, range } = this;
    if (typeof options.domain === 'function') {
      const domain = options.domain(data);
      this.scale = createScale(options.scale || graphOptions.scale, domain);
    }

    if (range) {
      this.scale.range(range);
    }
  }

  /**
   * Plot function should be overridden
   */
  plot(ctx: CanvasRenderingContext2D, scale: Scale) : void {} // eslint-disable-line class-methods-use-this, @typescript-eslint/no-unused-vars
}
