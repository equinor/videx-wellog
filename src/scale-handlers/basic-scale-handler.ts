import { scaleLinear, ZoomTransform } from 'd3';
import ScaleHelper from '../utils/scale-helper';
import { Scale, D3Scale, Range, Domain } from '../common/interfaces';
import { ScaleHandlerTicks, ScaleHandler } from './interfaces';

/**
 * Class that controls reference scaling in the WellogComponent.
 * The scale handler is an abstraction to allow adding custom
 * scaling behaviour, such as mapping data between domains.
 */
export default class BasicScaleHandler implements ScaleHandler {
  public scale: D3Scale;
  protected _baseDomain: Domain;

  constructor(baseDomain : Domain = [0, 0]) {
    this._baseDomain = baseDomain;

    this.scale = scaleLinear().domain(baseDomain).range([0, 0]);

    this.rescale = this.rescale.bind(this);
    this.ticks = this.ticks.bind(this);
  }

  /**
   * Update scale according to transform
   */
  rescale(transform: ZoomTransform, axis = 'y') {
    const transScale = this.scale.copy().domain(this.baseDomain());
    const range = transScale.range().map(axis === 'x' ? transform.invertX : transform.invertY, transform);
    const domain = range.map(transScale.invert, transScale);
    this.scale.domain(domain);
    return this;
  }

  /**
   * Return ticks based on scale's current domain and range
   */
  ticks() : ScaleHandlerTicks {
    return ScaleHelper.createTicks(this.scale);
  }

  /**
   * set or get base domain
   */
  baseDomain() : Domain;
  baseDomain(newDomain : Domain) : ScaleHandler;
  baseDomain(newDomain? : Domain) : ScaleHandler | Domain {
    if (newDomain) {
      this._baseDomain = newDomain;
      this.scale.domain(newDomain);
      return this;
    }
    return this._baseDomain;
  }

  /**
   * set or get scale's range
   */
  range() : Range;
  range(newRange : Range) : ScaleHandler;
  range(newRange? : Range) : ScaleHandler | Range {
    if (newRange) {
      this.scale.range(newRange);
      return this;
    }
    return this.scale.range();
  }

  /**
   * Getter for the scale exposed to the wellog component's tracks
   */
  get dataScale() : Scale {
    return this.scale;
  }
}
