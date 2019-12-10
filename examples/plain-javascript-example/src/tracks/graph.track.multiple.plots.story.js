import { scaleLinear } from 'd3';
import {
  GraphTrack,
} from '../../../../src';
import { ex3 } from '../shared/mock-data';

export const graphTrackMultiplePlots = () => {
  const div = document.createElement('div');
  div.style.height = '500px';
  div.style.width = '100px';

  const scale = scaleLinear().domain([0, 100]).range([0, 500]);

  const graphTrack = new GraphTrack('id', {
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
    graphTrack.init(div, scale);
  });

  return div;
};
