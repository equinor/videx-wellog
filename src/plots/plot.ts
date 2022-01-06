import { createScale } from '../tracks/graph/factory';
import { Range, Scale } from '../common/interfaces';
import { PlotData, PlotOptions } from './interfaces';
import { DataHelper } from '../utils';


/**
 * Abstract base class for plots
 */
export default abstract class Plot {
  id: string|number;
  options: PlotOptions;
  data: PlotData | any;
  scale: Scale;

  constructor(id: string|number, options: PlotOptions = {}) {
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
    return this;
  }

  /**
   * Sets the plot data
   */
  setData(data : any, scale?: Scale) : Plot {
    let plotData = data;
    if (this.options.dataAccessor && typeof this.options.dataAccessor === 'function') {
      plotData = this.options.dataAccessor(data);
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
      this.options = {};
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
    const { options } = this;
    if (typeof options.domain === 'function') {
      const domain = options.domain(data);
      this.scale = createScale(options.scale || graphOptions.scale, domain);
    }
  }

  /**
   * Plot function should be overridden
   */
  // eslint-disable-next-line class-methods-use-this
  plot(ctx: CanvasRenderingContext2D, scale: Scale) : void {}
}
