import { renderBasicPlotLegend } from './common';
import { D3Selection } from '../../common/interfaces';
import { LegendInfo } from './interfaces';
import { LegendBounds } from '../../utils/legend-helper';
import LinePlot from '../line-plot';

/**
 * Renders Line Plot legend to a SVG group element according to bounds.
 */
export default function renderLinePlotLegend(
  g: D3Selection,
  bounds: LegendBounds,
  legendInfo: LegendInfo,
  plot: LinePlot,
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
