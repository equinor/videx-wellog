import { select } from 'd3';
import { setAttrs } from '../../utils';
import { D3Selection, Scale } from '../../common/interfaces';
import { LegendBounds, LegendConfig } from '../../utils/legend-helper';
import ScaleTrack from './scale-track';
import DualScaleTrack from './dual-scale-track';

export interface LabelBounds {
  offsetX: number,
  offsetY: number,
  size: number,
  rotateText: boolean,
  length: number,
}

/**
 * Renders scale ticks to selection
 */
export function renderTicks(selection: D3Selection, x: Scale, lb: LabelBounds, max: number) : void {
  // label
  let labelX: number;
  let labelY: number;
  let labelTransform: string;

  if (lb.rotateText) {
    labelX = lb.offsetX + (lb.size - 1.5);
    labelY = -lb.offsetY - (lb.length / 2);
    labelTransform = `translate(${labelX},${labelY})rotate(-90)`;
  } else {
    labelX = lb.offsetX + (lb.length / 2);
    labelY = -lb.offsetY - (lb.size / 6);
    labelTransform = `translate(${labelX},${labelY})`;
  }

  selection.attr('transform', d => `translate(0,${d.y})`);

  selection.select('line').attr('x2', x(max));

  setAttrs(selection.select('rect'), {
    x: lb.offsetX,
    y: lb.offsetY,
    width: lb.rotateText ? lb.size : lb.length,
    height: lb.rotateText ? lb.length : lb.size,
  });

  selection.select('text').text(d => d.v)
    .attr('font-size', `${lb.size}px`)
    .attr('transform', labelTransform);

  const newTicks = selection.enter().append('g')
    .classed('major-tick', true)
    .attr('transform', d => `translate(0,${d.y})`);

  setAttrs(newTicks.append('line'), {
    x1: 0,
    x2: x(max),
    class: 'major-tick-line',
  });

  setAttrs(newTicks.append('rect'), {
    x: lb.offsetX,
    y: lb.offsetY,
    class: 'label-bg',
    width: lb.rotateText ? lb.size : lb.length,
    height: lb.rotateText ? lb.length : lb.size,
  });

  const tickText = newTicks.append('text').text(d => d.v)
    .classed('label', true)
    .style('text-anchor', 'middle');

  setAttrs(tickText, {
    'font-size': `${lb.size}px`,
    'stroke-width': 0.5,
    'font-family': 'Verdana Tahoma Arial',
    transform: labelTransform,
  });

  selection.exit().remove();
}

/**
 * Renders scale ticks to selection horizontally
 */
export function renderHorizontalTicks(selection: D3Selection, x: Scale, lb: LabelBounds, max: number) : void {
  // label
  const labelX = -(lb.offsetX + lb.size / 2);
  const labelY = lb.offsetY + lb.length / 2 + 1.5;
  const labelTransform = `translate(${labelX},${labelY})`;

  selection.attr('transform', d => `translate(${d.y},0)`);

  selection.select('line').attr('y2', x(max));

  setAttrs(selection.select('rect'), {
    x: -lb.length / 2,
    y: lb.offsetY + lb.size / 2,
    width: lb.length,
    height: lb.size,
  });

  selection.select('text').text(d => d.v)
    .attr('font-size', `${lb.size}px`)
    .attr('transform', labelTransform);

  const newTicks = selection.enter().append('g')
    .classed('major-tick', true)
    .attr('transform', d => `translate(${d.y},0)`);

  setAttrs(newTicks.append('line'), {
    y1: 0,
    y2: x(max),
    class: 'major-tick-line',
  });

  setAttrs(newTicks.append('rect'), {
    x: -lb.length / 2,
    y: lb.offsetY + lb.size / 2,
    class: 'label-bg',
    width: lb.length,
    height: lb.size
  });

  const tickText = newTicks.append('text').text(d => d.v)
    .classed('label', true)
    .style('text-anchor', 'middle');

  setAttrs(tickText, {
    'font-size': `${lb.size}px`,
    'stroke-width': 0.5,
    'font-family': 'Verdana Tahoma Arial',
    transform: labelTransform,
  });

  selection.exit().remove();
}


