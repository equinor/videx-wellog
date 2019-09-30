import { select } from 'd3';

export function renderTicks(selection, x, lb, max) {
  // label
  let labelX;
  let labelY;
  let labelTransform;

  if (lb.rotateText) {
    labelX = lb.offsetX + (lb.size - 1.5);
    labelY = -lb.offsetY - (lb.length / 2);
    labelTransform = `translate(${labelX},${labelY})rotate(-90)`;
  } else {
    labelX = lb.offsetX + (lb.length / 2);
    labelY = -lb.offsetY - (lb.size / 6);
    labelTransform = `translate(${labelX},${labelY})`;
  }

  selection.attrs(d => ({
    transform: `translate(0,${d.y})`,
  }));

  selection.select('line').attrs({
    x2: x(max),
  });

  selection.select('rect').attrs({
    x: lb.offsetX,
    y: lb.offsetY,
    width: lb.rotateText ? lb.size : lb.length,
    height: lb.rotateText ? lb.length : lb.size,
  });

  selection.select('text').text(d => d.v)
    .attr('font-size', `${lb.size}px`)
    .attr('transform', labelTransform);

  const newTicks = selection.enter().append('g').attrs(d => ({
    class: 'major-tick',
    transform: `translate(0,${d.y})`,
  }));

  newTicks.append('line').attrs({
    x1: 0,
    x2: x(max),
    class: 'major-tick-line',
  });

  newTicks.append('rect').attrs({
    x: lb.offsetX,
    y: lb.offsetY,
    class: 'label-bg',
    width: lb.rotateText ? lb.size : lb.length,
    height: lb.rotateText ? lb.length : lb.size,
  });

  newTicks.append('text').text(d => d.v)
    .styles({
      'text-anchor': 'middle',
    })
    .attrs({
      class: 'label',
      'font-size': `${lb.size}px`,
      'stroke-width': 0.5,
      'font-family': 'Verdana Tahoma Arial',
      transform: labelTransform,
    });

  selection.exit().remove();
}

export function computeLabelBounds(xscale) {
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


function onUpdateLegend(elm, bounds, track) {
  const lg = select(elm);

  const w = lg.node().clientWidth;

  const [min, max] = track.extent;
  const span = Math.round((max - min) * 2) / 2;

  const { height: h, top } = bounds;

  const lsp = h * 0.1;
  const x = (w / 2);
  const textSize = Math.min(12, h * 0.25);
  const y1 = top + textSize + lsp;
  const y2 = y1 + textSize + lsp;
  const y3 = y2 + (textSize / 1.2);

  const g = lg.select('.scale-legend');
  const lbl = g.select('text.scale-title').attrs({
    transform: `translate(${x},${y1})`,
    'font-size': `${textSize}px`,
    fill: track.isMaster ? 'black' : '#555',
  });
  lbl.text(track.label);

  const val = g.select('text.scale-range').attrs({
    transform: `translate(${x},${y2})`,
    'font-size': `${textSize}px`,
  });
  val.text(Number.isNaN(span) ? '-' : span);

  const unit = g.select('text.scale-units').attrs({
    transform: `translate(${x},${y3})`,
    'font-size': `${textSize / 1.2}px`,
  });
  unit.text('meters');
}

export const scaleLegendConfig = ({
  elementType: 'svg',
  getLegendRows: () => 2,
  onInit: (elm, track, updateTrigger) => {
    track.legendUpdate = updateTrigger;

    const lg = select(elm);
    lg.selectAll('g.scale-legend').remove();

    const g = lg.append('g').attr('class', 'scale-legend');

    g.append('text').attrs({
      class: 'scale-title',
      'font-weight': '600',
    }).styles({
      'text-anchor': 'middle',
    });
    g.append('text').attr('class', 'scale-range').styles({
      'text-anchor': 'middle',
    });
    g.append('text').attr('class', 'scale-units').styles({
      'text-anchor': 'middle',
    });
  },
  onUpdate: onUpdateLegend,
});
