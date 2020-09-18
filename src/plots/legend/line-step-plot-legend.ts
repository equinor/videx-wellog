import { renderBasicPlotLegend } from './common';
import { D3Selection } from '../../common/interfaces';
import { LegendInfo } from './interfaces';
import { LegendBounds } from '../../utils/legend-helper';
import LineStepPlot from '../line-step-plot';

/**
 * Renders LineStep Plot legend to a SVG group element according to bounds.
 */
export default function renderLineStepPlotLegend(
  g: D3Selection,
  bounds: LegendBounds,
  legendInfo: LegendInfo,
  plot: LineStepPlot,
) : void {
  g.selectAll('*').remove();
  renderBasicPlotLegend(
    g,
    bounds,
    legendInfo.label,
    legendInfo.unit,
    plot.scale.domain(),
    plot.options.color,
  );
}
