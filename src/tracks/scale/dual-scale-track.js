import { scaleLinear } from 'd3';
import SvgTrack from '../svg-track';
import { renderTicks, computeLabelBounds } from './common';
import ScaleHelper from '../../utils/scale-helper';

export default class DualScaleTrack extends SvgTrack {
  constructor(id, options) {
    super(id, options);

    this.xscale = scaleLinear().domain([0, 10]);
    this.viewMode = options.mode === undefined ? 0 : options.mode;

    this.createMeasures = this.createMeasures.bind(this);
    this.createTicks = this.createTicks.bind(this);
    this.createRuler = this.createRuler.bind(this);
  }

  onMount(trackEvent) {
    super.onMount(trackEvent);
    this.scaleHandler = trackEvent.scaleHandler;
    this.createTicks();
  }

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
      scaleHandler,
    } = this;
    if (!scaleHandler) this.ticks = [];
    else this.ticks = ScaleHelper.createTicks(scaleHandler.internalScale).major;
  }

  createRuler(g) {
    const {
      xscale,
      scaleHandler,
      labelBounds,
      ticks,
    } = this;
    const [, max] = xscale.domain();

    const data = ticks.map(tick => ({
      y: scaleHandler.internalScale(tick),
      v: tick,
    }));

    g.selectAll('g.major-tick')
      .data(data)
      .call(renderTicks, xscale, labelBounds, max);
  }

  createMeasures(g) {
    const {
      xscale,
      scaleHandler,
      labelBounds,
      viewMode,
    } = this;

    const [, max] = xscale.domain();

    const ticks = scaleHandler.ticks(viewMode).major;

    let data = [];

    if (viewMode === 1) {
      data = ticks.map(tick => ({
        y: scaleHandler.internalScale(scaleHandler.interpolator.forward(tick)),
        v: tick,
      }));
    } else {
      data = ticks.map(tick => ({
        y: scaleHandler.dataScale(tick),
        v: tick,
      }));
    }

    g.selectAll('g.major-tick')
      .data(data)
      .call(renderTicks, xscale, labelBounds, max);
  }

  plot() {
    const {
      createRuler,
      createMeasures,
      plotGroup: g,
      isMaster,
      xscale,
    } = this;

    if (!g) return;

    this.labelBounds = computeLabelBounds(xscale);

    const modeClass = isMaster ? 'master-scale' : 'slave-scale';
    g.attr('class', `scale-track ${modeClass}`);

    if (isMaster) {
      createRuler(g);
    } else {
      createMeasures(g);
    }
  }

  get isMaster() {
    const {
      viewMode,
      scaleHandler,
    } = this;
    if (!scaleHandler) return false;
    return viewMode === scaleHandler.mode;
  }

  get extent() {
    const {
      viewMode,
      scaleHandler,
    } = this;

    if (scaleHandler.mode === viewMode) {
      return scaleHandler.internalScale.domain();
    }
    if (viewMode === 1) {
      return scaleHandler.interpolator.reverseInterpolatedDomain(
        scaleHandler.internalScale.domain(),
      );
    }
    return scaleHandler.interpolator.forwardInterpolatedDomain(
      scaleHandler.internalScale.domain(),
    );
  }
}
