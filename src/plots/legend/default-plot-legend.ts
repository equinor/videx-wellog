import { renderBasicPlotLegend } from './common';
import { D3Selection } from '../../common/interfaces';
import { LegendInfo } from './interfaces';
import { LegendBounds } from '../../utils/legend-helper';
import { Plot } from '..';

/**
 * Renders Default Plot legend to a SVG group element according to bounds.
 */
export default function renderDefaultPlotLegend(
  g: D3Selection,
  bounds: LegendBounds,
  legendInfo: LegendInfo,
  plot: Plot,
) : void {
  renderBasicPlotLegend(
    g,
    bounds,
    legendInfo.label,
    legendInfo.unit,
    plot.scale.domain(),
    plot.options.color,
  );
}
