import { scaleLinear, scaleLog } from 'd3';

import {
  LinePlot,
  AreaPlot,
  DotPlot,
  DifferentialPlot,
} from '../../plots/index';

/**
 * Creates a d3 scale from config
 * @param {string} type d3 scale type (linear/log)
 * @param {number[]} domain domain for d3 scale
 * @returns {d3.scale}
 */
export function createScale(type, domain) {
  if (type === 'linear') {
    return scaleLinear().domain(domain);
  }
  if (type === 'log') {
    return scaleLog().domain(domain);
  }
  throw Error('Invalid input!');
}

/**
 * Creates an instance of a differential plot based on config
 * @param {object} config config options to pass to constructor
 * @param {d3.scale} trackScale d3 scale instance to pass to constructor
 * if not provided in plot options
 * @returns {DifferentialPlot}
 */
function createDifferentialPlot(config, trackScale) {
  const xscale1 = config.options.serie1.scale ?
    createScale(config.options.serie1.scale, config.options.serie1.domain) :
    trackScale;
  const xscale2 = config.options.serie2.scale ?
    createScale(config.options.serie2.scale, config.options.serie2.domain) :
    trackScale;
  config.options.legendRows = 2;
  return new DifferentialPlot(
    config.id,
    xscale1,
    xscale2,
    config.options,
  );
}
/**
 * Returns a plot creator function for a specified plot type
 * @param {Class} PlotType Plot class to create
 * @returns {function} plot creator function that takes config and trackScale args
 */
function createPlotType(PlotType) {
  return (config, trackScale) => {
    const xscale = config.options.scale ?
      createScale(config.options.scale, config.options.domain) :
      trackScale;

    config.options.legendRows = 1;
    return new PlotType(
      config.id,
      xscale,
      config.options,
    );
  };
}

/**
 * Dictionary of plot creator functions for available plot types.
 * You may pass your own factory dictionary if you need to support
 * custom plot types not part of this lib.
 */
export const plotFactory = {
  line: createPlotType(LinePlot),
  area: createPlotType(AreaPlot),
  dot: createPlotType(DotPlot),
  differential: createDifferentialPlot,
};
