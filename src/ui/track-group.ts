import {
  select,
  event,
  zoom,
  zoomIdentity,
  zoomTransform,
  ZoomBehavior,
  ZoomTransform,
  mouse,
} from 'd3';
import ResizeObserver from 'resize-observer-polyfill';
import createOverlay from './overlay';
import { setProps, setStyles, debouncer, DebounceFunction } from '../utils';
import { ScaleHandler, BasicScaleHandler } from '../scale-handlers';
import { Track } from '../tracks';
import { D3Selection, Domain, D3Scale } from '../common/interfaces';
import { TrackGroupOptions, Overlay } from './interfaces';

const titleBarBaseSize = 18;
const legendBaseSize = 25;
const titleFontSizeFactor = 0.7;
const uiScaleFactor = 800;
const wheelPanFactor = 50;
const transitionDuration = 200;

const defaultOptions = {
  domain: [0, 1000],
  showTitles: true,
  showLegend: true,
  autoResize: true,
  horizontal: false,
  useOverlay: true,
};

interface LegendMap {
  elm: Element,
  track: Track,
}

/**
 * A container component for tracks, with track titles, legends,
 * adding/removing tracks, resizing and user interaction.
 */
export default class TrackGroup {
  public options: TrackGroupOptions;
  public tracks: Track[];
  public container: D3Selection;
  public overlay?: Overlay;
  public zoom: ZoomBehavior<Element, any>;
  public width: number;
  public height: number;
  public debounce: DebounceFunction;
  public legends: {
    [propName: string]: LegendMap,
    [propName: number]: LegendMap,
  };
  public legendRows: number;
  public currentTransform: () => ZoomTransform;

  private _scaleHandler: ScaleHandler;
  private _initialized: boolean;
  private _trackHeight: number;
  private _uiScale: number;
  private _titleHeight: number;
  private _legendHeight: number;
  private _titleFontSize: number;
  private _observer: ResizeObserver;

  constructor(options: TrackGroupOptions = {}) {
    this.options = {
      ...defaultOptions,
      ...options,
    };
    this.tracks = [];
    this.container = null;
    this.zoom = null;
    this.width = 0;
    this.height = 0;
    this.legendRows = 0;
    this.debounce = debouncer();
    this.legends = {};

    this.init = this.init.bind(this);
    this.onMount = this.onMount.bind(this);
    this.onUnmount = this.onUnmount.bind(this);
    this.rescale = this.rescale.bind(this);
    this.adjustZoomTransform = this.adjustZoomTransform.bind(this);
    this.zoomed = this.zoomed.bind(this);
    this.notify = this.notify.bind(this);
    this.addTrack = this.addTrack.bind(this);
    this.setTracks = this.setTracks.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
    this.adjustToSize = this.adjustToSize.bind(this);
    this.updateTracks = this.updateTracks.bind(this);
    this.postUpdateTracks = this.postUpdateTracks.bind(this);
    this.updateLegendRows = this.updateLegendRows.bind(this);
    this.updateLegend = this.updateLegend.bind(this);
    this.processLegendConfig = this.processLegendConfig.bind(this);
    this._trackExit = this._trackExit.bind(this);
    this._trackEnter = this._trackEnter.bind(this);
    this._trackUpdate = this._trackUpdate.bind(this);
  }

  /**
   * Simple creator function for minimal setup
   * @param showTitles optional flag to show titles or not
   */
  static basic(showTitles: boolean = true) {
    return new TrackGroup({
      showTitles,
      showLegend: false,
    });
  }

  /**
   * Convenience method if used stand-alone. Wraps onMount and
   * returns self for chaining.
   * @param element HTML element to attach itself to
   */
  public init(element: HTMLElement) : TrackGroup {
    this.onMount(element);
    return this;
  }

