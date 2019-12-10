import { renderBasicPlotLegend } from './common';
import { setAttrs } from '../../utils';
import { D3Selection } from '../../common/interfaces';
import { LegendBounds } from '../../utils/legend-helper';
import { LegendInfo } from './interfaces';
import AreaPlot from '../area-plot';

/**
 * Renders area legend to a SVG group element according to bounds.
 */
export default function renderAreaPlotLegend(g: D3Selection, bounds: LegendBounds, legendInfo: LegendInfo, plot: AreaPlot) : void {
  const { top, left, width, height } = bounds;
  const shadeH = height / 2;
  const shadeY = top;
  const [min, max] = plot.scale.domain();
  const minIsLeft = min <= max;
  const fillOpacity = Math.min(plot.options.fillOpacity + 0.25, 1);
  const centerX = left + width / 2;
  const useMinAsBase = plot.options.useMinAsBase === undefined ? true : plot.options.useMinAsBase;

  g.selectAll('*').remove();

  if (plot.options.inverseColor) {
    const shadeW = Math.max(0, width - 2);

    const fillNrm = useMinAsBase && minIsLeft
      ? plot.options.color : plot.options.inverseColor;

    const fillInv = useMinAsBase && minIsLeft
      ? plot.options.inverseColor : plot.options.color;

    setAttrs(g.append('rect'), {
      x: left + 2,
      y: shadeY,
      width: shadeW / 2,
      height: shadeH,
      fill: fillNrm,
      'fill-opacity': fillOpacity,
    });

    setAttrs(g.append('rect'), {
      x: centerX,
      y: shadeY,
      width: shadeW / 2,
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
      fill: plot.options.color,
      'fill-opacity': fillOpacity,
    });
  }

  renderBasicPlotLegend(
    g,
    bounds,
    legendInfo.label,
    legendInfo.unit,
    plot.scale.domain(),
    plot.options.color,
    true,
  );
}
