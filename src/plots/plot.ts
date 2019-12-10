import { createScale } from '../tracks/graph/factory';
import { Range, D3Scale } from '../common/interfaces';
import { PlotData, PlotOptions } from './interfaces';


/**
 * Abstract base class for plots
 */
export default abstract class Plot {
  id: string|number;
  options: PlotOptions;
  data: PlotData | any;
  scale: D3Scale;

  constructor(id: string|number, options: PlotOptions = {}) {
    this.id = id;
    this.options = {
      defined: v => v !== null,
      horizontal: true,
      ...options,
    };
    this.data = [];
    this.scale = options.scale
      ? createScale(options.scale, options.domain || [0, 1])
      : null;
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
  setData(data : PlotData | any) : Plot {
    // console.log(this.id, data)
    this.data = data;
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

  /**
   * Plot function should be overridden
   */
  // eslint-disable-next-line class-methods-use-this
  plot(ctx: CanvasRenderingContext2D, scale: D3Scale) : void {}
}
