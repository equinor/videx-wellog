import { scaleLinear, ScaleLinear } from 'd3-scale';
import { select, Selection } from 'd3-selection';
import SvgTrack from '../svg-track';
import { setAttrs, setProps } from '../../utils';
import { StackedTrackOptions, AreaData, TransformedAreaData } from './interfaces';
import { OnMountEvent, OnRescaleEvent, OnUpdateEvent } from '../interfaces';

/**
 * Render label for an area
 * @param {SVGGElement} g
 * @param {object} d data record
 * @param {number} trackWidth width of the track.
 * @param {number[]} offsets label offsets
 * @param {number} angle label angle regarding to the main track axis.
 */
function plotLabel(
  g: Selection<HTMLElement, unknown, null, undefined>,
  d: TransformedAreaData,
  trackWidth: number,
  offsets: number[],
  horizontal: boolean,
  angle: number,
) {
  // label
  let height = d.yTo - d.yFrom - offsets[0] - offsets[1];
  let width = trackWidth;
  if (horizontal) {
    // swap width and height
    [width, height] = [height, width];
  }
  g.select('g.label').remove();

  const fontSize = 18;
  if ((fontSize + 2) > height || (fontSize + 2) > width) {
    // Disregard any small areas that cannot display a single letter.
    return;
  }

  // We want the angle to be relative to the main track axis.
  if (!horizontal) {
    angle += 90;
  }

  // Find the label position so that its rotate arround the center of the text.
  let labelX = width / 2;
  let labelY = offsets[0] + height / 2;
  if (horizontal) {
    labelX = offsets[0] + width / 2;
    labelY = height / 2;
  }
  // Because 'alignment-baseline: middle' is not portable,
  // we compute our own label offset so that it will rotate from the text middle
  // instead of the text baseline.
  const rad_angle = angle * Math.PI / 180;
  const dx = Math.sin(rad_angle) * (fontSize + 1) / 3;
  const dy = Math.cos(rad_angle) * (fontSize + 1) / 3;
  labelX -= dx;
  labelY += dy;

  const labelTransform = `translate(${labelX},${labelY})rotate(${angle})`;
  const labelGroup = g.append('g')
    .attr('class', 'label')
    .attr('transform', labelTransform);
  const labelBg = labelGroup.append('rect');
  const label = labelGroup.append('text').text(d.name);
  setProps(label, {
    styles: {
      'text-anchor': 'middle',
      'text-rendering': 'optimizeSpeed',
      'stroke-width': 0.5,
    },
    attrs: {
      class: 'label',
      fill: 'black',
      stroke: '#333',
      'text-anchor': 'middle',
      'font-size': `${fontSize}px`,
    },
  });

  // Computes the with and height of the surrounding rectangle of the rotated label.
  // Note that le label is enlarged by 2 px
  const label_bbox = label.node().getBBox();
  const rot_label_width = Math.abs(Math.cos(rad_angle) * (label_bbox.width + 2)) + Math.abs(Math.sin(rad_angle) * (label_bbox.height + 2));
  const rot_label_height = Math.abs(Math.cos(rad_angle) * (label_bbox.height + 2)) + Math.abs(Math.sin(rad_angle) * (label_bbox.width + 2));
  if (rot_label_width > width || rot_label_height > height) {
    labelGroup.remove();
  } else {
    setAttrs(labelBg, {
      x: label_bbox.x - 1,
      y: label_bbox.y - 1,
      width: label_bbox.width + 2,
      height: label_bbox.height + 2,
      fill: d.color,
    });
  }
}

const defaultOptions = {
  showLines: true,
  showLabels: true,
  labelRotation: 0,
};

/**
 * Track for visualizing area data. Most commonly called formation track
 */
export class StackedTrack extends SvgTrack<StackedTrackOptions> {
  xscale: ScaleLinear<number, number>;

  constructor(id: string | number, options) {
    super(id, { ...defaultOptions, ...options });
  }

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
        (data: AreaData[]) => {
          // Sort the data by 'from' property
          data.sort((a: AreaData, b: AreaData) => a.from - b.from);
          // Merge consecutive areas
          for (let index = 1; index < data.length; index++) {
            const currentArea = data[index];
            const previousArea = data[index - 1];
            if (previousArea.name === currentArea.name
              && previousArea.color.r === currentArea.color.r
              && previousArea.color.g === currentArea.color.g
              && previousArea.color.b === currentArea.color.b
              && previousArea.color.a === currentArea.color.a
              && previousArea.to === currentArea.from) {
              // Merge similar area with previous entry
              previousArea.to = currentArea.to;
              data.splice(index, 1); // Remove the current element after merging
              index--; // Adjust the index after removing an element
            }
          }
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
    if (this.options.horizontal) {
      this.xscale.range([0, this.elm.clientHeight]);
    } else {
      this.xscale.range([0, this.elm.clientWidth]);
    }
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
      return;
    }

