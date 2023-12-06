import { scaleLinear } from 'd3';
import {
  AreaPlot,
} from '../../../../src';
import { ex1 as data } from '../shared/mock-data';

export const areaPlot = () => {
  const width = 500;
  const height = 500;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  // domain axis scale
  const scale = scaleLinear().domain([0, 500]).range([0, width]);

  // create instance and set options
  const plot = new AreaPlot(1, {
    scale: 'linear',
    domain: [-1, 1],
    color: '#79c',
    width: 2,
  }).setData(data);

  // plot
  plot.setRange([90, 0])
    .plot(canvas.getContext('2d'), scale);

  // change color and fill opacity
  plot.setRange([190, 100])
    .setOption('color', 'orange')
    .setOption('fillOpacity', 0.25)
    .plot(canvas.getContext('2d'), scale);

  // max value as base
  plot.setRange([320, 220])
    .setOption('color', 'gray')
    .setOption('fillOpacity', 0.7)
    .setOption('useMinAsBase', false)
    .plot(canvas.getContext('2d'), scale);

  // inverse color
  plot.setRange([390, 300])
    .setOption('inverseColor', 'red')
    .plot(canvas.getContext('2d'), scale);

  return canvas;
};