/**
 * Computes the label bounds at a given scale
 */
export function computeLabelBounds(xscale: Scale) : LabelBounds {
  const [, max] = xscale.domain();
  const [, width] = xscale.range();

  const threshold = 12;
  const maxSize = 12;
  const minSize = 9;
  const ratio = 0.4;

  let rotateText = false;
  let length = xscale(max - 4);
  let size = length * ratio;

  if (size < minSize) {
    size = minSize;
    length = size / ratio;
    if (size < threshold) {
      size = Math.max(length, minSize);
      length = size * ratio;
      rotateText = true;
    }
  } else if (size > maxSize) {
    size = maxSize;
    length = size / ratio;
  }

  const offsetX = (width - length) / 2;
  const offsetY = -(size / 2);

  return ({
    offsetX,
    offsetY,
    length: rotateText ? size : length,
    size: rotateText ? length : size,
    rotateText,
  });
}

/**
 * Computes the label bounds at a given scale
 */
export function computeLabelBoundsHorizontal(yscale: Scale) : LabelBounds {
  const [, max] = yscale.domain();
  const [, height] = yscale.range();

  const maxSize = 12;
  const minSize = 9;
  const ratio = 0.4;

  let length = yscale(max - 4);
  let size = length * ratio;

  if (size < minSize) {
    size = minSize;
    length = size / ratio;
  } else if (size > maxSize) {
    size = maxSize;
    length = size / ratio;
  }

  const offsetY = (height - length) / 2;
  const offsetX = -(size / 2);

  return ({
    offsetX,
    offsetY,
    length,
    size,
    rotateText: false,
  });
}

/**
 * Callback when legend needs to be updated
 */
function onUpdateLegend(elm: D3Selection, bounds: LegendBounds, track: ScaleTrack | DualScaleTrack) : void {
  const lg = select(elm);

  const { horizontal, label, abbr } = track.options;
  const [min, max] = track.extent;
  const span = Math.round((max - min) * 2) / 2;

  const { height: h, width: w, top } = bounds;

  const textSize = Math.min(12, w * 0.22);
  const lsp = textSize * 0.1;

  const x = horizontal ? h : w / 2;

  const y0 = (horizontal ? w / 2 + 2 * (textSize + lsp) : top + h);
  const y3 = y0 - (textSize / 1.2);
  const y2 = y3 - textSize + lsp;
  const y1 = y2 - textSize - lsp;

  const g = lg.select('.scale-legend');
  const lbl = g.select('text.scale-title');
  setAttrs(lbl, {
    transform: `translate(${x},${y1})`,
    'font-size': `${textSize}px`,
    fill: track instanceof DualScaleTrack && track.isMaster ? 'black' : '#555',
  });
  lbl.text(abbr || label);

  const val = g.select('text.scale-range');
  setAttrs(val, {
    transform: `translate(${x},${y2})`,
    'font-size': `${textSize}px`,
  });
  val.text(Number.isNaN(span) ? '-' : span);

  const unit = g.select('text.scale-units');
  setAttrs(unit, {
    transform: `translate(${x},${y3})`,
    'font-size': `${textSize / 1.2}px`,
  });
  unit.text(track.options.units || 'units');
}

/**
 * Config object required for track config in order to add legend
 */
export const scaleLegendConfig: LegendConfig = ({
  elementType: 'svg',
  getLegendRows: () => 2,
  onInit: (elm, track, updateTrigger) => {
    track.legendUpdate = updateTrigger;

    const lg = select(elm);
    lg.selectAll('g.scale-legend').remove();

    const g = lg.append('g').attr('class', 'scale-legend');

    g.append('text')
      .classed('scale-title', true)
      .attr('font-weight', '600')
      .style('text-anchor', 'middle');

    g.append('text').attr('class', 'scale-range').style('text-anchor', 'middle');
    g.append('text').attr('class', 'scale-units').style('text-anchor', 'middle');
  },
  onUpdate: onUpdateLegend,
});
