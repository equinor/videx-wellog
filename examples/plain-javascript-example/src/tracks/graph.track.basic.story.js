import { scaleLinear } from 'd3';
import {
  GraphTrack,
} from '../../../../src';

export const withGraphTrack = () => {
  const div = document.createElement('div');
  div.style.height = '500px';
  div.style.width = '100px';

  const scale = scaleLinear().domain([0, 10]).range([0, 500]);

  const graphTrack = new GraphTrack('id');

  // Using requestAnimationFrame to ensure that the div is attached
  // to the DOM before calling init
  requestAnimationFrame(() => {
    graphTrack.init(div, scale);
  });

  return div;
};