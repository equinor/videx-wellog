import { scaleLinear } from 'd3';
import BasicScaleHandler from './basic-scale-handler';
import ScaleHelper from '../utils/scale-helper';

const noInterpolator = {
  forward: v => v,
  reverse: v => v,
  forwardInterpolatedDomain: domain => domain,
  reverseInterpolatedDomain: domain => domain,
};

/**
 * Scale handler supporting interpolation between domains. A scale interpolator
 * is required to convert between the domains. This is implemented as an object
 * with 2 conversion functions, forward and reverse. It also needs to implement
 * 2 more functions, forwardInterpolatedDomain and reverseInterpolatedDomain.
 * These should return the corresponding domain based on the opposite domain,
 * i.e. MD <==> TVD.
 */
export default class InterpolatedScaleHandler extends BasicScaleHandler {
  /**
   * Create new instance
   * @param {{
   *  forward: function,
   *  reverse: function,
   *  forwardInterpolatedDomain: function,
   *  reverseInterpolatedDomain: function,
   * }} [interpolator] Scale interpolator.
   * @param {number[]} [baseDomain] initialize with a base domain (full vertical reference domain)
   */
  constructor(interpolator, baseDomain = [0, 0]) {
    super(baseDomain);

    this._mode = 0;
    this.interpolator = interpolator || noInterpolator;
    this._alternateBase = interpolator.reverseInterpolatedDomain(baseDomain);

    this.ticks = this.ticks.bind(this);
  }

  /**
   * Creates a function, which implements the d3.scale members required by
   * the tracks in the wellog component. The scale function, and its reverse,
   * will handle interpolation/conversion between the domains, using the
   * provided scale interpolator.
   * @returns {function} scale
   */
  createInterpolatedScale() {
    const {
      interpolator,
    } = this;
    const _t = this;
    const domain = interpolator.forwardInterpolatedDomain(_t.scale.domain());

    const iscale = v => {
      const iv = interpolator.reverse(v);
      return _t.scale(iv);
    };

    iscale.invert = v => interpolator.forward(_t.scale.invert(v));

    iscale.domain = () => domain;
    iscale.range = () => _t.scale.range();
    iscale.ticks = scaleLinear().domain(domain).range(iscale.range()).ticks;
    return iscale;
  }

  /**
   * Set mode of the scale handler. Mode is used to switch between domains,
   * so that the internal scale will always be according to the domain of the
   * current mode, while the data scale will always conform to the master mode.
   * mode = 0: master mode
   * mode = 1: alternate mode
   * @param {number} m 0=master 1=alternate mode
   */
  setMode(m) {
    if (m === 0 || m === 1) {
      this._mode = m;
      this.rescaleToMode();
      return this;
    }
    throw Error('Invalid scale mode!');
  }

  /**
   * Rescales the domain of the internal scale according to the selected mode.
   */
  rescaleToMode() {
    const {
      _mode: mode,
      interpolator,
      scale,
    } = this;

    let d;
    if (mode === 1) {
      d = interpolator.reverseInterpolatedDomain(scale.domain());
    } else {
      d = interpolator.forwardInterpolatedDomain(scale.domain());
    }
    scale.domain(d);
  }

  /**
   * Return ticks based on scale's current domain and range
   * @param {number} [mode] override which mode the ticks are created for
   * @returns {{major: number[], minor: number[]}} dictionary of major and minor ticks
   */
  ticks(mode) {
    const {
      _mode,
      scale,
      interpolator,
    } = this;

    if (mode === undefined || mode === _mode) {
      return ScaleHelper.createTicks(scale);
    }
    let domain;
    if (mode === 0) {
      domain = interpolator.forwardInterpolatedDomain(scale.domain());
    } else {
      domain = interpolator.reverseInterpolatedDomain(scale.domain());
    }
    const iscale = scaleLinear().domain(domain).range(scale.range());

    return ScaleHelper.createTicks(iscale);
  }

  /**
   * Getter for base domain, according to current on mode
   * @returns {number[]} the handler's base domain
   */
  get baseDomain() {
    return this._mode === 1 ? this._alternateBase : this._baseDomain;
  }

  /**
   * Setter for base domain (according to master mode)
   * @param {number[]} domain new base domain
   */
  set baseDomain(domain) {
    const {
      _mode: mode,
      interpolator,
      scale,
    } = this;

    this._baseDomain = domain;

    if (mode === 1) {
      this._alternateBase = [...domain];
    } else {
      this._alternateBase = interpolator.reverseInterpolatedDomain(domain);
    }
    scale.domain(domain);
  }

  /**
   * Getter for the current mode
   * @return {number} mode
   */
  get mode() {
    return this._mode;
  }

  /**
   * Overrides the getter for the scale exposed to the wellog component's tracks
   * @returns {d3.scale} data scale
   */
  get dataScale() {
    return this._mode === 1 ? this.createInterpolatedScale() : this.scale;
  }
}
