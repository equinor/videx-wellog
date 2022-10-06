// eslint-disable no-redeclare
import { scaleLinear } from 'd3-scale';
import BasicScaleHandler from './basic-scale-handler';
import ScaleHelper from '../utils/scale-helper';
import { Scale, Domain, Range } from '../common/interfaces';
import { ScaleHandlerTicks, ScaleInterpolator } from './interfaces';

/**
 * Default no-ops interpolator
 */
const noInterpolator : ScaleInterpolator = {
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
  public interpolator: ScaleInterpolator;

  private _mode: number;
  private _alternateBase: Domain;

  constructor(interpolator?: ScaleInterpolator, baseDomain : Domain = [0, 100]) {
    super(baseDomain);

    this._mode = 0;
    this.interpolator = interpolator || noInterpolator;
    this._alternateBase = this.interpolator.reverseInterpolatedDomain(baseDomain);

    this.ticks = this.ticks.bind(this);
  }

  /**
   * Creates a function, which implements the d3.scale members required by
   * the tracks in the wellog component. The scale function, and its reverse,
   * will handle interpolation/conversion between the domains, using the
   * provided scale interpolator.
   */
  createInterpolatedScale() : Scale {
    const {
      interpolator,
    } = this;
    const _t = this;
    const domain = interpolator.forwardInterpolatedDomain(_t.scale.domain());

    const iscale = (v:number) => {
      const iv = interpolator.reverse(v);
      return _t.scale(iv);
    };

    iscale.invert = (v:number) => interpolator.forward(_t.scale.invert(v));

    function d() : Domain;
    function d(newDomain: Domain) : Scale;
    function d(newDomain?: Domain) : Scale | Domain {
      if (newDomain) throw Error('Scale is read-only and may not be altered!');
      return domain;
    }

    function r() : Range;
    function r(newRange: Range) : Scale;
    function r(newRange?: Range) : Scale | Range {
      if (newRange) throw Error('Scale is read-only and may not be altered!');
      return _t.scale.range();
    }

    iscale.domain = d;
    iscale.range = r;
    iscale.ticks = scaleLinear().domain(domain).range(iscale.range().slice()).ticks;
    iscale.copy = () => this.createInterpolatedScale();
    return iscale;
  }

  /**
   * Set mode of the scale handler. Mode is used to switch between domains,
   * so that the internal scale will always be according to the domain of the
   * current mode, while the data scale will always conform to the master mode.
   * mode = 0: master mode
   * mode = 1: alternate mode
   */
  setMode(m: number) : InterpolatedScaleHandler {
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
  rescaleToMode() : InterpolatedScaleHandler {
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
    return this;
  }

  /**
   * Return ticks based on scale's current domain and range
   */
  ticks(mode?: number) : ScaleHandlerTicks {
    const {
      _mode,
      scale,
      interpolator,
    } = this;

    if (mode === undefined || mode === _mode) {
      return ScaleHelper.createTicks(scale);
    }
    let domain: number[];
    if (mode === 0) {
      domain = interpolator.forwardInterpolatedDomain(scale.domain());
    } else {
      domain = interpolator.reverseInterpolatedDomain(scale.domain());
    }
    const iscale = scaleLinear().domain(domain).range(scale.range());

    return ScaleHelper.createTicks(iscale);
  }

  /**
   * set or get base domain, according to current on mode
   */
  baseDomain() : Domain;
  baseDomain(newDomain : Domain) : this;
  baseDomain(newDomain? : Domain) : this | Domain {
    if (newDomain) {
      const {
        _mode: mode,
        interpolator,
        scale,
      } = this;

      this._baseDomain = newDomain;

      if (mode === 1) {
        this._alternateBase = [...newDomain];
      } else {
        this._alternateBase = interpolator.reverseInterpolatedDomain(newDomain);
      }
      scale.domain(newDomain);
      return this;
    }
    return this._mode === 1 ? this._alternateBase : this._baseDomain;
  }

  /**
   * Getter for the current mode
   */
  get mode() : number {
    return this._mode;
  }

  /**
   * Overrides the getter for the scale exposed to the wellog component's tracks
   */
  get dataScale() : Scale {
    return this._mode === 1 ? this.createInterpolatedScale() : this.scale;
  }
}
