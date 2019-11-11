import { select } from 'd3';

/**
 * Default options
 */
const defaults = {
  width: 3,
  maxWidth: null,
};

/**
 * Abstract base class for wellog tracks
 */
export default class Track {
  /**
   * Create instance
   * @param {*} id Track id
   * @param {object} options track options
   */
  constructor(id, options = {}) {
    this.options = {
      ...defaults,
      ...options,
    };
    this.id = id;

    this._isLoading = false;
    this.elm = null;
    this.loader = options.loader || null;

    this.onMount = this.onMount.bind(this);
    this.onUnmount = this.onUnmount.bind(this);
    this.onRescale = this.onRescale.bind(this);
    this.onUpdate = this.onUpdate.bind(this);
    this.refresh = this.refresh.bind(this);
    this.loadData = this.loadData.bind(this);
    this.transform = { k: 1, y: 0, x: 0 };
  }

  /**
   * Handler for onMount event. Called by container when track DOM element
   * is added to the DOM model.
   * @param {{
   *   elm:HTMLElement,
   *   scale:d3.scale,
   *   scaleHandler:[object]
   * }} trackEvent Event object containing DOM element reference for track
   * DOM element and y-scale from container. Whether scaleHandler is passed along
   * depends on the container - this is required if you want to use the dual scale track.
   * In general, the container may add whatever it wants (to allow custom behaviour),
   * but elm and scale must be present.
   */
  onMount(trackEvent) {
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
   * @param {object} trackEvent
   */
  onUnmount(trackEvent = {}) {
    if (this.options.onUnmount) {
      this.options.onUnmount(trackEvent, this);
    }
    select(this.elm).selectAll('*').remove();
  }

  /**
   * Handler for onChange event. Called by container when track is resized.
   * @param {{
   *   elm:HTMLElement,
   *   scale:d3.scale,
   * }} trackEvent Event object containing DOM element reference for track
   * DOM-element and y-scale from container
   */
  onUpdate(trackEvent) {
    if (!this._mounted) return;

    this.scale = trackEvent.scale;

    if (this.options.onUpdate) {
      this.options.onUpdate(trackEvent, this);
    }
  }
  /**
   * Handler for onRescale event. Called by container when y-scale domain/transform is changed.
   * @param {{
   *   scale:d3.scale,
   *   transform:{x:number,y:number,k:number},
   * }} trackEvent Event object containing the updated scale and transform
   */
  onRescale(trackEvent) {
    const {
      scale,
      transform,
    } = trackEvent;

    if (!this._mounted) return;

    this.scale = scale;
    this.transform = transform;

    if (this.options.onRescale) {
      this.options.onRescale(trackEvent, this);
    }
  }

  /**
   * Should be called from track implementation in case an
   * unrecoverable error occurs.
   * @param {Error} error Exception/error
   */
  onError(error) {
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

  /**
   * Initiate loading of data for track. Will set response to the track's
   * data property. If showLoader is set to true, the current track will be
   * hidden, and (if supplied) the loader element will be shown, until data
   * is resolved.
   * @param {Promise} dataPromise async function for retrieving data
   * @param {boolean} [showLoader=true] update loading state while waiting
   * for dataPromise to resolve
   */
  loadData(dataPromise, showLoader = true) {
    if (showLoader) this.isLoading = true;
    return dataPromise().then(
      data => {
        this.data = data;
        if (showLoader || this.isLoading) this.isLoading = false;
        if (this.legendUpdate) this.legendUpdate();
        return data;
      },
      error => this.onError(error),
    );
  }

  /**
   * Allow triggering of update event without parameters
   */
  refresh() {
    const { scale } = this;
    if (scale) {
      this.onUpdate({ scale });
    }
  }

  /**
   * Getter for _isLoading
   * @returns {boolean}
   */
  get isLoading() {
    return this._isLoading;
  }

  /**
   * Setter for _isLoading
   * @param {boolean} val
   */
  set isLoading(val) {
    this._isLoading = !!val;
    if (this.loader) {
      select(this.loader).classed('hidden', !this._isLoading);
    }
    select(this.elm).classed('hidden', this._isLoading);
    this.refresh();
  }
}
