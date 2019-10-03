import expect from 'expect';
import { zoomIdentity } from 'd3';
import BasicScaleHandler from '../src/scale-handlers/basic-scale-handler';

let handler;

beforeEach(() => {
  handler = new BasicScaleHandler([-10, 100]).range([0, 100]);
});

describe('BasicScaleHandler', () => {
  it('should initialize correctly', () => {
    expect(handler.baseDomain()).toEqual([-10, 100]);
    expect(handler.range()).toEqual([0, 100]);
    expect(handler.internalScale).toBe(handler.scale);
    expect(handler.dataScale).toBe(handler.scale);
  });

  it('should return major and minor ticks', () => {
    const expected = {
      major: [0, 50, 100],
      minor: [-10, 10, 20, 30, 40, 60, 70, 80, 90],
    };
    expect(handler.ticks()).toEqual(expected);
  });

  it('should rescale scale domain according to d3.zoomTransform', () => {
    let transform = zoomIdentity.translate(0, -10).scale(2);
    let expected = [-4.5, 50.5];
    handler.rescale(transform);

    handler.scale.domain().forEach((value, i) => expect(value).toBeCloseTo(expected[i]));
    expect(handler.baseDomain()).toEqual([-10, 100]);

    expected = [16.4, 53.067];
    transform = zoomIdentity.translate(0, -72).scale(3);
    handler.rescale(transform);

    handler.scale.domain().forEach((value, i) => expect(value).toBeCloseTo(expected[i]));
    expect(handler.baseDomain()).toEqual([-10, 100]);
  });

  it('should respond correctly to change in base domain', () => {
    handler.baseDomain([0, 150]);
    expect(handler.baseDomain()).toEqual([0, 150]);
    expect(handler.scale(75)).toBe(50);
  });
});
