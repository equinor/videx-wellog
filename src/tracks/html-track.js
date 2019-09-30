import { select } from 'd3';
import Track from './track';

export default class HtmlTrack extends Track {
  // override
  onMount(trackEvent) {
    super.onMount(trackEvent);
    this.container = select(trackEvent.elm).append('div').styles({
      position: 'relative',
    });
  }

  // override
  onUpdate(trackEvent) {
    super.onUpdate(trackEvent);

    const {
      container,
      elm,
    } = this;
    if (container) {
      container.styles({
        width: `${elm.clientWidth}px`,
        height: `${elm.clientHeight}px`,
      });
    }
  }
}
