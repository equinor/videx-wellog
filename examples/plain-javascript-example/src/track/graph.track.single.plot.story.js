import { scaleLinear } from 'd3-scale';
import {
  GraphTrack,
} from '../../../../src';

export const graphTrackSinglePlot = () => {
  const div = document.createElement('div');
  div.style.height = '500px';
  div.style.width = '100px';

  const scale = scaleLinear().domain([0, 100]).range([0, 500]);

  const track = new GraphTrack('id', {
    scale: 'linear',
    domain: [0, 100],
    data: [[0, 0], [100, 100]],
    plots: [
      {
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
