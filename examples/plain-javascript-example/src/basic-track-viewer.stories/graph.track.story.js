import { GraphTrack, BasicTrackViewer } from '../../../../src/index';
import { ScaleTrack, scaleLegendConfig } from '../../../../src/tracks/scale';
import { graphData } from '../shared/mock-data';

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
    data: () => new Promise((resolve) => {
      setTimeout(() => resolve(graphData), 200);
    }),
    showLoader: false,
    plots: [
      {
        id: 'HAZI',
        type: 'line',
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
          data: d => d.DEVI.dataPoints,
        },
      },
      {
        id: 'DLS',
        type: 'line',
        options: {
          color: 'gray',
          scale: 'linear',
          domain: [0, 6],
          data: d => d.DLS.dataPoints,
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
