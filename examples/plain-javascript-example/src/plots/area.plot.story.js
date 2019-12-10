
import { scaleLinear } from 'd3';
import {
  AreaPlot,
} from '../../../../src';
import { ex1 as data } from '../shared/mock-data';

export const withAreaPlot = () => {
  const width = 500;
  const height = 500;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  // domain axis scale
  const scale = scaleLinear().domain([0, 500]).range([0, width]);

  // create instance and set options
  const areaPlot = new AreaPlot(1, {
    scale: 'linear',
    domain: [-1, 1],
    color: 'blue',
    width: 2,
  }).setData(data);

  // plot
  areaPlot.setRange([90, 0])
    .plot(canvas.getContext('2d'), scale);

  // change color and fill opacity
  areaPlot.setRange([190, 100])
    .setOption('color', 'green')
    .setOption('fillOpacity', 0.4)
    .plot(canvas.getContext('2d'), scale);

  // max value as base
  areaPlot.setRange([320, 220])
    .setOption('color', 'orange')
    .setOption('useMinAsBase', false)
    .plot(canvas.getContext('2d'), scale);

  // inverse color
  areaPlot.setRange([390, 300])
    .setOption('inverseColor', 'yellow')
    .plot(canvas.getContext('2d'), scale);

  return canvas;
};
