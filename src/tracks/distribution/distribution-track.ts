import { scaleLinear, ScaleLinear } from 'd3-scale';
import { select } from 'd3-selection';
import SvgTrack from '../svg-track';
import {
  CompositionEntry,
  DistributionData,
  DistributionTrackOptions,
} from './interfaces';
import { OnMountEvent, OnRescaleEvent, OnUpdateEvent } from '../interfaces';
import { setAttrs } from '../../utils';

/** Track for visualising distribution of data. */
export class DistributionTrack extends SvgTrack<DistributionTrackOptions> {
  xscale: ScaleLinear<number, number>;
  discreteHeight: number;

  /** Override of onMount from base class. */
  onMount(event: OnMountEvent) {
    super.onMount(event);

    const {
      options,
      loader,
    } = this;

    this.xscale = scaleLinear().domain([0, 1]);
    this.discreteHeight = options.discreteHeight || 10;

    if (options.data) {
      const showLoader = options.showLoader ?? Boolean(loader);

      if (showLoader && typeof (options.data) === 'function') {
        this.loadData(options.data, showLoader);
      } else {
        this.data = options.data;
      }
    }
  }

  /** Override of onUpdate from base class. */
  onUpdate(event: OnUpdateEvent) {
    super.onUpdate(event);
    if (this.options.horizontal) {
      this.xscale.range([0, this.elm.clientHeight]);
    } else {
      this.xscale.range([0, this.elm.clientWidth]);
    }
    this.plot();
  }

  /** Override of onRescale from base class. */
  onRescale(event: OnRescaleEvent) {
    super.onRescale(event);
    this.plot();
  }

  plot() {
    const {
      plotGroup: g,
      scale: yscale,
      xscale,
      data,
      options,
      discreteHeight,
    } = this;

    if (!g) return;

    // Clear visuals if 'data' is undefined or empty
    if (!data?.length) {
      g.selectAll('g.area').remove();
      return;
    }

    // Get the current visible domain
    const [min, max] = yscale.domain();

    // Filter data based on the visible domain
    const visibleData = data.filter((d: DistributionData) => d.depth + discreteHeight >= min && d.depth - discreteHeight <= max);

    // Transform depth
    const transformedData: DistributionData = visibleData.map((d: DistributionData) => ({
      depth: yscale(d.depth),
      composition: d.composition,
    }));

    const selection = g.selectAll('g.area').data(transformedData, (d: DistributionData) => d.depth);

    const horizontalTransform = (d: DistributionData) => `translate(${d.depth - discreteHeight / 2}, 0)`;
    const verticalTransform = (d: DistributionData) => `translate(0, ${d.depth - discreteHeight / 2})`;
    const transform = options.horizontal ? horizontalTransform : verticalTransform;

    selection.attr('transform', transform);

    const getRectGeom = (x0: number, x1: number, color: string) => (options.horizontal
      // Horizontal Rectangle
      ? {
        x: 0,
        y: xscale(x0),
        width: discreteHeight,
        height: xscale(x1),
        fill: color,
      }
      // Vertical Rectangle
      : {
        x: xscale(x0),
        y: 0,
        width: xscale(x1),
        height: discreteHeight,
        fill: color,
      }
    );

    const updateGroup = (group: any, composition: CompositionEntry[]) => {
      let cumulativeWidth = 0;

      composition.forEach(({ key, value }) => {
        const width = (value / 100);
        const color = options.components[key]?.color;
        const rectGeom = getRectGeom(cumulativeWidth, cumulativeWidth + width, color || 'black');
        cumulativeWidth += width;
        group.append('rect').call(setAttrs, rectGeom);
      });
    };

    // Update existing areas
    // eslint-disable-next-line func-names
    selection.each(function (d: DistributionData) {
      const group = select(this);
      group.selectAll('rect').remove(); // Clear previous rects
      updateGroup(group, d.composition);
    });

    // Create new areas
    const newAreas = selection.enter().append('g')
      .classed('area', true)
      .attr('transform', transform);

    // eslint-disable-next-line func-names
    newAreas.each(function (d: DistributionData) {
      const group = select(this);
      updateGroup(group, d.composition);
    });

    selection.exit().remove();
  }
}
