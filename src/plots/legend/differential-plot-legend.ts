import { renderBasicPlotLegend } from './common';
import { setAttrs } from '../../utils';
import { D3Selection } from '../../common/interfaces';
import { LegendBounds } from '../../utils/legend-helper';
import { DifferentialPlotLegendInfo } from './interfaces';
import DifferentialPlot from '../differential-plot';

/**
 * Renders differential plot legend to a SVG group element according to bounds.
 */
export default function renderDifferentialPlotLegend(
  g: D3Selection,
  bounds: LegendBounds,
  legendInfo: DifferentialPlotLegendInfo,
  plot: DifferentialPlot,
) : void {
  const { top, left, width, height } = bounds;

  const d1 = plot.scale1.domain();
  const d2 = plot.scale2.domain();
  const fillOpacity = Math.min(plot.options.fillOpacity + 0.25, 1);
  const centerX = left + width / 2;
  const y1 = top;
  const y2 = top + height * 0.5;
  const y3 = top + height;
  const shadeH = height / 4;
  const shadeW = Math.max(0, (width / 2) - 2);
  const shadeY = y1;
  const {
    serie1: options1,
    serie2: options2,
  } = plot.options;
  const {
    serie1: legend1,
    serie2: legend2,
  } = legendInfo;

  g.selectAll('*').remove();

  if (legend1 && legend1.show) {
    setAttrs(g.append('rect'), {
      x: left + 2,
      y: shadeY,
      width: shadeW,
      height: shadeH,
      fill: options1.fill,
      'fill-opacity': fillOpacity,
    });

    setAttrs(g.append('rect'), {
      x: centerX,
      y: shadeY,
      width: shadeW,
      height: shadeH,
      fill: options2.fill,
      'fill-opacity': fillOpacity,
    });

    renderBasicPlotLegend(
      g,
      {
        ...bounds,
        height: y2 - y1,
      },
      legend1.label,
      legend1.unit,
      d1,
      options1.color,
      true,
    );
  }

  if (legend2 && legend2.show) {
    renderBasicPlotLegend(
      g,
      {
        ...bounds,
        top: y2,
        height: y3 - y2,
      },
      legend2.label,
      legend2.unit,
      d2,
      options2.color,
    );
  }
}
