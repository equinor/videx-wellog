import { scaleLinear, max as d3max } from 'd3';
import SvgTrack from './svg-track';

/**
 * Plot completion data.
 * @param {SVGGElement} g
 * @param {object} data
 * @param {function} lengthAtMd calculate curve position from measured depth
 * @param {class} generator completion shape generator
 */
function plotCompletion(g, data, lengthAtMd, generator) {
  const completion = data
    .map((d) => {
      const lTop = lengthAtMd(d.top);
      const lBtm = lengthAtMd(d.bottom);

      return {
        ...d,
        lTop,
        lBtm,
      };
    });

  const selection = g.selectAll('g.completion-section').data(completion, d => d.top);
  const newSections = selection
    .enter()
    .append('g')
    .attr('class', 'completion-section');

  newSections.call(generator.generateShape);
  selection.call(generator.generateShape);
  selection.exit().remove();
}

/**
 * Plot casing data.
 * @param {SVGGElement} g
 * @param {object} data
 * @param {function} lengthAtMd calculate curve position from measured depth
 * @param {function} coordsAtMd calculate xy coordinates from measured depth
 * @param {d3.scaleLinear} dx diameter scale
 * @param {class} generator completion shape generator
 */
function plotCasings(g, data, lengthAtMd, coordsAtMd, dx, generator) {
  const casings = data
    .sort((a, b) => b.innerdiameter - a.innerdiameter)
    .map((d) => {
      const lTop = lengthAtMd(d.top);
      const lBtm = lengthAtMd(d.shoe && d.shoe.bottom > d.bottom ? d.shoe.bottom : d.bottom);

      const curve = generator.generateCurve(lTop, lBtm);
      const shoeData = d.shoe ? {
        pTop: coordsAtMd(d.shoe.top),
        pBtm: coordsAtMd(d.shoe.bottom),
        innerSize: dx(d.shoe.innerdiameter),
        outerSize: dx(d.shoe.outerdiameter),
      } : null;

      return {
        ...d,
        curve,
        shoeData,
      };
    });

  const selection = g.selectAll('g.casing-section').data(casings, d => d.top);
  const newSections = selection
    .enter()
    .append('g')
    .attr('class', 'casing-section');

  newSections.call(generator.generateCasing);
  selection.call(generator.generateCasing);
  selection.exit().remove();
}

/**
 * Plot fish data.
 * @param {SVGGElement} g
 * @param {object} data
 * @param {function} lengthAtMd calculate curve position from measured depth
 * @param {class} generator completion shape generator
 */
function plotFish(g, data, lengthAtMd, generator) {
  if (!data) {
    return;
  }
  const fish = data.map((d) => {
    const lTop = lengthAtMd(d.top);
    const lBtm = lengthAtMd(d.bottom);

    return {
      ...d,
      lTop,
      lBtm,
    };
  });

  const selection = g.selectAll('g.fish-section').data(fish, d => d.top);
  const newSections = selection
    .enter()
    .append('g')
    .attr('class', 'fish-section');

  newSections.call(generator.generateFish);
  selection.call(generator.generateFish);
  selection.exit().remove();
}

/**
 * Track for visualising completion data within a track.
 * NOTE: This track requires a shape generator instance that is not
 * part of this library. The shape generator is responsible for the
 * rendering of the different objects.
 */
export default class CompletionTrack extends SvgTrack {
  constructor(id, options) {
    if (!options.shapeGenerator) throw Error('No shape-generator function provided in options!');

    super(id, options);
    this.shapeGenerator = options.shapeGenerator;
  }

  /**
   * Override of onMount from base class
   * @param {object} event
   */
  onMount(event) {
    super.onMount(event);

    const {
      options,
    } = this;

    this.xscale = scaleLinear().domain([0, 1]).range([0, event.elm.clientWidth]);

    if (options.data) {
      this.isLoading = true;
      options.data().then(data => {
        this.data = data;
        this.isLoading = false;
        this.plot();
        // this.legendUpdate && this.legendUpdate();
      });
    }

    const mdAtLength = l => l;
    this.lengthAtMd = md => md;
    this.coordsAtMd = md => [0.5, md];

    this.interp = {
      getPointAt: l => ({ x: 0.5, y: mdAtLength(l) }),
      points: [],
    };
  }

  /**
   * Override of onUpdate from base class
   * @param {object} event
   */
  onUpdate(event) {
    super.onUpdate(event);
    this.xscale.range([0, this.elm.clientWidth]);
    this.plot();
  }

  /**
   * Override of onRescale from base class
   * @param {object} event
   */
  onRescale(event) {
    super.onRescale(event);
    this.plot();
  }

  /**
   * Override plot from base class. Plots track data.
   */
  plot() {
    const {
      plotGroup,
      scale: yscale,
      xscale,
      data,
      interp,
      lengthAtMd,
      coordsAtMd,
      shapeGenerator,
    } = this;

    if (!plotGroup) return;

    if (!data || (data.casing.length === 0 && data.perf_compl.length === 0)) {
      plotGroup.select('g.casings-group').remove();
      plotGroup.select('g.completion-group').remove();
      plotGroup.select('g.fish-group').remove();
    } else {
      const [min, max] = yscale.domain();

      let casingGroup = plotGroup.select('g.casings-group');
      if (casingGroup.empty()) {
        casingGroup = this.plotGroup.append('g').attr('class', 'casings-group');
      }
      let completionGroup = plotGroup.select('g.completion-group');
      if (completionGroup.empty()) {
        completionGroup = this.plotGroup.append('g').attr('class', 'completion-group');
      }
      let fishGroup = plotGroup.select('g.fish-group');
      if (fishGroup.empty()) {
        fishGroup = this.plotGroup.append('g').attr('class', 'fish-group');
      }

      let maxDim = [1];
      if (data.casing && data.casing.length > 0) {
        maxDim = maxDim.concat(data.casing.map(d => d.outerdiameter));
      } else if (data.perf_compl && data.perf_compl.length > 0) {
        maxDim = maxDim.concat(data.perf_compl.map(d => d.diameterMax));
      }
      const dmax = d3max(maxDim);
      const [, rMax] = xscale.range();
      const dx = scaleLinear()
        .range([0, rMax / 1.25])
        .domain([0, dmax]);

      const y = v => yscale(v);

      const generator = shapeGenerator(xscale, y, dx, interp);

      generator.shoeSizeFactor = 1.2;
      const casingData = data.casing.filter(d =>
        (d.top <= max && d.bottom >= min) &&
        !(parseFloat(d.interval) < 8.6 && d.casingType === 'Blank Pipe'),
      );
      const completionData = data.perf_compl.filter(d => d.top < max && d.bottom > min);
      const fishData = data.fish;
      plotCasings(casingGroup, casingData, lengthAtMd, coordsAtMd, dx, generator);
      plotCompletion(completionGroup, completionData, lengthAtMd, generator);
      plotFish(fishGroup, fishData, lengthAtMd, generator);
    }
  }
}
