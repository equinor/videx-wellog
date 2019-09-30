/**
 * Helper functions for creating track legends.
 */

import { select } from 'd3';

/**
 * Creates a basic legend config required by the wellog component
 * @param {function} trackRowsFunc function that return how many rows
 *                                 is required in the legend section for the track
 * @param {function} updateFunc function to be called when legend needs to be updated
 * @returns {object} Legend config object
 */
function basicLegendSvgConfig(trackRowsFunc, updateFunc) {
  return {
    elementType: 'svg',
    getLegendRows: track => trackRowsFunc(track),
    onInit: (elm, track, updateTrigger) => {
      track.legendUpdate = updateTrigger;
      const lg = select(elm);
      lg.selectAll('*').remove();
      lg.append('g').attr('class', 'svg-legend');
    },
    onUpdate: updateFunc,
  };
}
/**
 * Renders a simple rotated text label that is scaled to fit bounds
 * @param {SVGGElement} g element to append text to
 * @param {{width: number, height: number, left: number, right: number}} bounds bounding box
 * @param {string} label label
 * @param {string} abbr abbriviated version of label
 */
function renderBasicVerticalSvgLabel(g, bounds, label, abbr) {
  const { width: w, height: h, left, top } = bounds;

  const y = (top || 0) + h * 0.9;
  const textSize = Math.min(12, Math.min(w, 40) / 3);
  const x = (left || 0) + Math.max(0, (w / 2) - (textSize / 3));

  const lbl = g.append('text').attrs({
    transform: `translate(${x},${y})rotate(90)`,
    'font-size': `${textSize}px`,
  }).styles({
    'text-anchor': 'end',
  });
  lbl.text(label);

  const bbox = lbl.node().getBBox();
  if (bbox.width > h * 0.8) {
    lbl.text(abbr || label);
  }
}

/**
 * Convenience function for quickly creating a legend config object for
 * a rotated label legend.
 * @param {string} label track legend label
 * @param {string} abbr abbreviated version of label
 * @returns {object} Legend config object
 */
function basicVerticalLabel(label, abbr) {
  function onLegendUpdate(elm, bounds, track) {
    const g = select(elm);
    g.selectAll('*').remove();
    renderBasicVerticalSvgLabel(
      g,
      bounds,
      label || track.options.label,
      abbr || track.options.abbr,
    );
  }
  return basicLegendSvgConfig(() => 3, onLegendUpdate);
}

export default {
  basicLegendSvgConfig,
  renderBasicVerticalSvgLabel,
  basicVerticalLabel,
};
