import { select } from 'd3';
import Track from './track';
import { setStyles } from '../utils';

/**
 * Base track for tracks that renders HTML content
 */
export default class HtmlTrack extends Track {
  /**
   * Override to add HMTL container for plotting track data
   * @param {object} trackEvent
   */
  onMount(trackEvent) {
    super.onMount(trackEvent);
    this.container = select(trackEvent.elm).append('div').style('position', 'relative');
  }

  /**
   * Override to scale HTML container on resize
   * @param {object} trackEvent
   */
  onUpdate(trackEvent) {
    super.onUpdate(trackEvent);

    const {
      container,
      elm,
    } = this;
    if (container) {
      setStyles(container, {
        width: `${elm.clientWidth}px`,
        height: `${elm.clientHeight}px`,
      });
    }
  }
}
