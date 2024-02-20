import { scaleLinear } from 'd3-scale';
import SvgTrack from '../svg-track';
import { renderTicks, computeLabelBounds, LabelBounds, renderHorizontalTicks, computeLabelBoundsHorizontal } from './common';
import ScaleHelper from '../../utils/scale-helper';
import { DualScaleTrackOptions } from './interfaces';
import { Scale, D3Selection, Domain } from '../../common/interfaces';
import { InterpolatedScaleHandler } from '../../scale-handlers';
import { OnMountEvent, OnRescaleEvent, OnUpdateEvent } from '../interfaces';

/**
 * A scale track that supports interpolation between two
 * scale domains. Requires container to supply a scale handler
 * in the onMount event.
 *
 * The dual scale has a master/slave mode, which can be toggled
 * to change its behaviour (switch between domains), using the
 * scale-handler's setMode-function.
 */
export default class DualScaleTrack extends SvgTrack<DualScaleTrackOptions> {
  xscale : Scale;
  viewMode : number;
  scaleHandler: InterpolatedScaleHandler;
  ticks: number[];
  labelBounds: LabelBounds;

  constructor(id: string | number, options: DualScaleTrackOptions = {}) {
    const opts: DualScaleTrackOptions = {
      mode: 0,
      ...options,
    };

    super(id, opts);

    this.xscale = scaleLinear().domain([0, 10]);
    this.viewMode = options.mode === undefined ? 0 : options.mode;

    this.createMeasures = this.createMeasures.bind(this);
    this.createTicks = this.createTicks.bind(this);
    this.createRuler = this.createRuler.bind(this);
  }

  clearData() {
    this.scaleHandler = null;
  }

  /**
   * Allow triggering of update event without parameters
   */
  refresh() : void {
    this.onUpdate({ elm: this.elm, scale: this.scale });
  }

  /**
   * Override of onMount from base class
   */
  onMount(trackEvent: OnMountEvent) : void {
    super.onMount(trackEvent);
    this.scaleHandler = trackEvent.scaleHandler;
    this.createTicks();
  }

  /**
   * Override of onRescale from base class
   */
  onRescale(trackEvent: OnRescaleEvent) : void {
    super.onRescale(trackEvent);
    this.createTicks();
    if (this.legendUpdate) this.legendUpdate();
    this.plot();
  }

  /**
   * Override of onUpdate from base class
   */
  onUpdate(trackEvent: OnUpdateEvent) : void {
    super.onUpdate(trackEvent);
    const { elm } = this;
    this.xscale.range([0, this.options.horizontal ? elm.clientHeight : elm.clientWidth]);
    this.plot();
  }

  /**
   * Create scale tick intervals according to mode
   */
  createTicks() : void {
    const {
      scaleHandler,
    } = this;
    if (!scaleHandler) this.ticks = [];
    else this.ticks = ScaleHelper.createTicks(scaleHandler.scale).major;
  }

  /**
   * Create scale ruler ticks base on current mode and render
   */
  createRuler(g: D3Selection) : void {
    const {
      xscale,
      scaleHandler,
      labelBounds,
      ticks,
      options: {
        horizontal,
      },
    } = this;
    const [, max] = xscale.domain();

    const data = ticks.map(tick => ({
      y: scaleHandler.scale(tick),
      v: tick,
    }));

    g.selectAll('g.major-tick')
      .data(data)
      .call(horizontal ? renderHorizontalTicks : renderTicks, xscale, labelBounds, max);
  }

  /**
   * Create ticks for inverse mode
   */
  createMeasures(g: D3Selection) : void {
    const {
      xscale,
      scaleHandler,
      labelBounds,
      viewMode,
      options: {
        horizontal,
      },
    } = this;

    const [, max] = xscale.domain();

    const ticks = scaleHandler?.ticks(viewMode).major || [];

    let data = [];

    if (viewMode === 1) {
      data = ticks.map(tick => ({
        y: scaleHandler.scale(scaleHandler.interpolator.forward(tick)),
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
      .call(horizontal ? renderHorizontalTicks : renderTicks, xscale, labelBounds, max);
  }

  /**
   * Plot the scale track
   */
  plot() : void {
    const {
      createRuler,
      createMeasures,
      plotGroup: g,
      isMaster,
      xscale,
      options: {
        horizontal,
      },
    } = this;

    if (!g) return;

    this.labelBounds = horizontal ? computeLabelBoundsHorizontal(xscale) : computeLabelBounds(xscale);

    const modeClass = isMaster ? 'master-scale' : 'slave-scale';
    g.attr('class', `scale-track ${modeClass}`);

    if (isMaster) {
      createRuler(g);
    } else {
      createMeasures(g);
    }
  }

  /**
   * Getter for determining if the track is in master mode or not
   */
  get isMaster() : boolean {
    const {
      viewMode,
      scaleHandler,
    } = this;
    if (!scaleHandler) return false;
    return scaleHandler.mode === undefined ? true : viewMode === scaleHandler.mode;
  }

  /**
   * Getter for scale extent according to mode
   */
  get extent() : Domain {
    const {
      viewMode,
      scaleHandler,
    } = this;

    if (scaleHandler?.mode === viewMode) {
      return scaleHandler?.scale?.domain();
    }
    if (viewMode === 1) {
      return scaleHandler?.interpolator?.reverseInterpolatedDomain(
        scaleHandler.scale.domain(),
      );
    }
    return scaleHandler?.interpolator?.forwardInterpolatedDomain(
      scaleHandler.scale.domain(),
    );
  }
}
