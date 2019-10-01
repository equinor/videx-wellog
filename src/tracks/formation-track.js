import { select, scaleLinear } from 'd3';
import SvgTrack from './svg-track';

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
  const label = labelGroup.append('text').text(d.name)
    .styles({
      'text-anchor': 'middle',
      'stroke-width': 0.5,
    })
    .attrs({
      class: 'label',
      fill: 'black',
      stroke: '#333',
      'text-anchor': 'middle',
      'font-size': `${textSize}px`,
    });

  const bbox = label.node().getBBox();
  if (bbox.width > height) {
    labelGroup.remove();
  } else {
    labelBg.attrs({
      x: bbox.x - 2,
      y: bbox.y,
      width: bbox.width + 4,
      height: bbox.height,
      fill: d.color,
    });
  }
}

/**
 * Track for visualising formation data.
 * Uses stratigraphy column (units) data and picks data.
 */
export default class FormationTrack extends SvgTrack {
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
      options.data().then(data => {
        this.data = data;
        this.isLoading = false;
        this.plot();
        // this.legendUpdate && this.legendUpdate();
      });
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
      g.selectAll('g.formation').remove();
    } else {
      const [min, max] = yscale.domain();
      const [, yMax] = yscale.range();

      const formationData = data
        .filter(d => d.to > min && d.from < max)
        .map(d => ({
          name: d.name,
          yFrom: yscale(d.from),
          yTo: yscale(d.to),
          color: `rgb(${d.color.r},${d.color.g},${d.color.b})`,
        }));
      const selection = g.selectAll('g.formation').data(formationData, d => d.name);

      selection.attrs(d => ({
        transform: `translate(0,${d.yFrom})`,
      }));

      selection.select('rect').attrs((d) => {
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
        });
      });

      selection.select('line.line-top').attrs({
        x1: xscale(0.25),
        x2: xscale(0.75),
      });

      selection.select('line.line-middle').attrs(d => ({
        x1: xscale(0.5),
        x2: xscale(0.5),
        y1: 0,
        y2: d.yTo - d.yFrom,
      }));

      selection.select('line.line-bottom').attrs(d => ({
        x1: xscale(0.25),
        x2: xscale(0.75),
        y1: d.yTo - d.yFrom,
        y2: d.yTo - d.yFrom,
      }));

      const newFormations = selection.enter().append('g').attrs(d => ({
        class: 'formation',
        transform: `translate(0,${d.yFrom})`,
      }));

      newFormations.append('rect').attrs((d) => {
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

      newFormations.append('line').attrs({
        x1: xscale(0.25),
        x2: xscale(0.75),
        y1: 0,
        y2: 0,
        stroke: 'black',
        class: 'line-top',
      });

      newFormations.append('line').attrs(d => ({
        x1: xscale(0.5),
        x2: xscale(0.5),
        y1: 0,
        y2: d.yTo - d.yFrom,
        stroke: 'black',
        class: 'line-middle',
      }));

      newFormations.append('line').attrs(d => ({
        x1: xscale(0.25),
        x2: xscale(0.75),
        y1: d.yTo - d.yFrom,
        y2: d.yTo - d.yFrom,
        stroke: 'black',
        class: 'line-bottom',
      }));

      selection.exit().remove();

      g.selectAll('g.formation').each((d, i, nodes) => {
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
