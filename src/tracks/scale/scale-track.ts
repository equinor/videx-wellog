import { scaleLinear } from 'd3';
import SvgTrack from '../svg-track';
import {
  renderTicks,
  computeLabelBounds,
  LabelBounds,
  renderHorizontalTicks,
  computeLabelBoundsHorizontal,
} from './common';
import ScaleHelper from '../../utils/scale-helper';
import { ScaleTrackOptions } from './interfaces';
import { D3Scale, D3Selection } from '../../common/interfaces';
import { OnMountEvent, OnRescaleEvent, OnUpdateEvent } from '../interfaces';
import { LegendTriggerFunction } from '../../utils/legend-helper';

/**
 * Track for visualising the domain/reference scale
 */
export default class ScaleTrack extends SvgTrack {
  xscale: D3Scale;
  ticks: number[];
  labelBounds: LabelBounds;
  options: ScaleTrackOptions;
  legendUpdate?: LegendTriggerFunction;

  constructor(id: string|number, options: ScaleTrackOptions) {
    super(id, options);
    this.xscale = scaleLinear().domain([0, 10]);
    this.ticks = [];

    this.createTicks = this.createTicks.bind(this);
    this.createRuler = this.createRuler.bind(this);
    this.plot = this.plot.bind(this);
  }

  /**
   * Override of onMount from base class
   */
  onMount(trackEvent: OnMountEvent) : void {
    super.onMount(trackEvent);
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
   * Create scale tick intervals
   */
  createTicks() : void {
    const {
      scale,
    } = this;
    if (!scale) this.ticks = [];
    else this.ticks = ScaleHelper.createTicks(scale).major;
  }

  /**
   * Create scale ruler ticks and render
   */
  createRuler(g: D3Selection) {
    const {
      xscale,
      scale,
      labelBounds,
      ticks,
      options: {
        horizontal,
      },
    } = this;
    const [, max] = xscale.domain();

    const data = ticks.map(tick => ({
      y: scale(tick),
      v: tick,
    }));

    g.selectAll('g.major-tick')
      .data(data)
      .call(horizontal ? renderHorizontalTicks : renderTicks, xscale, labelBounds, max, horizontal);
  }

  /**
   * Plot
   */
  plot() : void {
    const {
      createRuler,
      plotGroup: g,
      xscale,
      options: {
        horizontal,
      },
    } = this;

    if (!g) return;

    this.labelBounds = horizontal ? computeLabelBoundsHorizontal(xscale) : computeLabelBounds(xscale);

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
