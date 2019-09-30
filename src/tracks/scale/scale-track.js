import { scaleLinear } from 'd3';
import SvgTrack from '../svg-track';
import { renderTicks, computeLabelBounds } from './common';
import ScaleHelper from '../../utils/scale-helper';

export default class ScaleTrack extends SvgTrack {
  constructor(id, options) {
    super(id, options);
    this.xscale = scaleLinear().domain([0, 10]);
    this.ticks = [];

    this.createTicks = this.createTicks.bind(this);
    this.createRuler = this.createRuler.bind(this);
    this.plot = this.plot.bind(this);
  }

  // override
  onMount(trackEvent) {
    super.onMount(trackEvent);
    this.createTicks();
  }

  // override
  onRescale(trackEvent) {
    super.onRescale(trackEvent);
    this.createTicks();
    if (this.legendUpdate) this.legendUpdate();
    this.plot();
  }

  // override
  onUpdate(trackEvent) {
    super.onUpdate(trackEvent);
    const { elm } = this;
    this.xscale.range([0, elm.clientWidth]);
    this.plot();
  }

  createTicks() {
    const {
      scale,
    } = this;
    if (!scale) this.ticks = [];
    else this.ticks = ScaleHelper.createTicks(scale).major;
  }

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

  get extent() {
    return this.scale.domain();
  }
}
