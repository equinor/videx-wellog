import { renderBasicPlotLegend } from './common';

/**
 * Renders Line Plot legend to a SVG group element according to bounds.
 * @param {SVGGElement} g SVG g element to append legend to
 * @param {{width:number,height:number,top:number,left:number}} bounds bounding box
 * @param {{label:string,unit:string}} legendInfo legend label and unit
 * @param {LinePlot} plot Line plot instance
 */
export default function renderLinePlotLegend(g, bounds, legendInfo, plot) {
  g.selectAll('*').remove();
  renderBasicPlotLegend(
    g,
    bounds,
    legendInfo.label,
    legendInfo.unit,
    plot.scale.domain(),
    plot.color,
  );
}