  /**
   * Initialize the component and attach itself to the provided DOM element.
   * @param element HTML element to attach itself to
   */
  public onMount(element: HTMLElement) : void {
    if (this.options.autoResize) {
      this._observer = new ResizeObserver(() => {
        this.debounce(() => this.adjustToSize());
      });
      requestAnimationFrame(() => this._observer.observe(element));
    }

    this._scaleHandler = this.options.scaleHandler || new BasicScaleHandler();
    this._scaleHandler.baseDomain(this.options.domain);

    this.zoom = zoom()
      .scaleExtent([1, this.options.maxZoom || 256])
      .on('zoom', this.zoomed);

    const container = select(element)
      .classed('track-group', true)
      .classed('horizontal', this.options.horizontal);

    if (this.options.useOverlay) {
      const overlay = createOverlay(this, container);

      overlay.elm.call(this.zoom);

      const wheelZoomFunc = overlay.elm.on('wheel.zoom').bind(overlay.elm.node());
      overlay.elm.on('wheel.zoom', () => {
        if (event.ctrlKey || event.shiftKey) {
          const scaleMod = zoomTransform(overlay.elm.node()).k / 3;
          const transitionAmount = event.wheelDeltaY / wheelPanFactor / scaleMod;
          if (this.options.horizontal) {
            this.zoom.translateBy(overlay.elm, transitionAmount, 0);
          } else {
            this.zoom.translateBy(overlay.elm, 0, transitionAmount);
          }
        } else {
          wheelZoomFunc();
        }
        event.preventDefault();
      });
      this.currentTransform = () => zoomTransform(overlay.elm.node());
      this.overlay = overlay;
    } else {
      this.currentTransform = () => zoomTransform(container.node());
    }

    this.container = container;

    this.adjustToSize();

    this._initialized = true;
  }

  /**
   * To unregister event listeners etc.
   */
  public onUnmount() : void {
    if (this._observer) {
      this._observer.disconnect();
    }
  }

  /**
   * Set the tracks for this group, replacing any existing tracks
   * @param tracks track or tracks to set
   */
  public setTracks(...track: Track[]) : TrackGroup
  public setTracks(tracks: Track[]) : TrackGroup
  public setTracks(...tracks: any[]) : TrackGroup {
    this.tracks = tracks.length === 1 && Array.isArray(tracks[0]) ? tracks[0] : tracks;
    this.tracks.sort((a, b) => a.order - b.order);

    if (this.options.showLegend) this.updateLegendRows();
    if (this._initialized) {
      this.debounce(this.updateTracks);
    }
    return this;
  }

  /**
   * Adds a single track to the track group
   * @param track track to be added
   */
  public addTrack(track: Track) : TrackGroup {
    this.tracks.push(track);
    this.tracks.sort((a, b) => a.order - b.order);

    if (
      this.options.showLegend
      && track.options.legendConfig
      && track.options.legendConfig.getLegendRows(track) > this.legendRows
    ) {
      this.updateLegendRows();
    }

    if (this._initialized) {
      this.debounce(this.updateTracks);
    }
    return this;
  }

  /**
   * Removes a track from the track group component
   * @param track track to be removed
   */
  public removeTrack(track: Track) : TrackGroup {
    const idx = this.tracks.findIndex(d => d.id === track.id);
    if (idx >= 0) {
      if (this.options.showLegend && this.legends[track.id]) {
        delete this.legends[track.id];
      }
      this.tracks.splice(idx, 1);
      if (
        this.options.showLegend
        && track.options.legendConfig
        && track.options.legendConfig.getLegendRows(track) >= this.legendRows
      ) {
        this.updateLegendRows();
      }
      if (this._initialized) {
        this.debounce(this.updateTracks);
      }
    }
    return this;
  }

  /**
   * Rescale according to new container size
   * @param force Set to true in order to force update even if size has not changed
   */
  public adjustToSize(force: boolean = false) {
    const {
      container,
      width: oldWidth,
      height: oldHeight,
      options: {
        showLegend,
        showTitles,
        horizontal,
      },
      _trackHeight: oldTrackHeight,
    } = this;

    const getDim = () => (
      this.options.horizontal
        ? { length: this.width, span: this.height }
        : { length: this.height, span: this.width }
    );

    const oldDim = getDim();

    const { width, height } = container.node().getBoundingClientRect();
    this.width = width;
    this.height = height;

    // exit early if nothing has changed
    if (!force && oldWidth === this.width && oldHeight === this.height) {
      return;
    }

    const dim = getDim();

    // recalculate sizes
    this._uiScale = Math.max(Math.min(1, this.width / uiScaleFactor), 0.7);
    this._titleHeight = showTitles ? titleBarBaseSize * this._uiScale : 0;
    this._titleFontSize = showTitles ? this._titleHeight * titleFontSizeFactor : 0;
    this._legendHeight = showLegend ? this.legendRows * legendBaseSize * this._uiScale : 0;
    this._trackHeight = dim.length - this._titleHeight - this._legendHeight;

    if (this._trackHeight <= 0 || dim.length <= 0) return;

    if (this._trackHeight !== oldTrackHeight) {
      this.scale.range([0, this._trackHeight]);
      this.adjustZoomTransform();
      this.rescale();
    }

    // see if tracks need to be updated in any way
    if (dim.span !== oldDim.span && showTitles) {
      this.adjustTrackTitles();
    }

    if (dim.span !== oldDim.span || this._trackHeight !== oldTrackHeight) {
      this.debounce(this.updateTracks);
      // resize overlay
      if (this.overlay) {
        const overlaySize = {
          top: 0,
          left: 0,
          width: 0,
          height: 0,
        };
        if (horizontal) {
          overlaySize.left = dim.length - this._trackHeight + 1;
          overlaySize.width = this._trackHeight;
          overlaySize.height = dim.span;
        } else {
          overlaySize.top = dim.length - this._trackHeight + 1;
          overlaySize.height = this._trackHeight;
          overlaySize.width = dim.span;
        }
        this.overlay.elm.dispatch('resize', { detail: overlaySize });
      }
      if (this.options.onResize) {
        this.options.onResize({
          elm: container.node(),
          width,
          height,
          trackHeight: this._trackHeight,
          source: this,
        });
      }
    }
  }


