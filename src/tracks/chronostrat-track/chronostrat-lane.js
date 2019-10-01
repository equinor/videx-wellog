import { select, scaleLinear } from 'd3';

const confidence = {
  E: 'green',
  G: 'green',
  F: '#ffc107',
  P: 'red',
  unknown: 'white',
};

const nonDepthBoxContentStyle = {
  stroke: '#ccc',
  fill: 'grey',
  'stroke-width': 2,
  'stroke-dasharray': '5 4',
};

const nonDepthBoxOutlineStyle = {
  stroke: 'black',
  fill: 'none',
  'stroke-width': 2,
};

const nonDepthBoxCenterLine = {
  stroke: 'black',
  'stroke-dasharray': '5 4',
};

/**
 * render normal section
 * @param {d3.selection} selection
 * @param {d3.scale} x x-scale
 */
function renderNormalSection(selection, x) {
  selection.select('rect').attrs((d) => {
    let from = d.yFrom;
    let to = d.yTo;

    if (d.yTo - d.yFrom <= 0) {
      from = d.yTo;
      to = d.yFrom;
    }
    return ({
      x: x(0),
      width: x(1),
      height: to - from,
    });
  });

  selection.select('rect.lane-bg').attrs((d) => {
    let from = d.yFrom;
    let to = d.yTo;

    if (d.yTo - d.yFrom <= 0) {
      from = d.yTo;
      to = d.yFrom;
    }
    return ({
      x: x(0),
      width: x(1),
      height: to - from,
    });
  });

  selection.select('line.line-top').attrs({
    x1: x(0),
    x2: x(1),
  });

  selection.select('line.line-top-center').attrs({
    x1: x(0.15),
    x2: x(0.85),
  });

  selection.select('line.line-middle').attrs(d => ({
    x1: x(0.5),
    x2: x(0.5),
    y1: 0,
    y2: d.yTo - d.yFrom,
  }));

  selection.select('line.line-bottom').attrs(d => ({
    x1: x(0),
    x2: x(1),
    y1: d.yTo - d.yFrom,
    y2: d.yTo - d.yFrom,
  }));

  selection.select('line.line-bottom-center').attrs(d => ({
    x1: x(0.15),
    x2: x(0.85),
    y1: d.yTo - d.yFrom,
    y2: d.yTo - d.yFrom,
  }));
}

/**
 * re-render normal section
 * @param {d3.selection} selection
 * @param {d3.scale} x x-scale
 */
function reRenderNormalSection(selection, x) {
  selection.append('rect').attrs((d) => {
    let from = d.yFrom;
    let to = d.yTo;

    if (d.yTo - d.yFrom <= 0) {
      from = d.yTo;
      to = d.yFrom;
    }

    return ({
      x: x(0),
      y: 0,
      width: x(1),
      height: to - from,
      fill: d.color,
    });
  });

  selection.append('line').attrs({
    x1: x(0),
    x2: x(1),
    y1: 0,
    y2: 0,
    stroke: 'black',
    'stroke-width': 1.5,
    class: 'line-top',
  });

  selection.append('line').attrs(d => ({
    x1: x(0.15),
    x2: x(0.85),
    y1: 0,
    y2: 0,
    stroke: confidence[d.confidenceEntry] || confidence.unknown,
    'stroke-width': 1.5,
    class: 'line-top-center',
  }));

  selection.append('line').attrs(d => ({
    x1: x(0.5),
    x2: x(0.5),
    y1: 0,
    y2: d.yTo - d.yFrom,
    stroke: 'black',
    class: 'line-middle',
  }));

  selection.append('line').attrs(d => ({
    x1: x(0),
    x2: x(1),
    y1: d.yTo - d.yFrom,
    y2: d.yTo - d.yFrom,
    stroke: 'black',
    'stroke-width': 1.5,
    class: 'line-bottom',
  }));

  selection.append('line').attrs(d => ({
    x1: x(0.15),
    x2: x(0.85),
    y1: d.yTo - d.yFrom,
    y2: d.yTo - d.yFrom,
    stroke: confidence[d.confidenceExit] || confidence.unknown,
    'stroke-width': 1.5,
    class: 'line-bottom-center',
  }));
}

/**
 * checkDist
 * @param {number} dist
 * @param {boolean} hasDepth
 */
function checkDist(dist, hasDepth) {
  if (hasDepth) return dist;
  return (dist > 40 ? dist : dist / 2);
}

/**
 * get min distance
 * @param {object} d
 */
function getMinDist(d) {
  const distTop = checkDist(d.yFrom - d.top.max, d.top.hasDepth);
  const distBottom = checkDist(d.bottom.max - d.yTo, d.bottom.hasDepth);
  const minDist = distTop > distBottom ? distBottom : distTop;
  return minDist < 20 ? minDist : 20;
}

