
import {
  WellogComponent,
} from '../../../../src';
import createTracks from './tracks';

export const withWellogComponent = () => {
  const div = document.createElement('div');
  div.style.height = '98vh';
  const trackGroup = new WellogComponent();

  const tracks = createTracks();

  // Using requestAnimationFrame to ensure that the div is attached
  // to the DOM before calling init
  requestAnimationFrame(() => {
    trackGroup
      .init(div)
      .setTracks(tracks);
  });

  setTimeout(() => trackGroup.rescale([900, 960], 5000), 2000);
  return div;
};