  /**
   * Notify all clients (tracks) on changes to domain/transform
   * @param domain optional domain to scale to
   * @param duration optional duration of transition effect, 0 = no transition
   */
  public rescale(domain?: Domain, duration: number = 0) : void {
    if (domain) {
      const [d1, d2] = domain;
      if (d1 === d2) return;

      const [b1, b2] = this.scaleHandler.baseDomain();
      const k = Math.abs(b2 - b1) / Math.abs(d2 - d1);
      const p = this.scale(d1) * k;

      let transform;
      if (this.options.horizontal) {
        transform = zoomIdentity.translate(-p, 0).scale(k);
      } else {
        transform = zoomIdentity.translate(0, -p).scale(k);
      }
      const zoomHandler = this.overlay
        ? this.overlay.elm
        : this.container;

      if (Number.isFinite(duration) && duration > 0) {
        zoomHandler.interrupt();
        this.zoom.transform(zoomHandler.transition().duration(duration), transform);
      } else {
        this.zoom.transform(zoomHandler, transform);
      }
    } else {
      const transform = this.currentTransform();
      this.notify('onRescale', {
        scale: this.scaleHandler.dataScale,
        transform,
      });
      if (this.overlay) {
        this.overlay.elm.dispatch('rescale', { detail: { transform }});
      }
    }
  }

  /**
   * Update track-elements based on current registered track instances
   */
  public updateTracks() : TrackGroup {
    const {
      container,
      tracks,
      debounce,
      _trackEnter: trackEnter,
      _trackUpdate: trackUpdate,
      _trackExit: trackExit,
    } = this;

    const selection = container.selectAll('.track').data(tracks, t => t.id);

    selection.interrupt();

    const exit = selection.exit();
    const enter = selection.enter();

    exit.call(trackExit);
    enter.call(trackEnter);

    selection.call(trackUpdate);

    if (exit.empty() && enter.empty()) {
      debounce(this.postUpdateTracks);
    }

    return this;
  }

  /**
   * Remove all tracks and update ui
   */
  public reset() : TrackGroup {
    return this.setTracks([]);
  }

  /**
   * Triggers event according to type and passes arguments to clients (tracks)
   * @param type notification type (event type)
   * @param args arguments to pass
   */
  public notify(type:string, ...args: any[]) {
    // console.log('>> ' + type, ...args);
    this.tracks.forEach(track => {
      const func = track[type] || track.options[type];
      if (!track.isMounted) return;
      if (func && typeof (func) === 'function') {
        window.requestAnimationFrame(() => func(...args, track));
      }
    });
  }

  /**
   * Event handler for pan/zoom
   */
  protected zoomed() : void {
    if (!this.overlay || !this.overlay.enabled) return;
    const { transform } = event;
    const { k } = this.currentTransform();
    const panExcess = this.options.panExcess || [0, 0];

    if (this.options.horizontal) {
      this.scaleHandler.rescale(transform, 'x');
      this.zoom.translateExtent([
        [-Math.abs(panExcess[0] / k), 0],
        [this._trackHeight + Math.abs(panExcess[1] / k), 0],
      ]);
    } else {
      this.scaleHandler.rescale(transform, 'y');
      this.zoom.translateExtent([
        [0, -Math.abs(panExcess[0] / k)],
        [0, this._trackHeight + Math.abs(panExcess[1] / k)],
      ]);
    }
    this.rescale();
  }

