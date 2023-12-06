import { select } from 'd3';
import { Track } from '../tracks';

/**
 * Helper methods for wellog specific DOM queries
 */
export default class UIHelper {
  /**
   * Find and return the element of elements positioned at a given
   * x-coordinate of its container element.
   * NOTE: Requires elements to be within the same containing DOM element
   * and stacked side-by-side horizontally.
   */
  static pickHStackedElement(elements: HTMLElement[], xpos: number) : HTMLElement {
    for (let i = 0; i < elements.length; i++) {
      const elm = elements[i];
      if (elm && xpos >= elm.offsetLeft && xpos <= elm.offsetLeft + elm.clientWidth) {
        return elm;
      }
    }
    return null;
  }

  /**
   * Find and return the element of elements positioned at a given
   * y-coordinate of its container element.
   * NOTE: Requires elements to be within the same containing DOM element
   * and stacked top-by-down vertically.
   */
  static pickVStackedElement(elements: HTMLElement[], ypos: number) : HTMLElement {
    for (let i = 0; i < elements.length; i++) {
      const elm = elements[i];
      if (elm && ypos >= elm.offsetTop && ypos <= elm.offsetTop + elm.clientHeight) {
        return elm;
      }
    }
    return null;
  }

  /**
   * Create a sample loader element for tracks. Requires track-loader-styles.scss or styles.css.
   * @param elm Track HTML element
   * @param track Track instance
   */
  static attachTrackLoader(elm: HTMLElement, track: Track) {
    const loader = select(elm).append('div').classed('loader hidden', true);
    for (let i = 0; i < 3; i++) {
      loader.append('div').classed('loading-dots', true);
    }
    track.loader = loader.node();
  }
}
