import { scaleLinear } from 'd3';
import {
  ScaleTrack,
} from '../../../../src';

export const scaleTrack = () => {
  const div = document.createElement('div');
  div.style.height = '500px';
  div.style.width = '100px';

  const scale = scaleLinear().domain([0, 100]).range([0, 500]);
  const scaleTrack = new ScaleTrack('id');

  // Using requestAnimationFrame to ensure that the div is attached
  // to the DOM before calling init
  requestAnimationFrame(() => {
    scaleTrack.init(div, scale);
  });

  return div;
};
