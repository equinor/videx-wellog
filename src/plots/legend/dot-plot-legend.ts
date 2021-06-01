import { renderTextLabels } from './common';
import { setProps } from '../../utils';
import { D3Selection } from '../../common/interfaces';
import { LegendBounds } from '../../utils/legend-helper';
import { LegendInfo } from './interfaces';
import DotPlot from '../dot-plot';

/**
 * Renders Dot Plot legend to a SVG group element according to bounds.
 */
export default function renderDotPlotLegend(
  g: D3Selection,
  bounds: LegendBounds,
  legendInfo: LegendInfo,
  plot: DotPlot,
) : void {
  const { top, left, width } = bounds;
  const r = Math.min(5, (left + width) * 0.04);
  const cx1 = left + 4 + r;
  const cx2 = Math.max(cx1, left + width - 4 - r);
  const cy = top + r + 2;
  const { scale, options } = plot;
  const { label, unit } = legendInfo;

  setProps(g.append('circle'), {
    attrs: {
      cx: cx1,
      cy,
      r,
    },
    styles: {
      fill: options.color,
    },
  });

  setProps(g.append('circle'), {
    attrs: {
      cx: cx2,
      cy,
      r,
    },
    styles: {
      fill: options.color,
    },
  });

  renderTextLabels(
    g,
    bounds,
    label,
    unit,
    scale.domain(),
    options.color,
  );
}
