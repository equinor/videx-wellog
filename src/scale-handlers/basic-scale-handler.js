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
    const transScale = this.scale.copy().domain(this.baseDomain);
    const range = transScale.range().map(transform.invertY, transform);
    const domain = range.map(transScale.invert, transScale);
    this.scale.domain(domain);
  }

  /**
   * Return ticks based on scale's current domain and range
   * @returns {{major: number[], minor: number[]}} dictionary of major and minor ticks
   */
  ticks() {
    return ScaleHelper.createTicks(this.scale);
  }

  /**
   * Getter for base domain
   * @returns {number[]} the handler's base domain
   */
  get baseDomain() {
    return this._baseDomain;
  }

  /**
   * Setter for base domain
   * @param {number[]} domain new base domain
   */
  set baseDomain(domain) {
    this._baseDomain = domain;
    this.scale.domain(domain);
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
