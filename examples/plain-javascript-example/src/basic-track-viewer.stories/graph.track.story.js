import { GraphTrack, BasicTrackViewer } from '../../../../src/index';
import { scaleTrack } from '../shared/standard-tracks';
import { graphData } from '../shared/mock-data';

export const withGraphTrack = () => {

  const track = new GraphTrack('sample', {
    scale: 'linear',
    domain: [0, 360],
    data: () => new Promise((resolve) => {
      setTimeout(() => resolve(graphData), 100);
    }),
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

  const trackViewer = new BasicTrackViewer([scaleTrack, track], [100, 3100]);
  requestAnimationFrame(() => trackViewer.init(div));

  return div;
};
