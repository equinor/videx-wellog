import { scaleLinear } from 'd3-scale';
import {
  DualScaleTrack,
  InterpolatedScaleHandler
} from '../../../../src';

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
  const scaleHandler = new InterpolatedScaleHandler(interpolator, [-10, 100]).range([0, 500]);

  const track = new DualScaleTrack('id');

  // Using requestAnimationFrame to ensure that the div is attached
  // to the DOM before calling init
  requestAnimationFrame(() => {
    track.onMount({ elm: div, scale, scaleHandler });
    track.onUpdate({ elm: div, scale });
  });

  return div;
};
