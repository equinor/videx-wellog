import { select } from 'd3-selection';
import LegendHelper, {
  LegendBounds,
} from '../../utils/legend-helper';
import { D3Selection } from '../../common/interfaces';
import { DistributionTrackOptions } from './interfaces';
import { DistributionTrack } from './distribution-track';

const MarginScale = 0.04;
const PaddingScale = 0.06;

// Helper function for creating rect
const applyRectDimensions = (node: D3Selection, { x, y, width, height }, isHorizontal: boolean) => (
  isHorizontal
    ? node.attr('x', y).attr('y', x).attr('width', height).attr('height', width)
    : node.attr('x', x).attr('y', y).attr('width', width).attr('height', height)
);

function renderDistributionPlotLegend(g: D3Selection, bounds: LegendBounds, options: DistributionTrackOptions) : void {
  const { width, height, left = 0, top = 0 } = bounds;
  const { horizontal = false } = options;

  // Get components in distribution, return if missing
  const components = Object.entries(options.components ?? {});
  if (components.length === 0) return;

  const margin = Math.min(width, height) * MarginScale;
  const padding = Math.min(width, height) * PaddingScale;

  const componentStride = height / components.length;
  const componentHeight = componentStride - margin;
  const componentWidth = width - margin * 2;
  const textSize = componentHeight - padding * 2;

  const textX = left + width / 2;

  components.forEach(([label, component], index) => {
    const color = component.color;
    const y = top + index * componentStride + margin / 2;
    const textY = y + componentHeight / 2;

    applyRectDimensions(
      g.append('rect'),
      {
        x: left + margin,
        y,
        width: componentWidth,
        height: componentHeight,
      },
      horizontal,
    ).attr('fill', color);

    const transform = horizontal
      ? `translate(${textY},${textX})rotate(-90)`
      : `translate(${textX},${textY})`;

    // Append text
    const lbl = g.append('text')
      .attr('transform', transform)
      .attr('font-size', `${textSize}px`)
      .attr('dominant-baseline', 'middle')
      .style('text-anchor', 'middle')
      .style('font-weight', 'bold')
      .attr('fill', color)
      .text(label)
      .node();

    const bbox = lbl.getBBox();
    applyRectDimensions(
      g.insert('rect', () => lbl),
      {
        x: textX - bbox.width / 2 - padding,
        y: y + padding / 2,
        width: bbox.width + padding * 2,
        height: bbox.height + padding / 4,
      },
      horizontal,
    ).attr('fill', 'white');
  });
}

function onUpdateLegend(elm: HTMLElement, bounds: LegendBounds, track: DistributionTrack): void {
  const g = select(elm);
  g.selectAll('*').remove();
  renderDistributionPlotLegend(
    g,
    bounds,
    track.options,
  );
}

function getGraphTrackLegendRows(track: DistributionTrack): number {
  return Object.keys(track.options?.components ?? {}).length || 3;
}

export default LegendHelper.basicLegendSvgConfig(getGraphTrackLegendRows, onUpdateLegend);
