import { select } from 'd3';

const defaults = {
  width: 3,
  maxWidth: null,
};

export default class Track {
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

    this.transform = { k: 1, y: 0, x: 0 };
  }

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

  onUnmount(trackEvent = {}) {
    if (this.options.onUnmount) {
      this.options.onUnmount(trackEvent, this);
    }
  }

  onUpdate(trackEvent) {
    if (!this._mounted) return;

    this.scale = trackEvent.scale;

    if (this.options.onUpdate) {
      this.options.onUpdate(trackEvent, this);
    }
  }

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

  refresh() {
    const { scale } = this;
    if (scale) {
      this.onUpdate({ scale });
    }
  }

  get isLoading() {
    return this._isLoading;
  }

  set isLoading(val) {
    this._isLoading = !!val;
    if (this.loader) {
      select(this.loader).classed('hidden', !this._isLoading);
    }
    select(this.elm).classed('hidden', this._isLoading);
    this.refresh();
  }
}
