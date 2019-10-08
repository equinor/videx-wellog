import { renderBasicPlotLegend } from './common';
import { setAttrs } from '../../utils';

/**
 * Renders area legend to a SVG group element according to bounds.
 * @param {SVGGElement} g SVG g element to append legend to
 * @param {{width:number,height:number,top:number,left:number}} bounds bounding box
 * @param {{label:string,unit:string}} legendInfo legend label and unit
 * @param {AreaPlot} plot Area plot instance
 */
export default function renderAreaPlotLegend(g, bounds, legendInfo, plot) {
  const { top, left, width, height } = bounds;
  const shadeH = height / 2;
  const shadeY = top;
  const [min, max] = plot.scale.domain();
  const minIsLeft = min <= max;
  const fillOpacity = Math.min(plot.fillOpacity + 0.25, 1);
  const centerX = left + width / 2;

  g.selectAll('*').remove();

  if (plot.options.inverseColor) {
    const shadeW = Math.max(0, width - 2);

    const fillNrm = plot.useMinAsBase && minIsLeft ?
      plot.options.color : plot.options.inverseColor;

    const fillInv = plot.useMinAsBase && minIsLeft ?
      plot.options.inverseColor : plot.options.color;

    setAttrs(g.append('rect'), {
      x: left + 2,
      y: shadeY,
      width: shadeW,
      height: shadeH,
      fill: fillNrm,
      'fill-opacity': fillOpacity,
    });

    setAttrs(g.append('rect'), {
      x: centerX,
      y: shadeY,
      width: shadeW,
      height: shadeH,
      fill: fillInv,
      'fill-opacity': fillOpacity,
    });
  } else {
    setAttrs(g.append('rect'), {
      x: left + 2,
      y: shadeY,
      width: Math.max(0, width - 4),
      height: shadeH,
      fill: plot.color,
      'fill-opacity': fillOpacity,
    });
  }

  renderBasicPlotLegend(
    g,
    bounds,
    legendInfo.label,
    legendInfo.unit,
    plot.scale.domain(),
    plot.color,
    true,
  );
}
