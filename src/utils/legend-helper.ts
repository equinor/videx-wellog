import { select } from 'd3-selection';
import { D3Selection } from '../common/interfaces';
import { Track } from '../tracks';

export type LegendRowsFunction = (track: Track) => number;

export type LegendTriggerFunction = () => void;

export type LegendOnInitFunction = (elm: Element, track: Track, updateTrigger: LegendTriggerFunction) => void;

export interface LegendBounds {
  top: number,
  left: number,
  height: number,
  width: number,
}

export type LegendOnUpdateFunction = (elm: Element, bounds: LegendBounds, track: Track) => void;

export interface LegendConfig {
  elementType: string,
  getLegendRows(track: Track) : number,
  onInit: LegendOnInitFunction,
  onUpdate: LegendOnUpdateFunction,
}

/**
 * Helper functions for creating track legends.
 */
export default class LegendHelper {
  /**
   * Creates a basic legend config required by the wellog component
   */
  static basicLegendSvgConfig(trackRowsFunc: LegendRowsFunction, updateFunc: LegendOnUpdateFunction) : LegendConfig {
    return {
      elementType: 'svg',
      getLegendRows: track => trackRowsFunc(track),
      onInit: (elm, track, updateTrigger) => {
        track.legendUpdate = updateTrigger;
        const lg = select(elm);
        lg.selectAll('*').remove();
        lg.append('g').attr('class', 'svg-legend');
      },
      onUpdate: updateFunc,
    };
  }

  /**
   * Renders a simple rotated text label that is scaled to fit bounds
   */
  static renderBasicVerticalSvgLabel(g: D3Selection, bounds: LegendBounds, label: string, abbr: string, horizontal: boolean = false) : void {
    const { width: w, height: h, left, top } = bounds;

    const y = (top || 0) + h * 0.9;
    const textSize = Math.min(12, Math.min(w, 40) / 3);
    const x = horizontal
      ? (left || 0) + Math.max(0, (w / 2) + (textSize / 3))
      : (left || 0) + Math.max(0, (w / 2) - (textSize / 3));

    const transform = horizontal
      ? `translate(${y},${x})`
      : `translate(${x},${y})rotate(90)`;

    const lbl = g.append('text')
      .attr('transform', transform)
      .attr('font-size', `${textSize}px`)
      .style('text-anchor', 'end');
    lbl.text(label);

    const bbox = lbl.node().getBBox();
    if (bbox.width > h * 0.8) {
      lbl.text(abbr || label);
    }
  }

  /**
   * Convenience function for quickly creating a legend config object for
   * a rotated label legend.
   */
  static basicVerticalLabel(label: string, abbr: string) : LegendConfig {
    function onLegendUpdate(elm, bounds, track) {
      const g = select(elm);
      g.selectAll('*').remove();
      LegendHelper.renderBasicVerticalSvgLabel(
        g,
        bounds,
        label || track.options.label,
        abbr || track.options.abbr,
        track.options.horizontal,
      );
    }
    return LegendHelper.basicLegendSvgConfig(() => 3, onLegendUpdate);
  }
}
