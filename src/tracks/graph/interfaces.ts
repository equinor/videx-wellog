import { TrackOptions } from '../interfaces';
import { PlotOptions } from '../../plots/interfaces';
import { D3Scale, Domain } from '../../common/interfaces';
import { Plot } from '../../plots';

export type PlotCreatorFunction = (config: PlotConfig, trackScale: D3Scale) => Plot;

export interface PlotConfig {
  id: string|number,
  type: string,
  options: PlotOptions,
}

export interface PlotFactory {
  [propName: string]: PlotCreatorFunction,
}

export interface GraphTrackOptions extends TrackOptions {
  plots?: PlotConfig[],
  data?: Promise<any> | Function | any,
  showLoader?: boolean,
  scale?: string,
  domain?: Domain,
  togglePlotFromLegend?: boolean,
  plotFactory?: PlotFactory,
  transform?: (data:any, scale: D3Scale) => Promise<any>,
}
