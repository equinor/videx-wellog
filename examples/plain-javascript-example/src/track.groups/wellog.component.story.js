
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

    const elm = trackGroup.overlay.add('depth', {
      onMouseMove: event => {
        const {
          target,
          caller,
          y,
        } = event;
        const md = caller.scale.invert(y);
        target.textContent = Number.isFinite(md)
          ? `MD: ${md.toFixed(1)}`
          : '-';
        target.style.visibility = 'visible';
      },
      onMouseExit: event => {
        event.target.style.visibility = 'hidden';
      },
      onRescale: event => {
        event.target.style.visibility = 'visible';
        event.target.textContent = `Zoom: x${event.transform.k.toFixed(1)}`;
      }
    });
    elm.style.visibility = 'hidden';
    elm.style.display = 'inline-block';
    elm.style.padding = '2px';
    elm.style.borderRadius = '4px';
    elm.style.textAlign = 'right';
    elm.style.position = 'absolute';
    elm.style.backgroundColor = 'rgba(0,0,0,0.5)';
    elm.style.color = 'white';
    elm.style.right = '5px';
    elm.style.bottom = '5px';
  });

  return div;
};
