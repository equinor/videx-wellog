import { select } from 'd3-selection';
import { clamp, lerp } from '@equinor/videx-math';
import LegendHelper, {
  LegendBounds,
  LegendConfig,
  LegendOnUpdateFunction,
} from '../../utils/legend-helper';
import { D3Selection } from '../../common/interfaces';
import { DistributionComponents } from './interfaces';

const Padding = 20;
const LabelPadding = 10;

function renderDistributionLabels(g: D3Selection, bounds: LegendBounds, data: DistributionComponents, horizontal: boolean = false) : void {
  const { width, height, left = 0, top = 0 } = bounds;

  // Get components in distribution, return if missing
  const components = data && Object.entries(data);
  if (!components) return;

  const textSize = Math.min(12, width / 3);
  const squareSize = textSize * 0.75;

  // Find width-span and height to draw labels along. These are relative to track orientation, not screen orientation.
  const wMin = left + Padding;
  const wMax = width - Padding;
  const h = top + height - squareSize;

  // Calculate how many labels we can stack
  const labelSpace = width - Padding * 2;
  const labelCount = clamp(Math.floor(labelSpace / (textSize + LabelPadding)), 1, components.length);

  for (let i = 0; i < labelCount; i++) {
    const [label, component] = components[i];
    const color = component.color;

    // Center a single label; distribute multiple labels evenly.
    const t = labelCount === 1 ? 0.5 : i / (labelCount - 1);

    // Define x and y for label. This is where the colored square is drawn
    let x: number, y: number;
    if (horizontal) {
      y = lerp(wMin, wMax, t);
      x = h;
    } else {
      x = lerp(wMin, wMax, t);
      y = h;
    }

    // Append colored square
    g.append('rect')
      .attr('x', x - squareSize * 0.5)
      .attr('y', y - squareSize * 0.5)
      .attr('width', squareSize)
      .attr('height', squareSize)
      .attr('fill', color);

    // Labels are displayed behind the square
    const transform = horizontal
      ? `translate(${x - squareSize},${y})`
      : `translate(${x},${y - squareSize})rotate(90)`;

    const lbl = g.append('text')
      .attr('transform', transform)
      .attr('font-size', `${textSize}px`)
      .attr('dominant-baseline', 'middle')
      .style('text-anchor', 'end');
    lbl.text(label);

    // TODO: Show short form?
    /*
    const bbox = lbl.node().getBBox();
    if (bbox.width > height * 0.8) {
      lbl.text(label);
    }
    */
  }
}

export function distributionLegendConfig(data: DistributionComponents) : LegendConfig {
  const onLegendUpdate: LegendOnUpdateFunction = (elm, bounds, track) => {
    const g = select(elm);
    g.selectAll('*').remove();
    renderDistributionLabels(
      g,
      bounds,
      data,
      track.options.horizontal,
    );
  };
  return LegendHelper.basicLegendSvgConfig(() => 3, onLegendUpdate);
}
