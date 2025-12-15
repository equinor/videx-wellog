import { select } from 'd3-selection';
import {
  renderLinePlotLegend,
  renderAreaPlotLegend,
  renderDifferentialPlotLegend,
  renderDotPlotLegend,
  renderLineStepPlotLegend,
  renderDefaultPlotLegend,
} from '../../plots/legend';
import LegendHelper, { LegendBounds } from '../../utils/legend-helper';
import {
  LinePlot,
  AreaPlot,
  DotPlot,
  DifferentialPlot,
  LineStepPlot,
} from '../../plots';
import GraphTrack from './graph-track';
import { D3Selection } from '../../common/interfaces';

/**
 * Function for calculating the number of legend rows required by the track
 */
function getGraphTrackLegendRows(track: GraphTrack): number {
  return track.plots.reduce((rows, p) => rows + p.options.legendRows || 0, 0);
}

/**
 * Updates the selection of legend rows of a graph track
 */
function updateLegendRows(
  selection: D3Selection,
  bounds: LegendBounds,
  track: GraphTrack,
): void {
  const { horizontal } = track.options;
  let posY = bounds.top;
  const padding = track.options.padding?.size ?? 0;
  // If the total padding to be applied to the track is greater than the available width,
  // or the value provided is a negative value,
  // set the padding to zero
  const disablePadding = padding * 2 > bounds.width || padding < 0;
  const legendPadding = disablePadding ? 0 : padding;
  const width = bounds.width - legendPadding;
  const legendRows = getGraphTrackLegendRows(track);
  const legendRowHeight = bounds.height / legendRows;
  selection.each(function updateLegendRow(plot) {
    const g = select(this);
    g.selectAll('*').remove();
    const left = plot.offset * (width - legendPadding) + legendPadding;
    if (track.options.togglePlotFromLegend) {
      g.style('cursor', 'pointer');
      g.append('title').text('Toggle plot on/off');
      g.on('click', () => {
        // makes sure to toggle correctly
        const nextState = !(plot.options.hidden || false);
        g.attr('opacity', nextState ? 0.25 : 1);
        plot.setOption('hidden', nextState);

        // checks toggle option in track-config on plot
        // only in PLT
        if (plot.options.forceDataUpdateOnToggle) {
          track.prepareData();
        }

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

    const legendInfo =
      track.data && plot.options.legendInfo
        ? plot.options.legendInfo(track.data)
        : {};

    if (plot.options.renderLegend) {
      plot.options.renderLegend(g, rowBounds, legendInfo, plot);
    } else if (plot instanceof LinePlot) {
      renderLinePlotLegend(g, rowBounds, legendInfo, plot);
    } else if (plot instanceof AreaPlot) {
      renderAreaPlotLegend(g, rowBounds, legendInfo, plot);
    } else if (plot instanceof DotPlot) {
      renderDotPlotLegend(g, rowBounds, legendInfo, plot);
    } else if (plot instanceof DifferentialPlot) {
      renderDifferentialPlotLegend(g, rowBounds, legendInfo, plot);
    } else if (plot instanceof LineStepPlot) {
      renderLineStepPlotLegend(g, rowBounds, legendInfo, plot);
    } else {
      renderDefaultPlotLegend(g, rowBounds, legendInfo, plot);
    }
  });
}

/**
 * Updates the legend section of a graph track
 */
function onUpdateLegend(
  elm: HTMLElement,
  bounds: LegendBounds,
  track: GraphTrack,
): void {
  const lg = select(elm);

  const g = lg.select('.svg-legend');

  const rows = g
    .selectAll('.legend-row')
    .data(track.plots)
    .call(updateLegendRows, bounds, track);

  // Add new rows
  rows
    .enter()
    .append('g')
    .classed('legend-row', true)
    .call(updateLegendRows, bounds, track);

  // Remove rows without data
  rows.exit().remove();
}

/**
 * A legend config object that can be added to a graph track config
 */
export default LegendHelper.basicLegendSvgConfig(
  getGraphTrackLegendRows,
  onUpdateLegend,
);
