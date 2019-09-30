import { select } from 'd3';
import {
  renderLinePlotLegend,
  renderAreaPlotLegend,
  renderDifferentialPlotLegend,
  renderDotPlotLegend,
} from '../../plots/legend/index';
import LegendHelper from '../../utils/legend-helper';


function getGraphTrackLegendRows(track) {
  return track.plots.reduce((rows, p) => rows + p.options.legendRows || 0, 0);
}

function updateLegendRows(selection, bounds, width, track) {
  let posY = bounds.top;

  const legendRows = getGraphTrackLegendRows(track);
  const legendRowHeight = bounds.height / legendRows;

  selection.each(function updateLegendRow(plot) {
    const g = select(this);
    const left = plot.offset * width;

    const rowBounds = {
      top: 0,
      left,
      width: width - left,
      height: (plot.options.legendRows || 0) * legendRowHeight,
    };

    g.attr('transform', `translate(0,${posY})`);

    posY += rowBounds.height;

    const legendInfo = track.data && plot.options.legendInfo ?
      plot.options.legendInfo(track.data) :
      {};

    switch (plot.type) {
      case 'line': renderLinePlotLegend(g, rowBounds, legendInfo, plot); break;
      case 'area': renderAreaPlotLegend(g, rowBounds, legendInfo, plot); break;
      case 'dot': renderDotPlotLegend(g, rowBounds, legendInfo, plot); break;
      case 'differential': renderDifferentialPlotLegend(g, rowBounds, legendInfo, plot); break;
      default: break;
    }
  });
}

function onUpdateLegend(elm, bounds, track) {
  const lg = select(elm);

  const w = lg.node().clientWidth;

  const g = lg.select('.svg-legend');
  const rows = g.selectAll('.legend-row').data(track.plots);
  rows.enter().append('g').attrs({
    class: 'legend-row',
  });
  rows.exit().remove();

  g.selectAll('.legend-row').call(updateLegendRows, bounds, w, track);
}

export default LegendHelper.basicLegendSvgConfig(getGraphTrackLegendRows, onUpdateLegend);
