import { GraphTrack, BasicTrackViewer } from '../../../../src/index';
import { ScaleTrack, scaleLegendConfig } from '../../../../src/tracks/scale';
import { graphData } from '../shared/mock-data';

const data = () => new Promise((resolve) => {
  setTimeout(() => resolve(graphData), 200);
});

export const withGraphTrack = () => {
  const scaleTrack = new ScaleTrack('scale', {
    label: 'MD',
    abbr: 'MD',
    units: 'meters',
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
          data: d => d.HAZI.dataPoints,
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
          data: d => d.DEVI.dataPoints,
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
          data: d => d.DLS.dataPoints,
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
          data: d => [
            d.HAZI.dataPoints.map(dp => [dp[0] + 1000, dp[1]]),
            d.DEVI.dataPoints.map(dp => [dp[0] + 1000, dp[1]]),
          ],
        },
      },
    ],
  });

  const div = document.createElement('div');
  const width = 250;
  const height = 400;
  div.style.width = `${width}px`;
  div.style.height = `${height}px`;

  const trackViewer = new BasicTrackViewer([scaleTrack, graphTrack], [100, 3100]);
  requestAnimationFrame(() => trackViewer.init(div));

  return div;
};
