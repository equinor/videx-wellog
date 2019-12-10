import { select } from 'd3';
import {
  renderLinePlotLegend,
  renderAreaPlotLegend,
  renderDifferentialPlotLegend,
  renderDotPlotLegend,
} from '../../plots/legend';
import LegendHelper, { LegendBounds } from '../../utils/legend-helper';
import { LinePlot, AreaPlot, DotPlot, DifferentialPlot } from '../../plots';
import GraphTrack from './graph-track';
import { D3Selection } from '../../common/interfaces';

/**
 * Function for calculating the number of legend rows required by the track
 */
function getGraphTrackLegendRows(track: GraphTrack) : number {
  return track.plots.reduce((rows, p) => rows + p.options.legendRows || 0, 0);
}

/**
 * Updates the selection of legend rows of a graph track
 */
function updateLegendRows(selection: D3Selection, bounds: LegendBounds, track: GraphTrack) : void {
  const { horizontal } = track.options;

  let posY = bounds.top;
  const width = bounds.width;

  const legendRows = getGraphTrackLegendRows(track);
  const legendRowHeight = bounds.height / legendRows;

  selection.each(function updateLegendRow(plot) {
    const g = select(this);
    const left = plot.offset * width;
    if (track.options.togglePlotFromLegend) {
      g.style('cursor', 'pointer');
      g.append('title').text('Toggle plot on/off');
      g.on('click', () => {
        const nextState = !(plot.options.hidden || false);
        g.attr('opacity', nextState ? 0.25 : 1);
        plot.setOption('hidden', nextState);
        track.plot();
      });
    }
    const rowBounds = {
      top: 0,
      left,
      width: width - left,
      height: (plot.options.legendRows || 0) * legendRowHeight,
    };

    if (horizontal) {
      g.attr('transform', `translate(${posY},${bounds.width})rotate(-90)`);
    } else {
      g.attr('transform', `translate(0,${posY})`);
    }


    posY += rowBounds.height;

    const legendInfo = track.data && plot.options.legendInfo
      ? plot.options.legendInfo(track.data)
      : {};

    if (plot instanceof LinePlot) {
      renderLinePlotLegend(g, rowBounds, legendInfo, plot);
    } else if (plot instanceof AreaPlot) {
      renderAreaPlotLegend(g, rowBounds, legendInfo, plot);
    } else if (plot instanceof DotPlot) {
      renderDotPlotLegend(g, rowBounds, legendInfo, plot);
    } else if (plot instanceof DifferentialPlot) {
      renderDifferentialPlotLegend(g, rowBounds, legendInfo, plot);
    }
  });
}

/**
 * Updates the legend section of a graph track
 */
function onUpdateLegend(elm: HTMLElement, bounds: LegendBounds, track: GraphTrack) : void {
  const lg = select(elm);

  const g = lg.select('.svg-legend');
  const rows = g.selectAll('.legend-row').data(track.plots);
  rows.enter().append('g').classed('legend-row', true);
  rows.exit().remove();

  g.selectAll('.legend-row').call(updateLegendRows, bounds, track);
}

/**
 * A legend config object that can be added to a graph track config
 */
export default LegendHelper.basicLegendSvgConfig(getGraphTrackLegendRows, onUpdateLegend);
