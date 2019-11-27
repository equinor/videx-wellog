import { createScale } from '../tracks/graph/factory';

/**
 * Abstract base class for plots
 */
export default class Plot {
  /**
   * Create instance
   * @param {*} id plot id
   * @param {object} options plot options
    */
  constructor(id, options = {}) {
    this.id = id;
    this.options = {
      defined: v => v !== null,
      ...options,
    };
    this.data = [];
    this.offset = options.offset || 0;
    this.scale = options.scale ?
      createScale(
        options.scale,
        options.domain || [0, 1],
      ) : null;
    this.setRange = this.setRange.bind(this);
    this.setData = this.setData.bind(this);
  }

  /**
   * Set range of plot scale
   * @param {number[]} range
   */
  setRange(range) {
    if (this.scale) this.scale.range(range);
    return this;
  }

  /**
   * Sets the plot data
   * @param {number[][]} data plot data
   */
  setData(data) {
    // console.log(this.id, data)
    this.data = data;
    return this;
  }

  /**
   * Set option
   * @param {*} key options key
   * @param {*} value value to set
   */
  setOption(key, value) {
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
      this.scale.range(range);
    }
    return this;
  }
  /**
   * Plot function should be overridden
   */
  // eslint-disable-next-line class-methods-use-this
  plot() {}
}
