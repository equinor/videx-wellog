import {
  ScaleTrack,
  GraphTrack,
  graphLegendConfig,
  LegendHelper,
  scaleLegendConfig,
  DataHelper,
  ScaleHelper,
} from '../../../../src';
import {
  ex1,
  ex2,
  ex3,
} from '../shared/mock-data';

const downsampleData = (data, scale) => Promise.resolve(Object.keys(data).reduce((res, key) => {
  const points = data[key];
  const downsampled = DataHelper.downsample(points, scale);
  res[key] = downsampled;
  return res;
}, {}));

const resampleData = (data, scale) => Promise.resolve(Object.keys(data).reduce((res, key) => {
  const points = data[key];
  const domain = [points[0][0], points[points.length - 1][0]];
  const ratio = points.length / ScaleHelper.getDomainPixelSpan(scale, domain);
  const resampled = DataHelper.resample(points, ratio, DataHelper.minmax);
  res[key] = resampled;
  return res;
}, {}));

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
    transform: downsampleData,
    filterToScale: true,
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
      id: 'more_noise',
      type: 'line',
      options: {
        scale: 'linear',
        domain: [0, 40],
        color: 'black',
        offset: 0.5,
        filterToScale: true,
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
    transform: downsampleData,
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
        filterToScale: true,
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
        filterToScale: true,
      },
    }],
  }),
];
