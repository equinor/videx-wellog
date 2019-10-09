import expect from 'expect';
import { zoomIdentity } from 'd3';
import InterpolatedScaleHandler from '../src/scale-handlers/interpolated-scale-handler';

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
    expect(handler.mode).toBe(0);
    expect(handler.baseDomain()).toEqual([-10, 100]);
    expect(handler._alternateBase).toEqual([-20, 200]);
    expect(handler.range()).toEqual([0, 100]);
    expect(handler.internalScale).toBe(handler.scale);
    expect(handler.dataScale).toBe(handler.scale);
  });

  it('should be able to create an interpolated scale (internal)', () => {
    handler.scale.domain([-20, 200]);
    const iscale = handler.createInterpolatedScale();
    expect(iscale.domain()).toEqual([-10, 100]);
    expect(iscale.range()).toEqual([0, 100]);
    expect(iscale(45)).toBe(50);
    expect(iscale.invert(50)).toBe(45);
  });

  it('should be able to rescale to mode (internal)', () => {
    handler._mode = 1;
    handler.rescaleToMode();
    expect(handler.scale.domain()).toEqual([-20, 200]);

    handler._mode = 0;
    handler.rescaleToMode();
    expect(handler.scale.domain()).toEqual([-10, 100]);
  });

  it('should be able to react properly to mode change', () => {
    handler.setMode(1);
    expect(handler._mode).toBe(1);
    expect(handler.scale).toBe(handler.internalScale);
    expect(handler.scale).not.toBe(handler.dataScale);
    expect(handler.dataScale.domain()).toEqual([-10, 100]);
    expect(handler.internalScale.domain()).toEqual([-20, 200]);
  });

  it('should return major and minor ticks', () => {
    let expected = {
      major: [0, 50, 100],
      minor: [-10, 10, 20, 30, 40, 60, 70, 80, 90],
    };
    expect(handler.ticks()).toEqual(expected);

    // specify mode 0
    expect(handler.ticks(0)).toEqual(expected);

    // specify mode 1
    expected = {
      major: [0, 100, 200],
      minor: [-20, 20, 40, 60, 80, 120, 140, 160, 180],
    };
    expect(handler.ticks(1)).toEqual(expected);
  });

  it('should rescale scale domain according to d3.zoomTransform', () => {
    let transform = zoomIdentity.translate(0, -10).scale(2);
    let expected = [-4.5, 50.5];
    handler.rescale(transform);

    handler.scale.domain().forEach((value, i) => expect(value).toBeCloseTo(expected[i]));
    expect(handler.baseDomain()).toEqual([-10, 100]);
    expect(handler._baseDomain).toEqual([-10, 100]);
    expect(handler._alternateBase).toEqual([-20, 200]);

    expected = [16.4, 53.067];
    transform = zoomIdentity.translate(0, -72).scale(3);
    handler.rescale(transform);

    handler.scale.domain().forEach((value, i) => expect(value).toBeCloseTo(expected[i]));
    expect(handler.baseDomain()).toEqual([-10, 100]);
  });

  it('should rescale scale domain according to d3.zoomTransform with mode set to 1', () => {
    handler.setMode(1);
    let transform = zoomIdentity.translate(0, -10).scale(2);
    let expected = [-9, 101];
    handler.rescale(transform);

    handler.scale.domain().forEach((value, i) => expect(value).toBeCloseTo(expected[i]));
    expect(handler.baseDomain()).toEqual([-20, 200]);
    expect(handler._baseDomain).toEqual([-10, 100]);
    expect(handler._alternateBase).toEqual([-20, 200]);

    expected = [32.8, 106.13333];
    transform = zoomIdentity.translate(0, -72).scale(3);
    handler.rescale(transform);

    handler.scale.domain().forEach((value, i) => expect(value).toBeCloseTo(expected[i]));
    expect(handler.baseDomain()).toEqual([-20, 200]);
  });

  it('should respond correctly to change in base domain', () => {
    handler.baseDomain([0, 150]);
    expect(handler._baseDomain).toEqual([0, 150]);
    expect(handler.baseDomain()).toEqual([0, 150]);
    expect(handler._alternateBase).toEqual([0, 300]);
    expect(handler.scale(75)).toBe(50);

    handler.setMode(1);
    expect(handler._baseDomain).toEqual([0, 150]);
    expect(handler.baseDomain()).toEqual([0, 300]);
    expect(handler._alternateBase).toEqual([0, 300]);
    expect(handler.scale(150)).toBe(50);
  });
});
