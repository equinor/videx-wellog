import {
  scaleLinear,
  zoom,
  zoomTransform,
  select,
  event as d3event,
} from 'd3';
import { setStyles } from '../utils';

/**
 * A minimalistic wellog track container for displaying wellog tracks.
 * May be helpful as a starting point if you want to create your own
 * custom track container.
 * @deprecated Use TrackGroup instead
 */
export default class BasicTrackViewer {
  tracks: any;
  zoom: any;
  width: number;
  height: number;
  domain: any;
  scale: any;
  container: any;
  currentTransform: () => any;
  /**
   * Create instance
   * @param tracks tracks to be added
   * @param domain y-scale domain
   */
  constructor(tracks, domain = [0, 1000]) {
    this.tracks = tracks || [];
    this.zoom = null;
    this.width = 0;
    this.height = 0;
    this.domain = domain;
    this.scale = scaleLinear().domain(domain);

    this.zoomed = this.zoomed.bind(this);
  }

  /**
   * Hook up to DOM element and add child elements and event handlers
   */
  init(elm: HTMLElement, options: { width?: number, height?: number } = {}) {
    if (options.width) {
      this.width = options.width;
      elm.style.width = `${options.width}px`;
    } else {
      this.width = elm.clientWidth;
    }
    if (options.height) {
      this.height = options.height;
      elm.style.height = `${options.height}px`;
    } else {
      this.height = elm.clientHeight;
    }

    const root = select(elm);

    setStyles(root, {
      'user-select': 'none',
      flex: '1 1 auto',
      'font-family': 'Verdana, Tahoma, sans-serif',
      display: 'flex',
    });
    root.selectAll('*').remove();

    this.container = root
      .append('div')
      .attr('class', 'track-viewer');

    setStyles(this.container, {
      position: 'relative',
      'min-height': 0,
      display: 'flex',
      flex: '1 1 auto',
      'background-color': 'white',
    });

    this.zoom = zoom()
      .scaleExtent([1, 256])
      .on('zoom', this.zoomed);

    this.container.call(this.zoom);

    this.currentTransform = () => zoomTransform(this.container.node());

    this.update();
  }

  /**
   * Update child elements and scale - execute callbacks on added tracks
   */
  update() {
    const {
      container,
      scale,
      height,
      domain,
      tracks,
    } = this;

    scale.domain(domain).range([0, height]);

    const selection = container.selectAll('.track').data(tracks, d => d.id);

    const newTracks = selection.enter().append('div').classed('track', true);

    setStyles(newTracks, d => ({
      flex: `${d.options.width}`,
      'max-width': (d.options.maxWidth ? `${d.options.maxWidth}px` : null),
      'border-right': '1.3px solid #333',
      overflow: 'hidden',
      padding: 0,
      'pointer-events': 'none',
      display: 'flex',
      'flex-direction': 'column',
    }));

    newTracks.each(function addTrackCallback(d) {
      const ev = {
        elm: this,
        scale,
      };
      d.onMount(ev);
    });


    selection.exit().remove();

    this.tracks.forEach(t => t.onUpdate({
      scale,
    }));
  }

  /**
   * Handle zoom/pan events
   */
  zoomed() {
    const { transform } = d3event;
    const transScale = this.scale.copy().domain(this.domain);
    this.scale = transform.rescaleY(transScale);

    this.zoom.translateExtent([
      [0, 0],
      [0, this.height],
    ]);

    this.rescale();
  }

  /**
   * Notify tracks about changed scale/transform so tracks may react to user interaction
   */
  rescale() {
    this.tracks.forEach(track => {
      window.requestAnimationFrame(() => track.onRescale({
        domain: this.scale.domain(),
        transform: this.currentTransform(),
      }));
    });
  }
}
