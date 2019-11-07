/**
 * Abstract base class for plots
 */
export default class Plot {
  /**
   * Create instance
   * @param {*} id plot id
   * @param {d3.scale} scale scale for data serie values
   * @param {object} options plot options
    */
  constructor(id, scale, options = {}) {
    this.id = id;
    this.scale = scale;
    this.options = options;
    this.data = [];
    this.offset = options.offset || 0;

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
   * Plot function should be overridden
   */
  // eslint-disable-next-line class-methods-use-this
  plot() {}
}
