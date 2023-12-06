import { scaleLinear } from 'd3';
import {
  StackedTrack,
} from '../../../../src';
import { ex4 } from '../shared/mock-data';

export const stackedTrack = () => {
  const div = document.createElement('div');
  div.style.height = '500px';
  div.style.width = '100px';
  div.style.background = 'lightgrey';

  const scale = scaleLinear().domain([0, 1000]).range([0, 1000]);

  const track = new StackedTrack('id', {
    data: ex4,
  });

  // Using requestAnimationFrame to ensure that the div is attached
  // to the DOM before calling init
  requestAnimationFrame(() => {
    track.init(div, scale);
  });

  return div;
};
