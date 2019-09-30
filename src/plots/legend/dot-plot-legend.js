import { renderTextLabels } from './common';

export default function renderDotPlotLegend(g, bounds, legendInfo, plot) {
  const { top, left, width } = bounds;
  const r = Math.min(5, (left + width) * 0.04);
  const cx1 = left + 4 + r;
  const cx2 = Math.max(cx1, left + width - 4 - r);
  const cy = top + r + 2;
  const { color, scale } = plot;
  const { label, unit } = legendInfo;

  g.selectAll('*').remove();

  g.append('circle').attrs({
    cx: cx1,
    cy,
    r,
  }).styles({
    fill: color,
  });

  g.append('circle').attrs({
    cx: cx2,
    cy,
    r,
  }).styles({
    fill: color,
  });

  renderTextLabels(
    g,
    bounds,
    label,
    unit,
    scale.domain(),
    color,
  );
}
