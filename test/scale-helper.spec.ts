import { expect } from 'chai';
import { scaleLinear, scaleLog } from 'd3';
import ScaleHelper from '../src/utils/scale-helper';

const EPS = 0.0001;

describe('ScaleHelper', () => {
  it('should be able to create major and minor ticks from linear scale', () => {
    const scale = scaleLinear().domain([0, 1000]).range([0, 100]);
    let actual = ScaleHelper.createTicks(scale);
    let expected = {
      major: [0, 500, 1000],
      minor: [100, 200, 300, 400, 600, 700, 800, 900],
    };

    expect(actual).to.be.eql(expected);

    scale.domain([500, 800]);
    actual = ScaleHelper.createTicks(scale);
    expected = {
      major: [600, 800],
      minor: [520, 560, 640, 680, 720, 760],
    };

    expect(actual).to.be.eql(expected);
  });

  it('should be able to create scaled major and minor ticks from linear scale', () => {
    const scale = scaleLinear().domain([0, 10000]).range([0, 100]);
    const actual = ScaleHelper.createLinearTicks(scale);

    const expected = {
      major: [5000],
      minor: [1000, 2000, 3000, 4000, 6000, 7000, 8000, 9000],
    };
    expect(actual).to.be.eql(expected);

  });

  it('should be able to create scaled major and minor ticks from log scale', () => {
    const scale = scaleLog().domain([0.1, 10000]).range([0, 100]);
    const actual = ScaleHelper.createLogTicks(scale);
    const expected = {
      major: [1, 10, 100, 1000],
      minor: [
        0.2,
        0.3,
        0.4,
        0.5,
        0.6,
        0.7,
        0.8,
        0.9,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        20,
        30,
        40,
        50,
        60,
        70,
        80,
        90,
        200,
        300,
        400,
        500,
        600,
        700,
        800,
        900,
        2000,
        3000,
        4000,
        5000,
        6000,
        7000,
        8000,
        9000,
        10000,
      ],
    };
    expect(actual).to.be.eql(expected);
  });

  it('should return the domain and range span in pixels (width) for a scale', () => {
    const scale = scaleLinear().domain([21, 90]).range([0, 245]);

    expect(ScaleHelper.getRangeSpan(scale)).to.eq(245);

    // without specified domain
    expect(ScaleHelper.getDomainPixelSpan(scale)).to.eq(ScaleHelper.getRangeSpan(scale));

    // with specified domain
    expect(ScaleHelper.getDomainPixelSpan(scale, [30, 40])).to.be.closeTo(35.50724, EPS);
    expect(ScaleHelper.getDomainPixelSpan(scale, [-30, 0])).to.be.closeTo(106.5217, EPS);
  });

  it('should return the scales pixel ratio (domain units per pixels)', () => {
    const scale = scaleLinear().domain([21, 90]).range([0, 245]);
    expect(ScaleHelper.getPixelRatio(scale)).to.be.closeTo(3.55072, EPS);
  });

  it('should return the scales domain ratio (dpixels per domain units)', () => {
    const scale = scaleLinear().domain([21, 90]).range([0, 245]);
    expect(ScaleHelper.getDomainRatio(scale)).to.be.closeTo(0.28163, EPS);
  });
});
