import { scaleLinear } from 'd3-scale';

import {
  GraphTrack,
  ScaleTrack,
  StackedTrack,
  DualScaleTrack,
  DistributionTrack,
  distributionLegendConfig,
  InterpolatedScaleHandler,
} from '../../../src';

import {
  ex3,
  ex4,
  ex4_large,
  ex4_fix,
  ex7,
  ex7_shortName,
  exampleDistributionData,
} from './shared/mock-data';

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

export const graphTrackPiecewise = {
  render: args => {
    const div = document.createElement('div');
    const width = `${args.width}px`;
    div.style.height = '500px';
    div.style.width = width;

    if (args.horizontal) {
      div.style.width = '500px';
      div.style.height = width;
    }

    const scale = scaleLinear().domain([0, 500]).range([0, 500]);

    const track = new GraphTrack('id', {
      domain: args.domain,
      majorTicksOnly: args.majorTicksOnly,
      horizontal: args.horizontal,
      padding: {
        size: args.paddingSize,
        hideExcessData: args.hideExcessData,
      },
    });

    // Using requestAnimationFrame to ensure that the div is attached
    // to the DOM before calling init
    requestAnimationFrame(() => {
      track.init(div, scale);
    });

    return div;
  },
  args: {
    domain: [0, 20, 50, 100],
    horizontal: false,
    majorTicksOnly: true,
    paddingSize: 20,
    hideExcessData: true,
    width: 200,
  },
};

export const graphTrackMultiplePlots = () => {
  const div = document.createElement('div');
  div.style.height = '500px';
  div.style.width = '100px';

  const scale = scaleLinear().domain([0, 100]).range([0, 500]);

  const track = new GraphTrack('id', {
    data: ex3,
    plots: [
      {
        id: 'noise',
        type: 'area',
        options: {
          color: 'green',
          fillOpacity: 0.3,
          dataAccessor: d => d.noise,
        },
      },
      {
        id: 'sin',
        type: 'line',
        options: {
          color: 'purple',
          width: 3,
          dataAccessor: d => d.sin,
        },
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

export const graphTrackSinglePlot = () => {
  const div = document.createElement('div');
  div.style.height = '500px';
  div.style.width = '100px';

  const scale = scaleLinear().domain([0, 100]).range([0, 500]);

  const track = new GraphTrack('id', {
    scale: 'linear',
    domain: [0, 100],
    data: [
      [0, 0],
      [100, 100],
    ],
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

export const graphTrackReferenceLines = {
  render: args => {
    const div = document.createElement('div');
    div.style.height = '500px';
    div.style.width = '200px';

    const scale = scaleLinear().domain([0, 1000]).range([0, 500]);

    const track = new GraphTrack('id', {
      scale: 'linear',
      domain: [0, 100],
      data: ex3,
      plots: [
        {
          id: 'noise',
          type: 'area',
          options: {
            color: '#f99d1b',
            inverseColor: '#12354e',
            fillOpacity: 1,
            dataAccessor: d => d.noise,
          },
        },
      ],
      referenceLines: [
        {
          value: args.referenceValue,
          color: args.referenceColor,
          width: args.referenceWidth,
          dash: args.dashed ? [6, 4] : undefined,
        },
      ],
    });

    // Using requestAnimationFrame to ensure that the div is attached
    // to the DOM before calling init
    requestAnimationFrame(() => {
      track.init(div, scale);
    });

    return div;
  },
  argTypes: {
    referenceColor: { control: 'color' },
    referenceValue: {
      control: { type: 'number', min: 0, max: 100, step: 1 },
    },
    referenceWidth: { control: { type: 'number', min: 1, max: 10, step: 1 } },
  },
  args: {
    referenceValue: 30,
    referenceColor: 'green',
    referenceWidth: 3,
    dashed: false,
  },
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
  const scaleHandler = new InterpolatedScaleHandler(
    interpolator,
    [-10, 100],
  ).range([0, 500]);

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
  render: args => {
    const div = document.createElement('div');
    div.style.height = '700px';
    div.style.width = '150px';
    div.style.background = 'lightgrey';
    if (args.horizontal) {
      div.style.width = '700px';
      div.style.height = '150px';
    }

    const scale = scaleLinear().domain([0, 1000]).range([0, 700]);

    const datasets = {
      'formation (random small)': ex4,
      'formation (random large)': ex4_large,
      'formation (fix)': ex4_fix,
      'facies (standardName)': ex7,
      'facies (shortName)': ex7_shortName,
    };

    const selectedDataSet = args.dataSet;
    const data = datasets[selectedDataSet];

    const track = new StackedTrack('id', {
      data,
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
    dataSet: {
      control: 'radio',
      options: [
        'formation (random small)',
        'formation (random large)',
        'formation (fix)',
        'facies (standardName)',
        'facies (shortName)',
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
  args: {
    dataSet: 'formation (fix)',
    horizontal: false,
    showLines: true,
    showLabels: true,
    labelRotation: 0,
  },
};

export const distributionTrack = {
  render: args => {
    const div = document.createElement('div');
    div.style.height = '500px';
    div.style.width = '100px';

    const scale = scaleLinear().domain([500, 1000]).range([0, 100]);

    const distributionComponents = {
      carbonate: {
        color: 'FireBrick',
        textColor: '#8E1B1B',
      },
      sand: {
        color: 'SandyBrown',
        textColor: '#9C693E',
      },
      shale: {
        color: 'SlateGrey',
        textColor: '#5a6673',
        patternColor: '#ffffff',
      },
    };

    const distTrack = new DistributionTrack(1, {
      label: 'Distribution',
      abbr: 'Dst',
      data: exampleDistributionData,
      legendConfig: distributionLegendConfig,
      components: distributionComponents,
      interpolationType: args.interpolationType,
    });

    // Using requestAnimationFrame to ensure that the div is attached
    // to the DOM before calling init
    requestAnimationFrame(() => {
      distTrack.init(div, scale);
    });

    return div;
  },
  argTypes: {
    interpolationType: {
      control: 'radio',
      options: [0, 1, 2],
    },
  },
  args: {
    interpolationType: 0,
  },
};