  /**
   * Processes track legend config object, creating the necessary DOM elements and
   * hooking up callback functions etc.
   * @param track Track to process
   * @param element Legend element
   */
  protected processLegendConfig(track: Track, element: Element) : void {
    const { legendConfig } = track.options;

    if (!legendConfig) return;

    let legendElement = element;
    if (legendConfig.elementType === 'svg') {
      const legendSelection = select(element).append('svg');

      setProps(legendSelection, {
        attrs: {
          width: '100%',
          height: '100%',
        },
        styles: {
          flex: '1 1 auto',
        },
      });

      legendElement = legendSelection.node();
    }

    if (legendConfig.onInit) {
      legendConfig.onInit(
        legendElement,
        track,
        () => this.updateLegend(track.id),
      );
    }
    this.legends[track.id] = {
      elm: legendElement,
      track,
    };
  }

  /**
   * Recalculates transform based on new container size
   */
  protected adjustZoomTransform() : void {
    const zoomHandler = this.overlay ? this.overlay.elm : this.container;
    const [d1, d2] = this.scaleHandler.baseDomain();
    if (d1 === d2) return;

    const p1 = this.scale(d1);
    const p2 = this.scale(d2);

    const [r1, r2] = this.scale.range();
    const dist = r2 - r1;
    let transform;
    if (this.options.horizontal) {
      transform = zoomIdentity.translate(p1, 0).scale((p2 - p1) / dist);
    } else {
      transform = zoomIdentity.translate(0, p1).scale((p2 - p1) / dist);
    }

    this.zoom.transform(zoomHandler, transform);
  }

  /**
   * Determines the required number of rows in the legend section.
   */
  protected updateLegendRows() : void {
    const {
      tracks,
    } = this;

    const maxRows = tracks.reduce((rows, track) => {
      if (track.options.legendConfig) {
        const tr = +track.options.legendConfig.getLegendRows(track);
        if (Number.isFinite(tr)) return Math.max(rows, tr);
      }
      return rows;
    }, 0);

    if (maxRows !== this.legendRows) {
      this.legendRows = maxRows;
      this.adjustToSize(true);
    }
  }

  /**
   * Updates the legend for a specific track
   * @param id Track id
   */
  protected updateLegend(id:(string|number)) : void {
    if (!this.options.showLegend) return;
    if (this.legends[id]) {
      const {
        legends,
        _uiScale: uiScale,
        _legendHeight: legendHeight,
      } = this;

      const { elm, track } = legends[id];
      const { legendConfig, horizontal } = track.options;

      const rows = legendConfig.getLegendRows(track) || 0;

      const height = rows * legendBaseSize * uiScale;

      // Moz bug returns 0 for clientWidth and clientHeight on svg elements,
      // so using bounding box instead.
      // https://bugzilla.mozilla.org/show_bug.cgi?id=874811
      const bbox = elm.getBoundingClientRect();
      const bounds = {
        left: 0,
        height,
        top: legendHeight - height,
        width: horizontal ? bbox.height : bbox.width,
      };

      if (legendConfig.onUpdate) {
        legendConfig.onUpdate(elm, bounds, track);
      }
    }
  }

  /**
   * Adjust track titles according to available space. Uses abbrievation
   * istead of full label if not enough space.
   */
  protected adjustTrackTitles() : void {
    const { horizontal } = this.options;
    const isTooSmall = horizontal
      ? (element: HTMLElement) => element.clientHeight < element.scrollHeight
      : (element: HTMLElement) => element.clientWidth < element.scrollWidth;

    this.container.selectAll('.track-title')
      .text(d => d.options.label || d.id)
      .each(function updateTitle(d:any) {
        if (isTooSmall(this) && d.options.abbr) {
          select(this).text(d.options.abbr);
        }
      });
  }

  /**
   * Trigger onUpdate event after tracks has been altered in size
   */
  protected postUpdateTracks() : void {
    const {
      container,
      scaleHandler,
      updateLegend,
      options: {
        showLegend,
        showTitles,
      }
    } = this;

    container.selectAll('.track').each(function updateTrack(d) {
      if (d.onUpdate) {
        const elm = this.querySelector('.track-container');
        window.requestAnimationFrame(() => {
          if (!d.isMounted) return;
          d.onUpdate({
            elm,
            scale: scaleHandler.dataScale,
          });
          if (d.options.legendConfig && showLegend) {
            updateLegend(d.id);
          }
        });
      }
    });

    if (showTitles) this.adjustTrackTitles();
  }

