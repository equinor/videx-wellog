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

export function createPlot(config, trackScale) {
  // the differential plot consists of two data series and are handled a bit differently
  if (config.type === 'differential') {
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

  // regular plots
  const xscale = config.options.scale ?
    createScale(config.options.scale, config.options.domain) :
    trackScale;

  config.options.legendRows = 1;
  if (config.type === 'line') {
    return new LinePlot(
      config.id,
      xscale,
      config.options,
    );
  }
  if (config.type === 'area') {
    return new AreaPlot(
      config.id,
      xscale,
      config.options,
    );
  }
  if (config.type === 'dot') {
    return new DotPlot(
      config.id,
      xscale,
      config.options,
    );
  }

  throw Error('Invalid input!');
}
