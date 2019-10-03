import { scaleLinear } from 'd3';
import ScaleHelper from '../utils/scale-helper';

/**
 * Class that controls reference scaling in the wellog component
 */
export default class BasicScaleHandler {
  /**
   * Create new instance
   * @param {number[]} [baseDomain] initialize with a base domain (full vertical reference domain)
   */
  constructor(baseDomain = [0, 0]) {
    this._baseDomain = baseDomain;

    this.scale = scaleLinear().domain(baseDomain).range([0, 0]);

    this.rescale = this.rescale.bind(this);
    this.ticks = this.ticks.bind(this);
  }

  /**
   * Update scale according to transform
   * @param {d3.transform} transform transform from d3.event
   */
  rescale(transform) {
    const transScale = this.scale.copy().domain(this._baseDomain);
    const range = transScale.range().map(transform.invertY, transform);
    const domain = range.map(transScale.invert, transScale);
    this.scale.domain(domain);
    return this;
  }

  /**
   * Return ticks based on scale's current domain and range
   * @returns {{major: number[], minor: number[]}} dictionary of major and minor ticks
   */
  ticks() {
    return ScaleHelper.createTicks(this.scale);
  }

  /**
   * set or get base domain
   * @param {number[]} [newDomain] new domain to set as base domain
   * @returns {this|number[]} Is newDomain is not provided, the current base domain is returned.
   */
  baseDomain(newDomain) {
    if (newDomain) {
      this._baseDomain = newDomain;
      this.scale.domain(newDomain);
      return this;
    }
    return this._baseDomain;
  }

  /**
   * set or get scale's range
   * @param {number[]} [newRange] new range to set as scale range
   * @returns {this|number[]} Is newRange is not provided, the current scale range is returned.
   */
  range(newRange) {
    if (newRange) {
      this.scale.range(newRange);
      return this;
    }
    return this.scale.range();
  }

  /**
   * Getter for the scale used internally by the wellog component
   * @returns {d3.scale} internal scale
   */
  get internalScale() {
    return this.scale;
  }

  /**
   * Getter for the scale exposed to the wellog component's tracks
   * @returns {d3.scale} data scale
   */
  get dataScale() {
    return this.scale;
  }
}
