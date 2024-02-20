import { scaleLinear } from 'd3-scale';
import { Scale } from '../../../src/common/interfaces';

import {
  GraphTrack,
  ScaleTrack,
  StackedTrack,
  DualScaleTrack,
  InterpolatedScaleHandler
} from '../../../src';

import { ex3, ex4 } from './shared/mock-data';

export default { title: 'Track types' };

export const graphTrack = () => {
  const div = document.createElement('div');
  div.style.height = '500px';
  div.style.width = '100px';

  const scale = scaleLinear().domain([0, 10]).range([0, 500]) as Scale;

  const track = new GraphTrack('id');

  // Using requestAnimationFrame to ensure that the div is attached
  // to the DOM before calling init
  requestAnimationFrame(() => {
    track.init(div, scale);
  });

  return div;
};

export const graphTrackMultiplePlots = () => {
  const div = document.createElement('div');
  div.style.height = '500px';
  div.style.width = '100px';

  const scale = scaleLinear().domain([0, 100]).range([0, 500]) as Scale;

  const track = new GraphTrack('id', {
    data: ex3,
    plots: [{
      id: 'noise',
      type: 'area',
      options: {
        color: 'green',
        fillOpacity: 0.3,
        dataAccessor: d => d.noise,
      },
    }, {
      id: 'sin',
      type: 'line',
      options: {
        color: 'purple',
        width: 3,
        dataAccessor: d => d.sin,
      },
    }],
  });

  // Using requestAnimationFrame to ensure that the div is attached
  // to the DOM before calling init
  requestAnimationFrame(() => {
    track.init(div, scale);
  });

  return div;
};

export const graphTrackSinglePlot = () => {
  const div = document.createElement('div');
  div.style.height = '500px';
  div.style.width = '100px';

  const scale = scaleLinear().domain([0, 100]).range([0, 500]) as Scale;

  const track = new GraphTrack('id',  {
    scale: 'linear',
    domain: [0, 100],
    data: [[0, 0], [100, 100]],
    plots: [
      {
        id: 'test',
        type: 'line',
      },
    ],
  });

  // Using requestAnimationFrame to ensure that the div is attached
  // to the DOM before calling init
  requestAnimationFrame(() => {
    track.init(div, scale);
  });

  return div;
};

export const dualScaleTrack = () => {
  const div = document.createElement('div');
  div.style.height = '500px';
  div.style.width = '100px';

  const scale = scaleLinear().domain([0, 100]).range([0, 500]) as Scale;

  const forward = v => v / 2;
  const reverse = v => v * 2;
  const interpolator = {
    forward,
    reverse,
    forwardInterpolatedDomain: domain => domain.map(v => forward(v)),
    reverseInterpolatedDomain: domain => domain.map(v => reverse(v)),
  };
  const scaleHandler = new InterpolatedScaleHandler(interpolator, [-10, 100]).range([0, 500]);

  const track = new DualScaleTrack('id');

  // Using requestAnimationFrame to ensure that the div is attached
  // to the DOM before calling init
  requestAnimationFrame(() => {
    track.onMount({ elm: div, scale, scaleHandler });
    track.onUpdate({ elm: div, scale });
  });

  return div;
};

export const scaleTrack = () => {
  const div = document.createElement('div');
  div.style.height = '500px';
  div.style.width = '100px';

  const scale = scaleLinear().domain([0, 100]).range([0, 500]) as Scale;
  const track = new ScaleTrack('id');

  // Using requestAnimationFrame to ensure that the div is attached
  // to the DOM before calling init
  requestAnimationFrame(() => {
    track.init(div, scale);
  });

  return div;
};

export const stackedTrack = () => {
  const div = document.createElement('div');
  div.style.height = '500px';
  div.style.width = '100px';
  div.style.background = 'lightgrey';

  const scale = scaleLinear().domain([0, 1000]).range([0, 1000]) as Scale;

  const track = new StackedTrack('id', {
    data: ex4,
    horizontalLabels: true,
  });

  // Using requestAnimationFrame to ensure that the div is attached
  // to the DOM before calling init
  requestAnimationFrame(() => {
    track.init(div, scale);
  });

  return div;
};