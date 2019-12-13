
import { select } from 'd3';
import {
  LogViewer, UIHelper,
} from '../../../../src';
import createTracks from './tracks';

function addRubberbandOverlay(instance) {
  const rubberBandSize = 9;
  const offset = (rubberBandSize - 1) / 2;
  const rbelm = instance.overlay.add('rubber-band', {
    onMouseMove: event => {
      const { y } = event;
      event.target.style.top = `${y - (offset + 0.5)}px`;
      event.target.style.visibility = 'visible';
    },
    onMouseExit: event => {
      event.target.style.visibility = 'hidden';
      if (instance.options.rubberbandExit) {
        instance.options.rubberbandExit({
          source: instance,
        });
      }
    }
  });

  const rb = select(rbelm).classed('rubber-band', true)
    .style('height', `${rubberBandSize}px`)
    .style('background-color', 'rgba(255,0,0,0.1)')
    .style('visibility', 'hidden');

  rb.append('div')
    .style('height', '1px')
    .style('background-color', 'rgba(255,0,0,0.7)')
    .style('position', 'relative')
    .style('top', `${offset}px`);
}

function addReadoutOverlay(instance) {
  const elm = instance.overlay.add('depth', {
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
}

export const withWellogComponent = () => {
  const div = document.createElement('div');
  div.className = 'wellog';

  const trackGroup = new LogViewer({
    onTrackEnter: UIHelper.attachTrackLoader,
  });

  const tracks = createTracks(true);

  // Using requestAnimationFrame to ensure that the div is attached
  // to the DOM before calling init
  requestAnimationFrame(() => {
    trackGroup
      .init(div)
      .setTracks(tracks);

    addReadoutOverlay(trackGroup);
    addRubberbandOverlay(trackGroup);
  });

  return div;
};
