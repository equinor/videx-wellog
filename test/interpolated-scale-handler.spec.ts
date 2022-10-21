import { expect } from 'chai';
import { zoomIdentity } from 'd3-zoom';
import InterpolatedScaleHandler from '../src/scale-handlers/interpolated-scale-handler';

const EPS = 0.0001;

let handler;

beforeEach(() => {
  const forward = v => v / 2;
  const reverse = v => v * 2;
  const interpolator = {
    forward,
    reverse,
    forwardInterpolatedDomain: domain => domain.map(v => forward(v)),
    reverseInterpolatedDomain: domain => domain.map(v => reverse(v)),
  };
  handler = new InterpolatedScaleHandler(interpolator, [-10, 100]).range([0, 100]);
});

describe('InterpolatedScaleHandler', () => {
  it('should initialize correctly', () => {
    expect(handler.mode).to.eq(0);
    expect(handler.baseDomain()).to.be.eql([-10, 100]);
    expect(handler._alternateBase).to.be.eql([-20, 200]);
    expect(handler.range()).to.be.eql([0, 100]);
    expect(handler.dataScale).to.eq(handler.scale);
  });

  it('should be able to create an interpolated scale (internal)', () => {
    handler.scale.domain([-20, 200]);
    const iscale = handler.createInterpolatedScale();
    expect(iscale.domain()).to.be.eql([-10, 100]);
    expect(iscale.range()).to.be.eql([0, 100]);
    expect(iscale(45)).to.eq(50);
    expect(iscale.invert(50)).to.eq(45);
  });

  it('should be able to rescale to mode (internal)', () => {
    handler._mode = 1;
    handler.rescaleToMode();
    expect(handler.scale.domain()).to.be.eql([-20, 200]);

    handler._mode = 0;
    handler.rescaleToMode();
    expect(handler.scale.domain()).to.be.eql([-10, 100]);
  });

  it('should be able to react properly to mode change', () => {
    handler.setMode(1);
    expect(handler._mode).to.eq(1);
    expect(handler.scale).not.to.eq(handler.dataScale);
    expect(handler.dataScale.domain()).to.be.eql([-10, 100]);
    expect(handler.scale.domain()).to.be.eql([-20, 200]);
  });

  it('should return major and minor ticks', () => {
    let expected = {
      major: [0, 50, 100],
      minor: [-10, 10, 20, 30, 40, 60, 70, 80, 90],
    };
    expect(handler.ticks()).to.be.eql(expected);

    // specify mode 0
    expect(handler.ticks(0)).to.be.eql(expected);

    // specify mode 1
    expected = {
      major: [0, 100, 200],
      minor: [-20, 20, 40, 60, 80, 120, 140, 160, 180],
    };
    expect(handler.ticks(1)).to.be.eql(expected);
  });

  it('should rescale scale domain according to d3.zoomTransform', () => {
    let transform = zoomIdentity.translate(0, -10).scale(2);
    let expected = [-4.5, 50.5];
    handler.rescale(transform);

    handler.scale.domain().forEach((value, i) => expect(value).to.be.closeTo(expected[i], EPS));
    expect(handler.baseDomain()).to.be.eql([-10, 100]);
    expect(handler._baseDomain).to.be.eql([-10, 100]);
    expect(handler._alternateBase).to.be.eql([-20, 200]);

    expected = [16.4, 53.066667];
    transform = zoomIdentity.translate(0, -72).scale(3);
    handler.rescale(transform);

    handler.scale.domain().forEach((value, i) => expect(value).to.be.closeTo(expected[i], EPS));
    expect(handler.baseDomain()).to.be.eql([-10, 100]);
  });

  it('should rescale scale domain according to d3.zoomTransform with mode set to 1', () => {
    handler.setMode(1);
    let transform = zoomIdentity.translate(0, -10).scale(2);
    let expected = [-9, 101];
    handler.rescale(transform);

    handler.scale.domain().forEach((value, i) => expect(value).to.be.closeTo(expected[i], EPS));
    expect(handler.baseDomain()).to.be.eql([-20, 200]);
    expect(handler._baseDomain).to.be.eql([-10, 100]);
    expect(handler._alternateBase).to.be.eql([-20, 200]);

    expected = [32.8, 106.13333];
    transform = zoomIdentity.translate(0, -72).scale(3);
    handler.rescale(transform);

    handler.scale.domain().forEach((value, i) => expect(value).to.be.closeTo(expected[i], EPS));
    expect(handler.baseDomain()).to.be.eql([-20, 200]);
  });

  it('should respond correctly to change in base domain', () => {
    handler.baseDomain([0, 150]);
    expect(handler._baseDomain).to.be.eql([0, 150]);
    expect(handler.baseDomain()).to.be.eql([0, 150]);
    expect(handler._alternateBase).to.be.eql([0, 300]);
    expect(handler.scale(75)).to.eq(50);

    handler.setMode(1);
    expect(handler._baseDomain).to.be.eql([0, 150]);
    expect(handler.baseDomain()).to.be.eql([0, 300]);
    expect(handler._alternateBase).to.be.eql([0, 300]);
    expect(handler.scale(150)).to.eq(50);
  });

  it('should be able to copy an interpolated scale', () => {
    handler.setMode(1);
    const { dataScale } = handler;
    const copy = dataScale.copy();
    expect(dataScale).to.eq(dataScale);
    expect(dataScale).not.to.eq(copy);
    expect(dataScale(10)).to.eq(copy(10));
    handler.setMode(0);
  });

  it('should not be able to change domain/range of interpolated scale', () => {
    handler.setMode(1);
    const { dataScale } = handler;
    expect(dataScale.domain()).to.eql([-10, 100]);
    expect(dataScale.range()).to.eql([0, 100]);
    expect(() => dataScale.domain([0, 50])).to.throw();
    expect(() => dataScale.range([0, 50])).to.throw();
    handler.setMode(0);
  });
});
