import { select } from 'd3';
import { TrackOptions, Transform, OnMountEvent, OnUnmountEvent, OnUpdateEvent, OnRescaleEvent } from './interfaces';
import { D3Selection, Scale } from '../common/interfaces';
import { LegendTriggerFunction } from '../utils/legend-helper';
/**
 * Default options
 */
const defaults = {
  width: 3,
  maxWidth: null,
  horizontal: false,
};

/**
 * Abstract base class for wellog tracks
 */
export default abstract class Track {
  public options: TrackOptions;
  public id: string | number;
  public elm: HTMLElement;
  public loader: D3Selection;
  public transform: Transform;
  public scale: Scale;
  public error: Error | string;
  public order: number;
  public legendUpdate?: LegendTriggerFunction;

  protected _data: any;
  protected _isLoading: boolean;
  protected _mounted: boolean;

  constructor(id: string | number, options: TrackOptions = {}) {
    this.options = {
      ...defaults,
      ...options,
    };
    this.id = id === undefined ? Math.round(Math.random() * Date.now()) : id;
    this.elm = null;
    this.order = 0;
    this.loader = options.loader || null;

    this._isLoading = false;
    this._data = null;

    this.transform = { k: 1, y: 0, x: 0 };

    this.onMount = this.onMount.bind(this);
    this.onUnmount = this.onUnmount.bind(this);
    this.onRescale = this.onRescale.bind(this);
    this.onUpdate = this.onUpdate.bind(this);
    this.refresh = this.refresh.bind(this);
    this.loadData = this.loadData.bind(this);
    this.onError = this.onError.bind(this);
  }

  /**
   * Calls OnMount and OnUpdate. Useful if track is stand-alone
   */
  init(elm: HTMLElement, scale: Scale) : void {
    this.onMount({ elm, scale });
    this.onUpdate({ elm, scale });
  }

  /**
   * Handler for onMount event. Called by container when track DOM element
   * is added to the DOM model.
   */
  onMount(trackEvent: OnMountEvent) : void {
    const {
      elm,
      scale,
    } = trackEvent;
    this.elm = elm;
    this.scale = scale;

    if (this.options.onMount) {
      this.options.onMount(trackEvent, this);
    }
    this._mounted = true;
  }

  /**
   * Handler for onUnmount event. Called when track DOM-element is remove from the
   * DOM model. Typically, trackEvent will be an empty object, but depends on container.
   */
  onUnmount(trackEvent: OnUnmountEvent = {}) : void {
    if (this.options.onUnmount) {
      this.options.onUnmount(trackEvent, this);
    }
    select(this.elm).selectAll('*').remove();
  }

  /**
   * Handler for onChange event. Called by container when track is resized.
   */
  onUpdate(trackEvent: OnUpdateEvent) : void {
    if (!this._mounted) return;

    this.scale = trackEvent.scale;

    if (this.options.onUpdate) {
      this.options.onUpdate(trackEvent, this);
    }
  }
  /**
   * Handler for onRescale event. Called by container when y-scale domain/transform is changed.
   */
  onRescale(trackEvent: OnRescaleEvent) : void {
    const {
      domain,
      scale,
      transform,
    } = trackEvent;

    if (!this._mounted) return;

    if (scale) {
      this.scale = scale;
    } else if (domain) {
      this.scale.domain(domain);
    } else {
      throw Error('Event is missing updated scale or domain!');
    }

    this.transform = transform;

    if (this.options.onRescale) {
      this.options.onRescale(trackEvent, this);
    }
  }

  /**
   * Should be called from track implementation in case an
   * unrecoverable error occurs.
   */
  onError(error: Error | string) : void {
    this._mounted = false;
    this.isLoading = false;
    this.error = error;
    if (this.elm) {
      select(this.elm).classed('error', true).selectAll('*').remove();
    }
    if (this.options.onError) {
      this.options.onError(error, this);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onDataLoaded(data?: any) {
    if (this.isLoading) this.isLoading = false;
  }

  /**
   * Initiate loading of data for track. Will set response to the track's
   * data property. If showLoader is set to true, the current track will be
   * hidden, and (if supplied) the loader element will be shown, until data
   * is resolved. Calls onDataLoaded if implemented by track.
   */
  loadData(data: (Promise<any> | Function | any), showLoader: boolean = true) : void {
    if (showLoader) this.isLoading = true;

    const onSuccess = d => {
      this._data = d;
      if (this.isLoading) this.isLoading = false;
      if (this.onDataLoaded) {
        this.onDataLoaded(d);
      }
      if (this.legendUpdate) this.legendUpdate();
    };

    const res = data();
    if (res.then) {
      res.then(
        onSuccess,
        this.onError,
      );
    } else if (typeof res === 'object') {
      onSuccess(res);
    } else {
      this.onError('Invalid data');
    }
  }

  clearData() {
    this._data = null;
    this.onDataLoaded(null);
  }

  /**
   * Allow triggering of update event without parameters
   */
  refresh() : void {
    const { scale } = this;
    if (scale) {
      this.onUpdate({ elm: this.elm, scale });
    }
  }

  get isLoading() : boolean {
    return this._isLoading;
  }

  set isLoading(val: boolean) {
    this._isLoading = !!val;
    if (this.loader) {
      select(this.loader).classed('hidden', !this._isLoading);
    }
    select(this.elm).classed('hidden', this._isLoading);
    this.refresh();
  }

  get isMounted() {
    return this._mounted;
  }

  get data() : any {
    return this._data;
  }

  set data(data: Promise<any> | Function | any) {
    if (typeof data === 'function') {
      this.loadData(data, false);
    } else {
      this._data = data;
      if (this.legendUpdate) this.legendUpdate();
      if (this.onDataLoaded) {
        this.onDataLoaded(data);
      }
    }
  }
}
