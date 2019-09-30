import { renderBasicPlotLegend } from './common';

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
