import { select } from 'd3-selection';
import Track from './track';
import { setStyles } from '../utils';
import { D3Selection } from '../common/interfaces';
import { TrackOptions, OnMountEvent, OnUpdateEvent } from './interfaces';

/**
 * Base track for tracks that renders HTML content
 */
export default class HtmlTrack extends Track<TrackOptions> {
  container: D3Selection;

  /**
   * Override to add HMTL container for plotting track data
   */
  onMount(trackEvent: OnMountEvent) : void {
    super.onMount(trackEvent);
    this.container = select(trackEvent.elm).append('div').style('position', 'relative');
  }

  /**
   * Override to scale HTML container on resize
   */
  onUpdate(trackEvent: OnUpdateEvent) : void {
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
