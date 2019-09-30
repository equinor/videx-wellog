/**
 * Abstract base class for plots
 */
export default class Plot {
  constructor(id, scale, options = {}) {
    this.id = id;
    this.scale = scale;
    this.options = options;
    this.data = [];
    this.offset = options.offset || 0;

    this.setRange = this.setRange.bind(this);
    this.setData = this.setData.bind(this);
  }

  setRange(range) {
    if (this.scale) this.scale.range(range);
    return this;
  }

  setData(data) {
    // console.log(this.id, data)
    this.data = data;
    return this;
  }

  // eslint-disable-next-line class-methods-use-this
  plot() {}
}
