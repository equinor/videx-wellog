import { scaleLinear, scaleLog } from 'd3';

import {
  LinePlot,
  AreaPlot,
  DotPlot,
  DifferentialPlot,
} from '../../plots/index';

export function createScale(type, domain) {
  if (type === 'linear') {
    return scaleLinear().domain(domain);
  }
  if (type === 'log') {
    return scaleLog().domain(domain);
  }
  throw Error('Invalid input!');
}

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

export const plotFactory = {
  line: createPlotType(LinePlot),
  area: createPlotType(AreaPlot),
  dot: createPlotType(DotPlot),
  differential: createDifferentialPlot,
};
