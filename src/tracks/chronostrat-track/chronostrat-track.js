import { scaleLinear } from 'd3';
import SvgTrack from '../svg-track';
import ChronostratLane from './chronostrat-lane';

export default class ChronoStratTrack extends SvgTrack {
  constructor(id, options) {
    super(id, options);

    this.lanes = {};
  }

  onMount(event) {
    super.onMount(event);

    const {
      options,
      plotGroup: g,
    } = this;

    this.lanes = {
      epoch: new ChronostratLane(g, 'Epoch', 'Ep', 0.40),
      age: new ChronostratLane(g, 'Age', 'Age', 0.60, false),
    };
    this.xscale = scaleLinear().domain([0, 1]);

    if (options.data) {
      this.isLoading = true;
      options.data().then(data => {
        this.data = data;
        this.isLoading = false;
        this.plot();
      });
    }
  }

  updateLanes(width) {
    let usedWidth = 0;
    Object.keys(this.lanes).forEach((key) => {
      const lane = this.lanes[key];
      const laneWidth = lane.percent * width;
      lane.xRange = [1, Math.max(1, laneWidth - 2)];
      lane.xTranslate = usedWidth;

      lane.onUpdate();
      usedWidth += laneWidth;
    });
  }

  onUpdate(event) {
    super.onUpdate(event);
    this.xscale.range([0, this.elm.clientWidth]);
    this.updateLanes(this.elm.clientWidth);
    this.plot();
  }

  onRescale(event) {
    super.onRescale(event);
    this.plot();
  }

  plot() {
    const {
      scale: yscale,
      data,
    } = this;

    if (!data || Object.keys(data).length === 0) {
      Object.keys(this.lanes).forEach(key => this.lanes[key].plot(yscale, null, true));
      return;
    }
    Object.keys(data).forEach(key => this.lanes[key].plot(yscale, data[key]));
  }
}
