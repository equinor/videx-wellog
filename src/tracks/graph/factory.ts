import { scaleLinear, scaleLog } from 'd3-scale';
import {
  LinePlot,
  AreaPlot,
  DotPlot,
  DifferentialPlot,
  LineStepPlot,
  Plot,
} from '../../plots';
import { Scale, Domain } from '../../common/interfaces';
import { PlotOptions, DifferentialPlotOptions } from '../../plots/interfaces';
import { PlotConfig, PlotFactory, PlotCreatorFunction } from './interfaces';

export function patchPlotOptions(options: PlotOptions) {
  if (!options) return {};
  if (options && options.data) {
    options.dataAccessor = options.data;
    delete options.data;
  }
  return options;
}

/**
 * Creates a d3 scale from config
 */
export function createScale(type: string, domain: Domain) : Scale {
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
 */
function createDifferentialPlot(config: PlotConfig, trackScale: Scale) : DifferentialPlot {
  const options: DifferentialPlotOptions = {
    legendRows: 2,
    filterToScale: true,
    ...patchPlotOptions(config.options),
  };

  const p = new DifferentialPlot(
    config.id,
    options,
  );

  if (!options.serie1.scale) {
    p.scale1 = trackScale;
  }

  if (!options.serie2.scale) {
    p.scale2 = trackScale;
  }
  return p;
}

/**
 * Returns a plot creator function for a specified plot type
 */
export function createPlotType(PlotType: { new(id: string | number, options: PlotOptions): Plot }) : PlotCreatorFunction {
  return (config, trackScale) => {
    const options = {
      legendRows: 1,
      filterToScale: true,
      dataAccessor: d => d,
      ...patchPlotOptions(config.options),
    };

    const p = new PlotType(
      config.id,
      options,
    );

    if (!options.scale) {
      p.scale = trackScale;
    }
    return p;
  };
}

/**
 * Dictionary of plot creator functions for available plot types.
 * You may pass your own factory dictionary if you need to support
 * custom plot types not part of this lib.
 */
export const plotFactory: PlotFactory = {
  line: createPlotType(LinePlot),
  area: createPlotType(AreaPlot),
  dot: createPlotType(DotPlot),
  differential: createDifferentialPlot,
  linestep: createPlotType(LineStepPlot),
};
