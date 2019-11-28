import { GraphTrack, BasicTrackViewer } from '../../../../src/index';
import { ScaleTrack, scaleLegendConfig } from '../../../../src/tracks/scale';
import { graphData } from '../shared/mock-data';

const data = () => new Promise((resolve) => {
  setTimeout(() => resolve(graphData), 200);
});

export const withMinimalSetup = () => {
  const div = document.createElement('div');

  const scaleTrack = new ScaleTrack();
  const trackViewer = new BasicTrackViewer([scaleTrack]);

  // Using requestAnimationFrame to ensure that the div is attached
  // to the DOM before calling init
  requestAnimationFrame(() => {
    trackViewer.init(div, { width: 100, height: 400 });
  });

  return div;
};

export const withMinimalGraphTrackSetup = () => {
  const div = document.createElement('div');

  const graphTrack = new GraphTrack('id', {
    scale: 'linear',
    domain: [0, 360],
    data: [[0, 0], [100, 360]],
    plots: [
      {
        type: 'line',
      },
    ],
  });
  const trackViewer = new BasicTrackViewer([graphTrack], [0, 100]);

  // Using requestAnimationFrame to ensure that the div is attached
  // to the DOM before calling init
  requestAnimationFrame(() => {
    trackViewer.init(div, { width: 100, height: 400 });
  });

  return div;
};

export const withGraphTrackAndMulitplePlots = () => {
  const scaleTrack = new ScaleTrack('scale', {
    maxWidth: 45,
    legendConfig: scaleLegendConfig,
  });

  const graphTrack = new GraphTrack('sample', {
    scale: 'linear',
    domain: [0, 360],
    data,
    showLoader: false,
    plots: [
      {
        id: 'HAZI',
        type: 'dot',
        options: {
          scale: 'linear',
          domain: [0, 360],
          color: 'blue',
          dataAccessor: d => d.HAZI.dataPoints,
        },
      },
      {
        id: 'DEVI',
        type: 'line',
        options: {
          color: 'red',
          scale: 'linear',
          domain: [0, 90],
          defined: v => v !== undefined,
          dataAccessor: d => d.DEVI.dataPoints,
        },
      },
      {
        id: 'DLS',
        type: 'area',
        options: {
          fillOpacity: 0.5,
          color: 'gray',
          scale: 'linear',
          domain: [0, 6],
          defined: (x, y) => y > 250,
          dataAccessor: d => d.DLS.dataPoints,
        },
      },
      {
        id: 'HAZI|DEVI',
        type: 'differential',
        options: {
          serie1: {
            scale: 'linear',
            domain: [0, 360],
            color: 'red',
            fill: 'gray',
          },
          serie2: {
            scale: 'linear',
            domain: [0, 90],
            color: 'blue',
            fill: 'yellow',
          },
          dataAccessor: d => [
            d.HAZI.dataPoints.map(dp => [dp[0] + 1000, dp[1]]),
            d.DEVI.dataPoints.map(dp => [dp[0] + 1000, dp[1]]),
          ],
        },
      },
    ],
  });

  const div = document.createElement('div');

  const trackViewer = new BasicTrackViewer([scaleTrack, graphTrack], [100, 2000]);

  // Using requestAnimationFrame to ensure that the div is attached
  // to the DOM before calling init
  requestAnimationFrame(() => {
    trackViewer.init(div, { width: 250, height: 400 });
  });

  return div;
};
