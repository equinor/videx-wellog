import { expect } from 'chai';
import { JSDOM } from 'jsdom';
import { select } from 'd3';
import { setAttrs, setStyles, setProps } from '../src/utils';


let document;

describe('d3-utils', () => {
  beforeEach(() => {
    document = new JSDOM().window.document;
  });

  it('should be able to set multiple attributes by passing an object', () => {
    const attrsObj = {
      cx: 10,
      cy: 5,
      r: 2,
    };

    const elm = select(document.body).append('svg').append('circle');
    setAttrs(elm, attrsObj);

    expect(elm.attr('cx')).to.eq('10');
    expect(elm.attr('cy')).to.eq('5');
    expect(elm.attr('r')).to.eq('2');
  });

  it('should be able to set multiple attributes by passing a function', () => {
    const elm = select(document.body).append('svg').append('circle');
    elm.datum({
      x: 10,
      y: 5,
    });
    setAttrs(elm, d => ({
      cx: d.x,
      cy: d.y,
      r: 2,
    }));

    expect(elm.attr('cx')).to.eq('10');
    expect(elm.attr('cy')).to.eq('5');
    expect(elm.attr('r')).to.eq('2');
  });

  it('should be able to set multiple styles by passing an object', () => {
    const stylesObj = {
      width: '100px',
      height: '50px',
      border: '1px solid purple',
    };

    const elm = select(document.body).append('div');
    setStyles(elm, stylesObj);

    expect(elm.style('width')).to.eq('100px');
    expect(elm.style('height')).to.eq('50px');
    expect(elm.style('border')).to.eq('1px solid purple');
    expect(elm.style('border-width')).to.eq('1px');
    expect(elm.style('border-color')).to.eq('purple');
  });

  it('should be able to set multiple styles by passing a function', () => {
    const elm = select(document.body).append('div');

    elm.datum({
      w: 100,
      h: 50,
      c: 'purple',
    });

    setStyles(elm, d => ({
      width: `${d.w}px`,
      height: `${d.h}px`,
      border: `1px solid ${d.c}`,
    }));

    expect(elm.style('width')).to.eq('100px');
    expect(elm.style('height')).to.eq('50px');
    expect(elm.style('border')).to.eq('1px solid purple');
    expect(elm.style('border-width')).to.eq('1px');
    expect(elm.style('border-color')).to.eq('purple');
  });

  it('should be able to set multiple props (styles + attrs)', () => {
    const elm = select(document.body).append('div');

    elm.datum({
      w: 100,
      h: 50,
      c: 'purple',
    });

    const props = {
      styles: d => ({
        width: `${d.w}px`,
        height: `${d.h}px`,
        border: `1px solid ${d.c}`,
      }),
      attrs: {
        class: 'test-class',
      },
    };

    setProps(elm, props);

    expect(elm.attr('class')).to.eq('test-class');
    expect(elm.style('width')).to.eq('100px');
    expect(elm.style('height')).to.eq('50px');
    expect(elm.style('border')).to.eq('1px solid purple');
    expect(elm.style('border-width')).to.eq('1px');
    expect(elm.style('border-color')).to.eq('purple');
  });
});

