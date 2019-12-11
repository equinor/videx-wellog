import { mouse, select, event } from 'd3';
import { setStyles } from '../utils/d3-utils';
import { D3Selection } from '../common/interfaces';
import { Overlay, OverlayElement, OverlayOptions } from './interfaces';

export default function createOverlay(caller: any, container: D3Selection) : Overlay {
  const overlay = {
    elm: container.append('div').classed('overlay', true),
    elements: {},
    enabled: true,
  };

  const source = overlay.elm.node();

  overlay.elm.on('mousemove', function overlayTrack() {
    if (!overlay.enabled) return;

    const [mx, my] = mouse(this);
    Object.values(overlay.elements).forEach((itm: OverlayElement) => {
      if (itm.options && itm.options.onMouseMove) {
        requestAnimationFrame(() => itm.options.onMouseMove({
          x: mx,
          y: my,
          target: itm.elm,
          source,
          caller,
        }));
      }
    });
  });

  overlay.elm.on('mouseout', () => {
    if (!overlay.enabled) return;
    Object.values(overlay.elements).forEach((itm: OverlayElement) => {
      if (itm.options && itm.options.onMouseExit) {
        requestAnimationFrame(() => itm.options.onMouseExit({
          target: itm.elm,
          source,
          caller,
        }));
      }
    });
  });

  overlay.elm.on('resize', () => {
    const { top, left, width, height } = event.detail;

    setStyles(overlay.elm, {
      width: `${width}px`,
      height: `${height}px`,
      left: `${left}px`,
      top: `${top}px`,
    });

    if (!overlay.enabled) return;

    Object.values(overlay.elements).forEach((itm: OverlayElement) => {
      if (itm.options && itm.options.onResize) {
        requestAnimationFrame(() => itm.options.onResize({
          target: itm.elm,
          source,
          caller,
          width,
          height,
        }));
      }
    });
  });

  function add(key: string, options: OverlayOptions = {}) : HTMLElement {
    const newElm = overlay.elm.append('div')
      .style('position', 'relative')
      .style('pointer-events', 'none')
      .node();
    overlay.elements[key] = {
      elm: newElm,
      options,
    };
    return newElm;
  }

  function remove(key: string) : void {
    const entry = overlay.elements[key];
    if (entry) {
      select(entry.elm).remove();
      delete overlay.elements[key];
    }
  }

  return {
    ...overlay,
    add,
    remove,
  };
}