  /**
   * Remove DOM-elements belonging to removed tracks
   * @param selection exit selection
   */
  private _trackExit(selection: D3Selection) : void {
    selection.each((d) => d.onUnmount && d.onUnmount());

    selection
      .transition()
      .duration(transitionDuration)
      .style('flex', '0 0 0%')
      .on('end', () => this.debounce(this.postUpdateTracks))
      .remove();

    if (this.options.onTrackExit) {
      this.options.onTrackExit();
    }
  }

  /**
   * Add DOM-elements for new tracks
   * @param selection enter selection
   */
  private _trackEnter(selection: D3Selection) : void {
    const {
      scaleHandler,
      processLegendConfig,
      _titleHeight: titleHeight,
      _legendHeight: legendHeight,
      _titleFontSize: fontSize,
      options: {
        showTitles,
        showLegend,
        horizontal,
      }
    } = this;

    const attr = horizontal
      ? { maxSpan: 'max-height', size: 'width' }
      : { maxSpan: 'max-width', size: 'height' };

    const newtracks = selection.append('div').attr('class', 'track');

    setStyles(newtracks, {
      flex: '0 0 0%',
      [attr.maxSpan]: (d: Track) => (d.options.maxWidth ? `${d.options.maxWidth}px` : null),
    });

    if (showTitles) {
      const titleDiv = newtracks.append('div');
      setProps(titleDiv, {
        attrs: d => ({
          class: 'track-title',
          title: d.options.label || d.id,
        }),
        styles: {
          [attr.size]: `${titleHeight}px`,
          'font-size': `${fontSize}px`,
        },
      });
    }

    if (showLegend) {
      newtracks.append('div')
        .classed('track-legend', true)
        .classed('hidden', legendHeight <= 0)
        .style([attr.size], `${legendHeight}px`);
    }

    newtracks.append('div').attr('class', 'track-container');
    const self = this;
    newtracks.each(function addTrackCallback(d) {
      if (self.options.onTrackEnter) {
        self.options.onTrackEnter(this, d);
      }
      const ev = {
        elm: this.querySelector('.track-container'),
        scale: scaleHandler.dataScale,
        scaleHandler,
      };

      d.options.horizontal = horizontal;

      if (d.onMount) d.onMount(ev);
      if (d.options.legendConfig) processLegendConfig(d, this.querySelector('.track-legend'));
    });

    newtracks
      .transition()
      .duration(transitionDuration)
      .style('flex', d => `${d.options.width}`)
      .on('end', () => this.debounce(this.postUpdateTracks));
  }

  /**
   * Update DOM-elements for existing tracks
   * @param selection update selection
   */
  private _trackUpdate(selection: D3Selection) : void {
    const {
      _titleHeight: titleHeight,
      _legendHeight: legendHeight,
      _titleFontSize: fontSize,
      options: {
        showTitles,
        showLegend,
        horizontal,
      }
    } = this;

    const sizeAttr = horizontal ? 'width' : 'height';

    selection.style('flex', d => `${d.options.width}`);

    if (showTitles) {
      setStyles(selection.select('.track-title'), {
        [sizeAttr]: `${titleHeight}px`,
        'font-size': `${fontSize}px`,
      });
    }

    if (showLegend) {
      const legend = selection.select('.track-legend');
      legend
        .style([sizeAttr], `${legendHeight}px`)
        .classed('hidden', legendHeight <= 0);
    }
  }

  /**
   * Getter for (base) domain
   * @returns {number[]}
   */
  get domain() : Domain {
    return this.scale.domain();
  }

  /**
   * Setter for (base) domain
   * @param {number[]} value
   */
  set domain(value: Domain) {
    if (value && Array.isArray(value)) {
      this.scaleHandler.baseDomain(value);
      this.rescale();
    }
  }

  /**
   * Getter for scaleHandler
   * @returns {class} current scale handler
   */
  get scaleHandler() : ScaleHandler {
    return this._scaleHandler;
  }

  /**
   * Setter for scaleHandler
   * @param newHandler new scale handler
   */
  set scaleHandler(newHandler: ScaleHandler) {
    newHandler.range(this._scaleHandler.range());
    this._scaleHandler = newHandler;
  }

  /**
   * Getter for the component's internal scale
   */
  get scale() : D3Scale {
    return this.scaleHandler.scale;
  }
}
