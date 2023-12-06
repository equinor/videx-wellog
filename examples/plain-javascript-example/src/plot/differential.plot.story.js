import { scaleLinear } from 'd3';
import {
  DifferentialPlot,
} from '../../../../src';
import { ex3 as data } from '../shared/mock-data';

export const differentialPlot = () => {
  const width = 500;
  const height = 500;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  // domain axis scale
  const scale = scaleLinear().domain([0, 150]).range([0, width]);

  // create instance and set options
  const diffPlot = new DifferentialPlot(1, {
    scale: 'linear',
    domain: [0, 100],
  }).setData(Object.values(data));

  // plot
  diffPlot.setRange([90, 0])
    .plot(canvas.getContext('2d'), scale);

  // colors and fills
  diffPlot.setRange([190, 100])
    .setOptions({
      'serie1.color': 'red',
      'serie1.fill': 'yellow',
      'serie2.color': 'blue',
      'serie2.fill': 'green',
    })
    .plot(canvas.getContext('2d'), scale);

  // individual scales
  diffPlot.setRange([380, 280])
    .setOptions({
      fillOpacity: 1,
      'serie1.scale': 'log',
      'serie1.domain': [0.001, 10],
      'serie1.lineWidth': 3,
      'serie2.scale': 'linear',
      'serie2.domain': [-10, 50],
    })
    .plot(canvas.getContext('2d'), scale);

  return canvas;
};