/**
 * Create a renderable data object from records with no height
 * @param {object} d data record
 * @param {d3.scale} x x-scale
 * @param {object} style css styles
 */
function getNoDepthPolygon(d, x, style) {
  const dist = getMinDist(d);

  if (dist < 1) {
    return ({
      points: ` ${x(0)}, ${d.yCenter},
                ${x(1)}, ${d.yCenter}`,
      ...style,
      stroke: style.fill,
    });
  }

  const yTop = d.yCenter - dist;
  const yBottom = d.yCenter + dist;
  const { yCenter } = d;
  const xLeft = x(0);
  const xCenterLeft = x(0.2);
  const xCenter = x(0.5);
  const xCenterRight = x(0.8);
  const xRight = x(1);

  return ({
    points: ` ${xLeft}, ${yCenter},
              ${xCenterLeft}, ${yTop},
              ${xCenter}, ${yTop},
              ${xCenterRight}, ${yTop},
              ${xRight},${yCenter},
              ${xCenterRight},${yBottom},
              ${xCenter}, ${yBottom},
              ${xCenterLeft}, ${yBottom}`,
    ...style,
  });
}

/**
 * Renders a label for a data record
 * @param {SVGGElement} g svg group to append to
 * @param {object} d data record
 * @param {d3.scale} x x-scale
 * @param {number[]} offsets label offsets
 */
