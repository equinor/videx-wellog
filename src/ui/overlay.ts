import { select, pointer } from 'd3-selection';
import { setStyles } from '../utils/d3-utils';
import { D3Selection } from '../common/interfaces';
import { Overlay, OverlayCallbacks } from './interfaces';

export default function createOverlay(caller: any, container: D3Selection) : Overlay {
  const overlay = {
    elm: container.append('div').classed('overlay', true),
    elements: {},
    listeners: {},
    enabled: true,
  };

  const source = overlay.elm.node();

  overlay.elm.on('click', function overlayTrack(event) {
    if (!overlay.enabled) return;
    const [mx, my] = pointer(event, this);
    Object.keys(overlay.listeners).forEach((key: string) => {
      const target = overlay.elements[key] || null;
      const ops = overlay.listeners[key];

      if (ops && ops.onClick) {
        requestAnimationFrame(() => ops.onClick({
          x: mx,
          y: my,
          target,
          source,
          caller,
        }));
      }
    });
  });

  overlay.elm.on('mousemove', function overlayTrack(event) {
    if (!overlay.enabled) return;

    const [mx, my] = pointer(event, this);
    Object.keys(overlay.listeners).forEach((key: string) => {
      const target = overlay.elements[key] || null;
      const ops = overlay.listeners[key];

      if (ops && ops.onMouseMove) {
        requestAnimationFrame(() => ops.onMouseMove({
          x: mx,
          y: my,
          target,
          source,
          caller,
        }));
      }
    });
  });

  overlay.elm.on('mouseout', () => {
    if (!overlay.enabled) return;
    Object.keys(overlay.listeners).forEach((key: string) => {
      const target = overlay.elements[key] || null;
      const ops = overlay.listeners[key];
      if (ops && ops.onMouseExit) {
        requestAnimationFrame(() => ops.onMouseExit({
          target,
          source,
          caller,
        }));
      }
    });
  });

  overlay.elm.on('resize', event => {
    const { top, left, width, height } = event.detail;

    setStyles(overlay.elm, {
      width: `${width}px`,
      height: `${height}px`,
      left: `${left}px`,
      top: `${top}px`,
    });

    if (!overlay.enabled) return;

    Object.keys(overlay.listeners).forEach((key: string) => {
      const target = overlay.elements[key] || null;
      const ops = overlay.listeners[key];
      if (ops && ops.onResize) {
        requestAnimationFrame(() => ops.onResize({
          target,
          source,
          caller,
          width,
          height,
        }));
      }
    });
  });

  overlay.elm.on('rescale', event => {
    if (!overlay.enabled) return;

    const { transform } = event.detail;

    Object.keys(overlay.listeners).forEach((key: string) => {
      const target = overlay.elements[key] || null;
      const ops = overlay.listeners[key];
      if (ops && ops.onRescale) {
        requestAnimationFrame(() => ops.onRescale({
          target,
          source,
          caller,
          transform,
        }));
      }
    });
  });

  function create(key: string, callbacks?: OverlayCallbacks) : HTMLElement {
    const newElm = overlay.elm.append('div')
      .style('position', 'relative')
      .style('pointer-events', 'none')
      .node();
    overlay.elements[key] = newElm;
    if (callbacks) {
      overlay.listeners[key] = callbacks;
    }
    return newElm;
  }

  function register(key: string, callbacks: OverlayCallbacks) : void {
    overlay.listeners[key] = callbacks;
  }

  function remove(key: string) : void {
    const el = overlay.elements[key];
    if (el) {
      select(el).remove();
      delete overlay.elements[key];
    }
    delete overlay.listeners[key];
  }

  return {
    ...overlay,
    create,
    register,
    remove,
  };
}
