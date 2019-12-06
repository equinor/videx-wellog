import {
  ScaleTrack,
  GraphTrack,
  graphLegendConfig,
  LegendHelper,
  scaleLegendConfig,
} from '../../../../src';
import {
  ex1,
  ex2,
  ex3,
} from '../shared/mock-data';


export default () => [
  new ScaleTrack(0, {
    maxWidth: 50,
    width: 2,
    label: 'MD',
    abbr: 'MD',
    units: 'mtr',
    legendConfig: scaleLegendConfig,
  }),
  new GraphTrack(1, {
    legendConfig: LegendHelper.basicVerticalLabel('Some label', 'Abbr'),
    scale: 'log',
    domain: [0.1, 1000],
    label: 'Track A',
    width: 2,
  }),
  new GraphTrack(2, {
    label: 'Pointy',
    abbr: 'Pt',
    data: ex1,
    scale: 'linear',
    domain: [0, 1],
    legendConfig: graphLegendConfig,
    plots: [{
      id: 'dots',
      type: 'dot',
      options: {
        color: 'orange',
        legendInfo: () => ({
          label: 'DOT',
          unit: 'bar',
        }),
      },
    }],
  }),
  new GraphTrack(3, {
    label: 'Some noise',
    abbr: 'noise',
    data: ex2,
    legendConfig: graphLegendConfig,
    plots: [{
      id: 'noise',
      type: 'line',
      options: {
        color: 'blue',
        dataAccessor: d => d.noise,
        legendInfo: () => ({
          label: 'Plot1',
          unit: 'mm',
        }),
      },
    }, {
      id: 'sin',
      type: 'line',
      options: {
        scale: 'linear',
        domain: [0, 40],
        color: 'black',
        offset: 0.5,
        dataAccessor: d => d.noise2,
        legendInfo: () => ({
          label: 'Plot2',
          unit: 'Pwr',
        }),
      },
    }],
  }),
  new GraphTrack(4, {
    label: 'Sinus curve',
    abbr: 'sin',
    data: ex3,
    legendConfig: graphLegendConfig,
    plots: [{
      id: 'noise',
      type: 'area',
      options: {
        legendInfo: () => ({
          label: 'Noise',
          unit: 'Amp',
        }),
        color: 'green',
        inverseColor: 'blue',
        useMinAsBase: false,
        width: 0.5,
        fillOpacity: 0.3,
        dataAccessor: d => d.noise,
      },
    }, {
      id: 'sin',
      type: 'line',
      options: {
        color: 'purple',
        width: 3,
        legendInfo: () => ({
          label: 'SIN',
          unit: 'W',
        }),
        dataAccessor: d => d.sin,
      },
    }],
  }),
];
