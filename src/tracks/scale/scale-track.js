import { scaleLinear } from 'd3';
import SvgTrack from '../svg-track';
import { renderTicks, computeLabelBounds } from './common';
import ScaleHelper from '../../utils/scale-helper';

/**
 * Track for visualising y-scale
 */
export default class ScaleTrack extends SvgTrack {
  constructor(id, options) {
    super(id, options);
    this.xscale = scaleLinear().domain([0, 10]);
    this.ticks = [];

    this.createTicks = this.createTicks.bind(this);
    this.createRuler = this.createRuler.bind(this);
    this.plot = this.plot.bind(this);
  }

  /**
   * Override of onMount from base class
   * @param {object} trackEvent
   */
  onMount(trackEvent) {
    super.onMount(trackEvent);
    this.createTicks();
  }

  /**
   * Override of onRescale from base class
   * @param {object} trackEvent
   */
  onRescale(trackEvent) {
    super.onRescale(trackEvent);
    this.createTicks();
    if (this.legendUpdate) this.legendUpdate();
    this.plot();
  }

  /**
   * Override of onUpdate from base class
   * @param {object} trackEvent
   */
  onUpdate(trackEvent) {
    super.onUpdate(trackEvent);
    const { elm } = this;
    this.xscale.range([0, elm.clientWidth]);
    this.plot();
  }

  /**
   * Create scale tick intervals
   */
  createTicks() {
    const {
      scale,
    } = this;
    if (!scale) this.ticks = [];
    else this.ticks = ScaleHelper.createTicks(scale).major;
  }

  /**
   * Create scale ruler ticks and render
   * @param {SVGGElement} g
   */
  createRuler(g) {
    const {
      xscale,
      scale,
      labelBounds,
      ticks,
    } = this;
    const [, max] = xscale.domain();

    const data = ticks.map(tick => ({
      y: scale(tick),
      v: tick,
    }));

    g.selectAll('g.major-tick')
      .data(data)
      .call(renderTicks, xscale, labelBounds, max);
  }

  /**
   * Plot
   */
  plot() {
    const {
      createRuler,
      plotGroup: g,
      xscale,
    } = this;

    if (!g) return;

    this.labelBounds = computeLabelBounds(xscale);

    g.attr('class', 'scale-track master-scale');

    createRuler(g);
  }

  /**
   * Getter for scale extent
   */
  get extent() {
    return this.scale.domain();
  }
}
