import { scaleLinear } from 'd3';
import {
  DotPlot,
} from '../../../../src';
import { ex1 as data } from '../shared/mock-data';

export const dotPlot = () => {
  const width = 500;
  const height = 500;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  // domain axis scale
  const scale = scaleLinear().domain([0, 200]).range([0, width]);

  // create instance and set options
  const plot = new DotPlot(1, {
    scale: 'linear',
    domain: [-1, 1],
  }).setData(data);

  // plot
  plot.setRange([90, 0])
    .plot(canvas.getContext('2d'), scale);

  // change color radius
  plot.setRange([190, 100])
    .setOption('color', 'green')
    .setOption('radius', 8)
    .plot(canvas.getContext('2d'), scale);

  // small radius
  plot.setRange([290, 200])
    .setOption('color', 'purple')
    .setOption('radius', 1)
    .plot(canvas.getContext('2d'), scale);

  return canvas;
};
