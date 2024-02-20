import { scaleLinear } from 'd3-scale';
import {
  AreaPlot,
  DifferentialPlot,
  DotPlot,
  LinePlot,
  LineStepPlot
} from '../../../src';
import { Scale } from '../../../src/common/interfaces';
import { ex1, ex3 } from './shared/mock-data';

export default { 
  title: 'Plot types',
};

export const areaPlot = () => {
    const width = 500;
    const height = 500;
  
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
  
    // domain axis scale
    const scale = scaleLinear().domain([0, 500]).range([0, width]) as Scale;
  
    // create instance and set options
    const plot = new AreaPlot(1, {
      scale: 'linear',
      domain: [-1, 1],
      color: '#79c',
      width: 2,
    }).setData(ex1);
  
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

  
export const differentialPlot = () => {
    const width = 500;
    const height = 500;
  
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
  
    // domain axis scale
    const scale = scaleLinear().domain([0, 150]).range([0, width]) as Scale;;
  
    // create instance and set options
    const diffPlot = new DifferentialPlot(1, {
      scale: 'linear',
      domain: [0, 100],
    }).setData(Object.values(ex3));
  
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

  
export const dotPlot = () => {
    const width = 500;
    const height = 500;
  
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
  
    // domain axis scale
    const scale = scaleLinear().domain([0, 200]).range([0, width]) as Scale;;
  
    // create instance and set options
    const plot = new DotPlot(1, {
      scale: 'linear',
      domain: [-1, 1],
    }).setData(ex1);
  
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

export const linePlot = () => {
    const width = 500;
    const height = 500;
  
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
  
    // domain axis scale
    const scale = scaleLinear().domain([0, 200]).range([0, width]) as Scale;;
  
    // create instance and set options
    const plot = new LinePlot(1, {
      scale: 'linear',
      domain: [-1, 1],
    }).setData(ex1);
  
    // standard
    plot.setRange([100, 0])
      .plot(canvas.getContext('2d'), scale);
  
    // change color and line style
    plot.setRange([200, 100])
      .setOption('color', 'green')
      .setOption('width', 3)
      .setOption('dash', [4, 4])
      .plot(canvas.getContext('2d'), scale);
  
    // set multiple options
    plot.setRange([300, 200])
      .setOptions({
        dash: null,
        color: 'purple',
        scale: 'log',
        domain: [0.001, 100],
        width: 4,
        defined: (y, x) => x <= 200 || x >= 240,
      })
      .plot(canvas.getContext('2d'), scale.domain([100, 500]));
  
    return canvas;
  };

  export const lineStepPlot = () => {
    const width = 500;
    const height = 500;
  
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
  
    // domain axis scale
    const scale = scaleLinear().domain([0, 200]).range([0, width]) as Scale;;
  
    // create instance and set options
    const plot = new LineStepPlot(1, {
      scale: 'linear',
      domain: [-1, 1],
    }).setData(ex1);
  
    // standard
    plot.setRange([100, 0])
      .plot(canvas.getContext('2d'), scale);
  
    // change color and line style
    plot.setRange([200, 100])
      .setOption('color', 'green')
      .setOption('width', 3)
      .setOption('dash', [4, 4])
      .plot(canvas.getContext('2d'), scale);
  
    // set multiple options
    plot.setRange([300, 200])
      .setOptions({
        dash: null,
        color: 'purple',
        scale: 'log',
        domain: [0.001, 100],
        width: 4,
        defined: (y, x) => x <= 200 || x >= 240,
      })
      .plot(canvas.getContext('2d'), scale.domain([100, 500]));
  
    return canvas;
  };
