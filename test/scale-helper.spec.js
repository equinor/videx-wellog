import expect from 'expect';
import { scaleLinear, scaleLog } from 'd3';
import ScaleHelper from '../src/utils/scale-helper';


describe('ScaleHelper', () => {
  it('should be able to create major and minor ticks from linear scale', () => {
    const scale = scaleLinear().domain([0, 1000]).range([0, 100]);
    let actual = ScaleHelper.createTicks(scale);
    let expected = {
      major: [0, 500, 1000],
      minor: [100, 200, 300, 400, 600, 700, 800, 900],
    };

    expect(actual).toEqual(expected);

    scale.domain([500, 800]);
    actual = ScaleHelper.createTicks(scale);
    expected = {
      major: [600, 800],
      minor: [520, 560, 640, 680, 720, 760],
    };

    expect(actual).toEqual(expected);
  });

  it('should be able to create scaled major and minor ticks from linear scale', () => {
    const scale = scaleLinear().domain([0, 10000]).range([0, 100]);
    const actual = ScaleHelper.createLogTicks(scale);

    const expected = {
      major: [10],
      minor: [20, 30, 40, 50, 60, 70, 80, 90, 100],
    };
    expect(actual).toEqual(expected);
  });

  it('should be able to create scaled major and minor ticks from log scale', () => {
    const scale = scaleLog().domain([0.1, 10000]).range([0, 100]);
    const actual = ScaleHelper.createLogTicks(scale);
    const expected = {
      major: [20, 40, 60, 80],
      minor: [
        6.020599913279623,
        9.542425094393248,
        12.041199826559247,
        13.979400086720373,
        15.563025007672874,
        16.901960800285135,
        18.061799739838868,
        19.084850188786497,
        26.020599913279625,
        29.542425094393245,
        32.04119982655924,
        33.97940008672037,
        35.56302500767287,
        36.90196080028513,
        38.06179973983887,
        39.0848501887865,
        46.02059991327962,
        49.542425094393245,
        52.04119982655925,
        53.979400086720375,
        55.56302500767287,
        56.901960800285146,
        58.06179973983886,
        59.08485018878649,
        66.02059991327963,
        69.54242509439325,
        72.04119982655925,
        73.97940008672037,
        75.56302500767286,
        76.90196080028512,
        78.06179973983886,
        79.0848501887865,
        86.02059991327961,
        89.54242509439322,
        92.04119982655924,
        93.97940008672037,
        95.56302500767286,
        96.90196080028512,
        98.06179973983886,
        99.08485018878649,
        100,
      ],
    };
    expect(actual).toEqual(expected);
  });

  it('should return the domain and range span in pixels (width) for a scale', () => {
    const scale = scaleLinear().domain([21, 90]).range([0, 245]);

    expect(ScaleHelper.getRangeSpan(scale)).toBe(245);

    // without specified domain
    expect(ScaleHelper.getDomainSpan(scale)).toBe(ScaleHelper.getRangeSpan(scale));

    // with specified domain
    expect(ScaleHelper.getDomainSpan(scale, [30, 40])).toBeCloseTo(35.50724);
    expect(ScaleHelper.getDomainSpan(scale, [-30, 0])).toBeCloseTo(106.5217);
  });

  it('should return the scales pixel ratio (domain units per pixels)', () => {
    const scale = scaleLinear().domain([21, 90]).range([0, 245]);
    expect(ScaleHelper.getPixelRatio(scale)).toBeCloseTo(3.55072);
  });

  it('should return the scales domain ratio (dpixels per domain units)', () => {
    const scale = scaleLinear().domain([21, 90]).range([0, 245]);
    expect(ScaleHelper.getDomainRatio(scale)).toBeCloseTo(0.28163);
  });
});
