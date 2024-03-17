import { scaleLinear } from 'd3-scale';

import {
  CorePhotosTrack,
  GraphTrack,
  ScaleTrack,
  StackedTrack,
  DualScaleTrack,
  InterpolatedScaleHandler
} from '../../../src';

import { ex3, ex4, ex4_large, ex4_fix, ex7, ex7_shortName } from './shared/mock-data';

import core_photos_data from './shared/core-photos-data.json';

export default { title: 'Track types' };

export const graphTrack = () => {
  const div = document.createElement('div');
  div.style.height = '500px';
  div.style.width = '100px';

  const scale = scaleLinear().domain([0, 10]).range([0, 500]);

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

  const scale = scaleLinear().domain([0, 100]).range([0, 500]);

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

  const scale = scaleLinear().domain([0, 100]).range([0, 500]);

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

  const scale = scaleLinear().domain([0, 100]).range([0, 500]);

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

  const scale = scaleLinear().domain([0, 100]).range([0, 500]);
  const track = new ScaleTrack('id');

  // Using requestAnimationFrame to ensure that the div is attached
  // to the DOM before calling init
  requestAnimationFrame(() => {
    track.init(div, scale);
  });

  return div;
};

export const stackedTrack = {
  render: (args) => {
    const div = document.createElement('div');
    div.style.height = '700px';
    div.style.width = '150px';
    div.style.background = 'lightgrey';
    if(args.horizontal){
      div.style.width = '700px';
      div.style.height = '150px';
    }

    const scale = scaleLinear().domain([0, 1000]).range([0, 700]);

    const datasets = {
      'formation (random small)': ex4,
      'formation (random large)': ex4_large,
      'formation (fix)': ex4_fix,
      'facies (standardName)': ex7,
      'facies (shortName)': ex7_shortName
  };
  const selectedDataSet = args.dataSet;
  const data = datasets[selectedDataSet];

    const track = new StackedTrack('id', {
      data: data,
      horizontal: args.horizontal,
      showLines: args.showLines,
      showLabels: args.showLabels,
      labelRotation: args.labelRotation,
    });

    // Using requestAnimationFrame to ensure that the div is attached
    // to the DOM before calling init
    requestAnimationFrame(() => {
      track.init(div, scale);
    });

    return div;
  },
  argTypes: {
    dataSet:{
      control: 'radio', 
      options: [
        'formation (random small)',
        'formation (random large)',
        'formation (fix)',
        'facies (standardName)',
        'facies (shortName)'
      ],
    },
    labelRotation: {
      control: {
        type: 'number',
        min: -180,
        max: 180,
        step: 10,
      },
    },
  },
  args:{
    dataSet: 'formation (fix)',
    horizontal: false,
    showLines: true,
    showLabels: true,
    labelRotation: 0,
  },
};

export const corePhotosTrack = {
  render: (args) => {
    const div = document.createElement('div');
    div.style.height = '700px';
    div.style.width = '150px';
    div.style.background = 'lightgrey';
    if(args.horizontal){
      div.style.width = '700px';
      div.style.height = '150px';
    }

    const scale = scaleLinear().domain([5861, 5879]).range([0, 700]);


    const photos = core_photos_data.Photos;
    const images = photos.map((photo) => {
      const range = photo.depthRange.split('-');

      return {
        from: parseInt(range[0], 10),
        to: parseInt(range[1], 10),
        url: photo.url,
        index: photo.section,
        lighting: photo.lighting,
      };
    });
    const track = new CorePhotosTrack('core photos', {
      data: () => new Promise(resolve => resolve({ images, plugs: core_photos_data.Plugs })),
      horizontal: args.horizontal,
    });

    // Using requestAnimationFrame to ensure that the div is attached
    // to the DOM before calling init
    requestAnimationFrame(() => {
      track.init(div, scale);
    });

    return div;
  },
  args:{
    horizontal: false,

  },
};