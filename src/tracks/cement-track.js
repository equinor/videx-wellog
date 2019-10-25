import { select, scaleLinear } from 'd3';
import SvgTrack from './svg-track';
import { setProps, setAttrs } from '../utils';

/**
 * Default color
 */
const cementDefaultColor = 'white';

/**
 * Color mapping
 */
const cementQualityColors = new Map([
  ['CEM 1A', 'green'],
  ['CEM 1B', 'green'],
  ['CEM 1C', 'green'],
  ['CHNCem 2A', 'red'],
  ['CHNCem 2B', 'red'],
  ['CHNCem 2C', 'red'],
  ['CONCem 3A', 'green'],
  ['CONCem 3B', 'orange'],
  ['CONCem 3C', 'orange'],
  ['PATCem 4A', 'orange'],
  ['PATCem 4B', 'red'],
  ['MAWCem 4C', 'green'],
  ['MAWCem 4D', 'orange'],
  ['MAWCem 4E', 'red'],
  ['MADCem 4F', 'red'],
  ['GCCem 5', 'red'],
  ['LLCem 6', 'red'],
  ['FORM 7A ', 'green'],
  ['FORM 7B', 'orange'],
  ['FORM 7C', 'red'],
  ['FORMCEM7C', 'red'],
  ['FORMCEM7D', 'orange'],
  ['FORMCEM7E', 'green'],
  ['MUDS 8A', 'red'],
  ['MUDS 8B', 'red'],
  ['MUDS 8C', 'red'],
  ['FPL 9A', 'red'],
  ['FPG 9B', 'red'],
  ['OTHER', 'white'],
  ['PDQ', 'white'],
  [undefined, 'white'],
]);

/**
 * Renders cement label
 * @param {SVGGElement} g
 * @param {object} d data record
 * @param {d3.scale} x x-scale
 * @param {number[]} offsets label offsets
 */
function plotLabel(g, d, x, offsets) {
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
 * Get color by name
 * @param {string} name key
 * @returns {string} color
 */
function getCementQualityColor(name) {
  return cementQualityColors.get(name) || cementDefaultColor;
}

/**
 * Track for showing cement data
 */
export default class CementTrack extends SvgTrack {
  /**
   * Override of onMount from base class
   * @param {object} event
   */
  onMount(event) {
    super.onMount(event);

    const {
      options,
    } = this;

    this.xscale = scaleLinear().domain([0, 1]);

    if (options.data) {
      this.isLoading = true;
      options.data().then(
        data => {
          this.data = data;
          this.isLoading = false;
          this.plot();
          // this.legendUpdate && this.legendUpdate();
        },
        error => super.onError(error),
      );
    }
  }

  /**
   * Override of onUpdate from base class
   * @param {object} event
   */
  onUpdate(event) {
    super.onUpdate(event);
    this.xscale.range([0, this.elm.clientWidth]);
    this.plot();
  }

  /**
   * Override of onRescale from base class
   * @param {object} event
   */
  onRescale(event) {
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
    } = this;

    if (!g) return;

    if (!data || data.length === 0) {
      g.selectAll('g.cement').remove();
    } else {
      const [min, max] = yscale.domain();
      const [, yMax] = yscale.range();

      const cementData = data.dataPoints.map((curr, i, arr) => {
        if (i < arr.length - 1 && curr[1] !== null && curr[0] < max && arr[i + 1][0] > min) {
          return {
            name: curr[1],
            yFrom: yscale(curr[0]),
            yTo: yscale(arr[i + 1][0]),
            color: getCementQualityColor(curr[1]),
          };
        }
        return null;
      }).filter(d => d !== null);
      const selection = g.selectAll('g.cement').data(cementData, d => d.name);

      selection.attr('transform', d => `translate(0,${d.yFrom})`);

      setAttrs(selection.select('rect'), d => {
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
        });
      });

      setAttrs(selection.select('line.line-top'), {
        x1: xscale(0.25),
        x2: xscale(0.75),
      });

      setAttrs(selection.select('line.line-middle'), d => ({
        x1: xscale(0.5),
        x2: xscale(0.5),
        y1: 0,
        y2: d.yTo - d.yFrom,
      }));

      setAttrs(selection.select('line.line-bottom'), d => ({
        x1: xscale(0.25),
        x2: xscale(0.75),
        y1: d.yTo - d.yFrom,
        y2: d.yTo - d.yFrom,
      }));

      const newCement = selection.enter().append('g');
      setAttrs(newCement, d => ({
        class: 'cement',
        transform: `translate(0,${d.yFrom})`,
      }));

      const box = newCement.append('rect');
      setAttrs(box, d => {
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
        });
      });

      const l1 = newCement.append('line');
      setAttrs(l1, {
        x1: xscale(0.25),
        x2: xscale(0.75),
        y1: 0,
        y2: 0,
        stroke: 'black',
        class: 'line-top',
      });

      const l2 = newCement.append('line');
      setAttrs(l2, d => ({
        x1: xscale(0.5),
        x2: xscale(0.5),
        y1: 0,
        y2: d.yTo - d.yFrom,
        stroke: 'black',
        class: 'line-middle',
      }));

      const l3 = newCement.append('line');
      setAttrs(l3, d => ({
        x1: xscale(0.25),
        x2: xscale(0.75),
        y1: d.yTo - d.yFrom,
        y2: d.yTo - d.yFrom,
        stroke: 'black',
        class: 'line-bottom',
      }));

      selection.exit().remove();

      g.selectAll('g.cement').each((d, i, nodes) => {
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
