import { setProps, setAttrs } from '../../utils';
import { D3Selection } from '../../common/interfaces';
import { LegendBounds } from '../../utils/legend-helper';

// TODO: Allow large font for more than just domains?
interface LegendOptions {
  addLabelBg?: boolean;
  largeFontEnabled?: boolean;
}

/** Helper function to setup a white front background using bounding box of given text. */
const setupDomainBackground = (bg, text) => {
  const bbox = text.node().getBBox();
  setProps(bg, {
    styles: {
      fill: 'white',
    },
    attrs: {
      x: bbox.x - 2,
      y: bbox.y - 2,
      width: bbox.width + 4,
      height: bbox.height + 4,
    },
  });
};

/**
 * Renders label, min/max values for domain and unit
 */
export function renderTextLabels(
  g: D3Selection,
  bounds: LegendBounds,
  label: string,
  unit: string,
  domain: number[],
  color: string,
  { addLabelBg, largeFontEnabled }: LegendOptions = {},
) : void {
  const { height: h, width: w, top, left } = bounds;
  const lineY = top + (h * 0.5);
  const textSize = h * 0.35;
  const centerX = left + w / 2;
  const [min, max] = domain;

  const isLargeFont = (largeFontEnabled && w > 90);

  const unitTextSixe = textSize * 0.85;
  const unitY = lineY + unitTextSixe;

  const domainTextSize = isLargeFont ? (textSize * 1.1) : unitTextSixe;
  const subY = isLargeFont ? (lineY + (domainTextSize / 2) - (h * 0.05)) : (lineY + domainTextSize);

  // #region Label
  const labelX = centerX;
  const labelY = top + textSize;
  const labelTransform = `translate(${labelX},${labelY})`;

  let labelBg;
  if (addLabelBg) {
    labelBg = g.append('rect')
      .classed('label-bg', true)
      .attr('fill', 'white');
  }

  const labelText = g.append('text').text(label);
  setProps(labelText, {
    styles: {
      'text-anchor': 'middle',
      fill: color,
    },
    attrs: {
      class: 'legend-label',
      'font-size': `${textSize}px`,
      transform: labelTransform,
    },
  });

  if (addLabelBg) {
    const bbox = labelText.node().getBBox();
    setAttrs(labelBg, {
      x: (centerX + bbox.x) - 1,
      y: top + 1,
      width: bbox.width + 2,
      height: (h * 0.5) - 2,
    });
  }
  // #endregion

  // #region Unit
  if (unit) {
    const unitX = centerX;
    const unitTransform = `translate(${unitX},${unitY})`;
    const unitText = g.append('text').text(unit);
    setProps(unitText, {
      styles: {
        'text-anchor': 'middle',
        fill: color,
      },
      attrs: {
        class: 'legend-unit',
        'font-size': `${unitTextSixe}px`,
        transform: unitTransform,
      },
    });
  }
  // #endregion

  // #region Domain
  let minBg, maxBg;
  if (isLargeFont) {
    minBg = g.append('rect');
    maxBg = g.append('rect');
  }

  const minText = (Math.abs(min) > 1000 && min % 1000 === 0) ? `${Math.round(min / 1000)}k` : `${min}`;
  const maxText = (Math.abs(max) > 1000 && max % 1000 === 0) ? `${Math.round(max / 1000)}k` : `${max}`;

  const minDomain = g.append('text').text(minText);
  setProps(minDomain, {
    styles: {
      'text-anchor': 'start',
      fill: color,
    },
    attrs: {
      class: 'legend-domain',
      'font-size': `${domainTextSize}px`,
      x: left + 2,
      y: subY,
    },
  });

  const maxDomain = g.append('text').text(maxText);
  setProps(maxDomain, {
    styles: {
      'text-anchor': 'end',
      fill: color,
    },
    attrs: {
      class: 'legend-domain',
      'font-size': `${domainTextSize}px`,
      x: left + w - 2,
      y: subY,
    },
  });

  // Setup font backgrounds after
  if (isLargeFont) {
    setupDomainBackground(minBg, minDomain);
    setupDomainBackground(maxBg, maxDomain);
  }
  // #endregion
}

/**
 * Renders a basic/standard set of layout that are common for most plot-type legends
 */
export function renderBasicPlotLegend(
  g: D3Selection,
  bounds: LegendBounds,
  label: string,
  unit: string,
  domain: number[],
  color: string,
  legendOptions: LegendOptions = {},
) : void {
  const x1 = bounds.left + 2;
  const x2 = Math.max(x1, bounds.left + bounds.width - 2);

  const lineY = bounds.top + (bounds.height * 0.5);
  const lineWidth = bounds.height * 0.1;

  /** Hidden rect behind line to expand clickable graphic. */
  const background = g.append('rect');
  setProps(background, {
    attrs: {
      width: Math.max(0, bounds.width - 4),
      height: bounds.height - 4,
      x: 2,
      y: 2,
      visibility: 'hidden',
    },
  });

  const line = g.append('line');
  setProps(line, {
    attrs: {
      x1,
      x2,
      y1: lineY,
      y2: lineY,
    },
    styles: {
      'stroke-width': lineWidth,
      stroke: color,
      fill: color,
    },
  });

  renderTextLabels(
    g,
    bounds,
    label,
    unit,
    domain,
    color,
    legendOptions,
  );
}
