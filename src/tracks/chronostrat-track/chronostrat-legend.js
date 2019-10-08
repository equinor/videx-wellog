import { select } from 'd3';
import LegendHelper from '../../utils/legend-helper';
import { setProps, setAttrs } from '../../utils';

/**
 * Renders confidence legend box to legend section
 * @param {number} lineNumber legend row number
 * @param {SVGGElement} g
 * @param {number} w width
 * @param {number} textSize
 * @param {string} color
 * @param {string} text
 */
function renderConfidenceLegendBox(lineNumber, g, w, textSize, color, text) {
  const lblGroup = g.append(['g']).attr('class', 'legend-row');
  const xCenter = w * 0.5;

  const lblLineBlack = lblGroup.append('line');
  const lblLine = lblGroup.append('line');
  const labelBg = lblGroup.append('rect');
  const label = lblGroup.append('text');
  setProps(label, {
    attrs: {
      transform: `translate(${xCenter},0)`,
      'font-size': `${textSize}px`,
    },
    styles: {
      'text-anchor': 'middle',
    },
  });

  label.text(text).style('fill', color);

  const lblBbox = label.node().getBBox();

  const yCenter = -(lblBbox.height / 3);

  setAttrs(lblLineBlack, {
    x1: 2,
    x2: w - 2,
    y1: yCenter,
    y2: yCenter,
    stroke: 'black',
    'stroke-width': 1.5,
  });

  setAttrs(lblLine, {
    x1: w * 0.1,
    x2: w * 0.9,
    y1: yCenter,
    y2: yCenter,
    stroke: color,
    'stroke-width': 1.5,
  });

  setAttrs(labelBg, {
    x: xCenter - (lblBbox.width * 0.5) - 2,
    y: lblBbox.y,
    width: lblBbox.width + 4,
    height: textSize,
    fill: 'white',
    class: 'confidence-background',
  });

  lblGroup.attr('transform', `translate(0,${textSize * lineNumber})`);
}

/**
 * Renders confidence legend to legend section
 * @param {SVGGElement} g
 * @param {{height:number,width:number}} bounds legend bounds
 */
function renderConfidenceLegend(g, bounds) {
  g.selectAll(['g', 'line']).remove();

  const { height: h, width: w, top } = bounds;
  const y = (top || 0) + h * 0.75;
  const textSize = Math.min(8, w * 0.1);

  g.attr('transform', `translate(0,${y})rotate(0)`);

  setAttrs(g.append('line'), {
    x1: 0,
    x2: w + 2,
    y1: -(h * 0.15),
    y2: -(h * 0.15),
    stroke: 'black',
    'stroke-width': 0.5,
    class: 'legend-divider',
  });

  renderConfidenceLegendBox(0, g, w, textSize, 'green', 'Excel./Good');
  renderConfidenceLegendBox(1, g, w, textSize, '#ffc107', 'Fair');
  renderConfidenceLegendBox(2, g, w, textSize, 'red', 'Poor');
}

/**
 * Callback when legend needs to be updated
 * @param {SVGElement} elm legend container
 * @param {{height:number,width:number}} bounds legend bounds
 * @param {ChronostratTrack} track track instance
 */
function onUpdateLegend(elm, bounds, track) {
  const lg = select(elm);
  const g = lg.select('.svg-legend');

  g.selectAll('*').remove();

  let left = 0;
  Object.values(track.lanes).forEach(lane => {
    const laneBounds = {
      top: bounds.top || 0,
      left,
      height: bounds.height * 0.6,
      width: lane.xScale(1) + 2,
    };
    left += laneBounds.width;

    lane.renderLaneSeparator(
      g,
      laneBounds.left + laneBounds.width,
      laneBounds.top + laneBounds.height,
    );
    LegendHelper.renderBasicVerticalSvgLabel(
      g,
      laneBounds,
      lane.title,
      lane.abbr,
    );
  });
  renderConfidenceLegend(g.append('g'), bounds);
}

/**
 * Legend config object that can be used in track config for wellog component
 */
const legendHelper = LegendHelper.basicLegendSvgConfig(() => 3, onUpdateLegend);

export default legendHelper;
