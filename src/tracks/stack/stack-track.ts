import {
  scaleLinear,
  ScaleLinear,
  select,
  Selection,
} from 'd3';
import SvgTrack from '../svg-track';
import { setAttrs, setProps } from '../../utils';
import { StackedTrackOptions, AreaData, TransformedAreaData } from './interfaces';
import { OnMountEvent, OnRescaleEvent, OnUpdateEvent } from '../interfaces';

/**
 * Render label for an area
 * @param {SVGGElement} g
 * @param {object} d data record
 * @param {d3.scale} x x-scale
 * @param {number[]} offsets label offsets
 */
function plotLabel(g: Selection<HTMLElement, unknown, null, undefined>, d: TransformedAreaData, x: ScaleLinear<number, number>, offsets: number[]) {
  // label
  const textSize = Math.min(18, x(0.35));
  const height = d.yTo - d.yFrom - offsets[0] - offsets[1];
  const labelX = x(0.5) - (textSize / 3);
  const labelY = (offsets[0] + (height / 2));
  const labelTransform = `translate(${labelX},${labelY})rotate(90)`;

  g.select('g.label').remove();

  const labelGroup = g.append('g')
    .attr('class', 'label')
    .attr('transform', labelTransform);
  const labelBg = labelGroup.append('rect');
  const label = labelGroup.append('text').text(d.name);
  setProps(label, {
    styles: {
      'text-anchor': 'middle',
      'stroke-width': 0.5,
    },
    attrs: {
      class: 'label',
      fill: 'black',
      stroke: '#333',
      'text-anchor': 'middle',
      'font-size': `${textSize}px`,
    },
  });

  const bbox = label.node().getBBox();
  if (bbox.width > height) {
    labelGroup.remove();
  } else {
    setAttrs(labelBg, {
      x: bbox.x - 2,
      y: bbox.y,
      width: bbox.width + 4,
      height: bbox.height,
      fill: d.color,
    });
  }
}

/**
 * Track for visualising area data. Most commonly called formation track
 */
export class StackedTrack extends SvgTrack {
  options: StackedTrackOptions;
  xscale: ScaleLinear<number, number>;

  /**
   * Override of onMount from base class
   * @param {object} event
   */
  onMount(event: OnMountEvent) {
    super.onMount(event);

    const {
      options,
    } = this;

    this.xscale = scaleLinear().domain([0, 1]);

    if (options.data) {
      this.isLoading = true;
      options.data().then(
        (data: AreaData) => {
          this.data = data;
          this.isLoading = false;
          this.plot();
        },
        (error: Error) => super.onError(error),
      );
    }
  }

  /**
   * Override of onUpdate from base class
   * @param {object} event
   */
  onUpdate(event: OnUpdateEvent) {
    super.onUpdate(event);
    this.xscale.range([0, this.elm.clientWidth]);
    this.plot();
  }

  /**
   * Override of onRescale from base class
   * @param {object} event
   */
  onRescale(event: OnRescaleEvent) {
    super.onRescale(event);
    this.plot();
  }

  /**
   * Override plot from base class. Plots track data.
   */
  plot() {
    const {
      plotGroup: g,
      scale: yscale,
      xscale,
      data,
      options,
    } = this;

    if (!g) return;

    if (!data || data.length === 0) {
      g.selectAll('g.area').remove();
    } else {
      const [min, max] = yscale.domain();
      const [, yMax] = yscale.range();

      const areaData = data
        .filter((d: AreaData) => d.to > min && d.from < max)
        .map((d: AreaData) => ({
          name: d.name,
          yFrom: yscale(d.from),
          yTo: yscale(d.to),
          color: `rgb(${d.color.r},${d.color.g},${d.color.b})`,
          opacity: d.color.a != null ? d.color.a : 1,
        }));
      const selection = g.selectAll('g.area').data(areaData, (d: TransformedAreaData) => d.name);

      selection.attr('transform', (d: TransformedAreaData) => `translate(0,${d.yFrom})`);

      setAttrs(selection.select('rect'), (d: TransformedAreaData) => {
        let from = d.yFrom;
        let to = d.yTo;

        if (d.yTo - d.yFrom <= 0) {
          from = d.yTo;
          to = d.yFrom;
        }
        return ({
          x: xscale(0),
          width: xscale(1),
          height: to - from,
          fill: d.color,
          'fill-opacity': d.opacity,
        });
      });

      const newAreas = selection.enter().append('g')
        .classed('area', true)
        .attr('transform', (d: TransformedAreaData) => `translate(0,${d.yFrom})`);

      const box = newAreas.append('rect');
      setAttrs(box, (d: TransformedAreaData) => {
        let from = d.yFrom;
        let to = d.yTo;

        if (d.yTo - d.yFrom <= 0) {
          from = d.yTo;
          to = d.yFrom;
        }

        return ({
          x: xscale(0),
          y: 0,
          width: xscale(1),
          height: to - from,
          fill: d.color,
          'fill-opacity': d.opacity,
        });
      });

      if (options.showLines !== false) {
        setAttrs(selection.select('line.line-top'), {
          x1: xscale(0.25),
          x2: xscale(0.75),
        });

        setAttrs(selection.select('line.line-middle'), (d: TransformedAreaData) => ({
          x1: xscale(0.5),
          x2: xscale(0.5),
          y1: 0,
          y2: d.yTo - d.yFrom,
        }));

        setAttrs(selection.select('line.line-bottom'), (d: TransformedAreaData) => ({
          x1: xscale(0.25),
          x2: xscale(0.75),
          y1: d.yTo - d.yFrom,
          y2: d.yTo - d.yFrom,
        }));

        const l1 = newAreas.append('line');
        setAttrs(l1, {
          x1: xscale(0.25),
          x2: xscale(0.75),
          y1: 0,
          y2: 0,
          stroke: 'black',
          class: 'line-top',
        });

        const l2 = newAreas.append('line');
        setAttrs(l2, (d: TransformedAreaData) => ({
          x1: xscale(0.5),
          x2: xscale(0.5),
          y1: 0,
          y2: d.yTo - d.yFrom,
          stroke: 'black',
          class: 'line-middle',
        }));

        const l3 = newAreas.append('line');
        setAttrs(l3, (d: TransformedAreaData) => ({
          x1: xscale(0.25),
          x2: xscale(0.75),
          y1: d.yTo - d.yFrom,
          y2: d.yTo - d.yFrom,
          stroke: 'black',
          class: 'line-bottom',
        }));
      }

      selection.exit().remove();

      if (options.showLabels !== false) {
        g.selectAll('g.area').each((d: TransformedAreaData, i: number, nodes: HTMLElement[]) => {
          const fg = select(nodes[i]);
          const offsets = [
            d.yFrom < 0 ? Math.abs(d.yFrom) : 0,
            d.yTo > yMax ? d.yTo - yMax : 0,
          ];
          plotLabel(fg, d, xscale, offsets);
        });
      }
    }
  }
}