function plotLabel(g, d, x, offsets) {
  const textSize = Math.min(14, x(0.2));
  const textCenter = textSize / 3;
  const height = (d.hasDepth ?
    d.yTo - d.yFrom :
    getMinDist(d) * 2) - offsets[0] - offsets[1];
  const width = x(1);

  const isVertical = height > width;
  const rotation = isVertical ? 90 : 0;
  const labelX = x(0.5) - (isVertical ? textCenter : 0);
  const labelY = offsets[0] + (!d.hasDepth ? d.yCenter + textCenter : (height / 2));

  const textWidthMax = height > width ? height : width;
  const chars = Math.floor(textWidthMax / textCenter) - (isVertical ? 9 : 13);
  const name = d.name.length <= chars ? d.name : `${d.name.substring(0, chars).trim()}...`;

  const labelTransform = `translate(${labelX},${labelY})rotate(${rotation})`;

  g.select('g.label').remove();

  const labelGroup = g.append('g')
    .attr('class', 'label')
    .attr('transform', labelTransform);
  const labelBg = labelGroup.append('rect');
  const label = labelGroup.append('text').text(name)
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
  if ((d.hasDepth ? bbox.height > labelY : false) ||
        bbox.height + 3 >= height ||
        d.name.length > 2 && chars <= 2) {
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
 * Renders svg element for records with no height
 * @param {d3.selection} selection d3 selection
 * @param {d3.scale} x x-scale
 */
function renderNoDepthSection(selection, x) {
  selection.select('polygon.polygon-outline')
    .attrs(d => getNoDepthPolygon(d, x, nonDepthBoxOutlineStyle));

  selection.select('polygon.polygon-content')
    .attrs((d) => {
      nonDepthBoxContentStyle.stroke = confidence[d.confidenceEntry] || confidence.unknown;
      nonDepthBoxContentStyle.fill = d.color || 'white';
      return getNoDepthPolygon(d, x, nonDepthBoxContentStyle);
    });

  selection.select('line.line-center-left').attrs(d => ({
    x1: x(0),
    x2: x(0.25),
    y1: d.yCenter,
    y2: d.yCenter,
    ...nonDepthBoxCenterLine,
  }));

  selection.select('line.line-center-right').attrs(d => ({
    x1: x(0.75),
    x2: x(1),
    y1: d.yCenter,
    y2: d.yCenter,
    ...nonDepthBoxCenterLine,
  }));
}

/**
 * Re-renders svg element for records with no height
 * @param {d3.selection} selection d3 selection
 * @param {d3.scale} x x-scale
 */
function reRenderNoDepthSection(selection, x) {
  selection.append('polygon')
    .attrs(d => getNoDepthPolygon(d, x, nonDepthBoxOutlineStyle))
    .classed('polygon-outline', true);

  selection.append('polygon')
    .attrs((d) => {
      nonDepthBoxContentStyle.stroke = confidence[d.confidenceEntry] || confidence.unknown;
      nonDepthBoxContentStyle.fill = d.color || 'white';
      return getNoDepthPolygon(d, x, nonDepthBoxContentStyle);
    })
    .classed('polygon-content', true);

  selection.append('line').attrs(d => ({
    x1: x(0),
    x2: x(0.25),
    y1: d.yCenter,
    y2: d.yCenter,
    ...nonDepthBoxCenterLine,
    class: 'line-center-left',
  }));

  selection.append('line').attrs(d => ({
    x1: x(0.75),
    x2: x(1),
    y1: d.yCenter,
    y2: d.yCenter,
    ...nonDepthBoxCenterLine,
    class: 'line-center-right',
  }));
}

/**
 * Class for seperating a track in multiple "lanes"
 */
export default class ChronostratLane {
  /**
   * Create instance
   * @param {SVGGElement} g container
   * @param {string} title lane title
   * @param {string} abbr lane abbreviated title
   * @param {number} percent width percentage of total track width
   * @param {boolean} addSeparator whether or not to draw a vertical seperator line
   */
  constructor(g, title, abbr, percent, addSeparator = true) {
    this.title = title;
    this.abbr = abbr;
    this.className = `chronostrat-${title.toLowerCase()}`;
    this.percent = percent;
    this.xScale = scaleLinear().domain([0, 1]);
    this.xTranslate = 0;
    this.addSeparator = addSeparator;
    this.plotGroup = g.append('g').attr('class', 'lane-plot-group');
  }

  /**
   * Handle onChange events from parent track
   */
  onUpdate() {
    this.xScale.range(this.xRange);
  }

  /**
   * Renders vertical line at position x
   * @param {SVGGElement} plotGroup container
   * @param {number} x x-position (pixels relative to container)
   * @param {number} yMax y-poistion to end the line (pixels relative to container)
   */
  renderLaneSeparator(plotGroup, x, yMax) {
    if (!this.addSeparator) return;

    const selection = plotGroup.select(`line.${this.className}-separator`);
    if (selection.empty()) {
      plotGroup.append('line').attrs({
        x1: x,
        x2: x,
        y1: 0,
        y2: yMax,
        stroke: 'grey',
        class: `${this.className}-separator`,
        transform: `translate(${this.xTranslate},0)`,
      });
    } else {
      selection.attrs({
        x1: x,
        x2: x,
        y1: 0,
        y2: yMax,
        transform: `translate(${this.xTranslate},0)`,
      });
    }
  }

  /**
   * Plots the data for this lane
   * @param {d3.scale} scale y-scale
   * @param {object[]} data lane data
   */
  plot(scale, data) {
    const {
      xScale: x,
      plotGroup,
    } = this;

    if (!data || data.length === 0) {
      plotGroup.selectAll(`g.${this.className}`).remove();
    }

    if (data && data.length > 0) {
      const [min, max] = scale.domain();
      const [, yMax] = scale.range();

      this.renderLaneSeparator(plotGroup, x(1) + 2, yMax);

      const chronoData = [];
      data
        .filter(d => d.to > min && d.from < max)
        .forEach((d, i, a) => {
          const prev = i - 1;
          const next = i + 1;
          const bottom = prev > -1 ? a[prev] : null;
          const top = next < a.length ? a[next] : null;
          const topMax = top ? scale(top.to) : 0;
          const bottomMax = bottom ? scale(bottom.from) : yMax;

          chronoData.push({
            name: d.name,
            yFrom: scale(d.from),
            yTo: scale(d.to),
            yCenter: (scale(d.to) - scale(d.from)) / 2,
            color: `rgb(${d.color.r},${d.color.g},${d.color.b})`,
            hasDepth: d.hasDepth,
            confidenceEntry: d.confidenceEntry,
            confidenceExit: d.confidenceExit,
            top: {
              max: topMax,
              hasDepth: top ? top.hasDepth : true,
            },
            bottom: {
              max: bottomMax,
              hasDepth: bottom ? bottom.hasDepth : true,
            },
          });
        });

      const selection = plotGroup.selectAll(`g.${this.className}`).data(chronoData, d => d.name);

      selection.attrs(d => ({
        transform: `translate(${this.xTranslate},${d.yFrom})`,
      }));

      const selectionNoDepth = selection.filter(d => !d.hasDepth);
      renderNoDepthSection(selectionNoDepth, x);

      const selectionNormal = selection.filter(d => d.hasDepth);
      renderNormalSection(selectionNormal, x);

      const newChronoLane = selection.enter().append('g').attrs(d => ({
        class: this.className,
        transform: `translate(${this.xTranslate},${d.yFrom})`,
      }));

      const newChronoLaneNoDepth = newChronoLane.filter(d => !d.hasDepth);
      reRenderNoDepthSection(newChronoLaneNoDepth, x);

      const newChronoLaneNormal = newChronoLane.filter(d => d.hasDepth);
      reRenderNormalSection(newChronoLaneNormal, x);

      selection.exit().remove();

      plotGroup.selectAll(`g.${this.className}`).each((d, i, nodes) => {
        const fg = select(nodes[i]);
        let from = d.yFrom;
        let to = d.yTo;
        if (!d.hasDepth) {
          const dist = d.hasDepth ? getMinDist(d) : 0;
          from = d.yCenter - dist;
          to = d.yCenter + dist;
        }
        const offsets = [
          from < 0 ? Math.abs(from) : 0,
          to > yMax ? to - yMax : 0,
        ];
        plotLabel(fg, d, x, offsets);
      });
    }
  }
}