    const [min, max] = yscale.domain();

    const areaData: TransformedAreaData[] = [];
    data
      .filter((d: AreaData) => d.to > min && d.from < max)
      .forEach((d: AreaData) => {
        const transformedData: TransformedAreaData = {
          name: d.name,
          yFrom: yscale(d.from),
          yTo: yscale(d.to),
          color: `rgb(${d.color.r},${d.color.g},${d.color.b})`,
          opacity: d.color.a != null ? d.color.a : 1,
        };
        const lastIndex = areaData.length - 1;
        if (
          lastIndex >= 0
          && (transformedData.yTo - areaData[lastIndex].yFrom) < 0.5
        ) {
          // do not make area smaller than 0.5px
          areaData[lastIndex].yTo = transformedData.yTo;
        } else {
          // Add as new entry
          areaData.push(transformedData);
        }
      });

    const selection = g.selectAll('g.area').data(areaData, (d: TransformedAreaData) => d.name);

    const horizontalTransform = (d: TransformedAreaData) => `translate(${d.yFrom}, 0)`;
    const verticalTransform = (d: TransformedAreaData) => `translate(0, ${d.yFrom})`;
    const transform = options.horizontal ? horizontalTransform : verticalTransform;

    selection.attr('transform', transform);

    const horizontalRectGeom = (d: TransformedAreaData) => ({
      x: 0,
      y: xscale(0),
      width: Math.max(0, d.yTo - d.yFrom),
      height: xscale(1),
      fill: d.color,
      'fill-opacity': d.opacity,
    });
    const verticalRectGeom = (d: TransformedAreaData) => ({
      x: xscale(0),
      y: 0,
      width: xscale(1),
      height: Math.max(0, d.yTo - d.yFrom),
      fill: d.color,
      'fill-opacity': d.opacity,
    });
    const rectGeom = options.horizontal ? horizontalRectGeom : verticalRectGeom;

    setAttrs(selection.select('rect'), rectGeom);

    const newAreas = selection.enter().append('g')
      .classed('area', true)
      .attr('transform', transform);

    const box = newAreas.append('rect');
    setAttrs(box, rectGeom);

    if (options.showLines !== false) {
      const lineAttrs = {
        stroke: 'black',
      };

      const sc25 = xscale(0.25);
      const sc50 = xscale(0.50);
      const sc75 = xscale(0.75);
      const horizontalLineData = [
        { className: 'line-top', x1: () => 0, x2: () => 0, y1: () => sc25, y2: () => sc75 },
        { className: 'line-bottom', x1: (d) => d.yTo - d.yFrom, x2: (d) => d.yTo - d.yFrom, y1: () => sc25, y2: () => sc75 },
        { className: 'line-middle', x1: () => 0, x2: (d) => d.yTo - d.yFrom, y1: () => sc50, y2: () => sc50 },
      ];
      const verticalLineData = [
        { className: 'line-top', x1: () => sc25, x2: () => sc75, y1: () => 0, y2: () => 0 },
        { className: 'line-bottom', x1: () => sc25, x2: () => sc75, y1: (d) => d.yTo - d.yFrom, y2: (d) => d.yTo - d.yFrom },
        { className: 'line-middle', x1: () => sc50, x2: () => sc50, y1: () => 0, y2: (d) => d.yTo - d.yFrom },
      ];
      const lineData = options.horizontal ? horizontalLineData : verticalLineData;

      lineData.forEach((l: { className: any; x1: any; y1: any; x2: any; y2: any; }) => {
        const { className, x1, y1, x2, y2 } = l;
        setAttrs(
          selection.select(`line.${className}`),
          (d: TransformedAreaData) => ({ x1: x1(d), y1: y1(d), x2: x2(d), y2: y2(d) }),
        );
        const line = newAreas.append('line');
        setAttrs(
          line,
          (d: TransformedAreaData) => ({ x1: x1(d), y1: y1(d), x2: x2(d), y2: y2(d), class: `${className}`, ...lineAttrs }),
        );
      });
    }

    if (options.showLabels !== false) {
      const [, yMax] = yscale.range();
      const trackWidth = xscale(1) - xscale(0);
      g.selectAll('g.area').each((d: TransformedAreaData, i: number, nodes: HTMLElement[]) => {
        const fg = select(nodes[i]);
        const offsets = [
          Math.max(0, -d.yFrom),
          Math.max(0, d.yTo - yMax),
        ];
        plotLabel(fg, d, trackWidth, offsets, options.horizontal, options.labelRotation);
      });
    }
    selection.exit().remove();
  }
}
