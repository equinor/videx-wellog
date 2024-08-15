import { select } from 'd3-selection';
import LegendHelper, {
  LegendBounds,
} from '../../utils/legend-helper';
import { D3Selection } from '../../common/interfaces';
import { DistributionTrackOptions } from './interfaces';
import { DistributionTrack } from './distribution-track';

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

  // Get available height per component
  const componentStride = height / components.length;

  // Margin is used around colored rect, padding around text
  const margin = componentStride * 0.1;
  const padding = componentStride * 0.1;

  const componentHeight = componentStride - margin;
  const componentWidth = width - margin * 2;
  const textSize = componentHeight - padding * 4;

  const textX = left + width / 2;

  components.forEach(([label, component], index) => {
    const color = component.color;
    const textColor = component.textColor ?? color;
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
      .attr('fill', textColor)
      .text(label);

    const node = lbl.node();
    const bbox = node.getBBox();

    // Calculate the expected width, adding extra padding
    const expectedWidth = bbox.width + padding * 4;

    // Get scale for indivdual labels
    const scale = expectedWidth > componentWidth ? componentWidth / expectedWidth : 1;

    // Append the scale to the transform
    lbl.attr('transform', `${transform}scale(${scale})`);

    // Use scaled values when creating background
    const scaledWidth = bbox.width * scale;
    const scaledHeight = bbox.height * scale;

    applyRectDimensions(
      g.insert('rect', () => node),
      {
        x: textX - scaledWidth / 2 - padding / 2,
        y: textY - scaledHeight / 2 - padding / 2,
        width: scaledWidth + padding,
        height: scaledHeight + padding,
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
