import expect from 'expect';
import {
  round,
  numberFormatter,
  hashString,
  debouncer,
} from '../src/utils/utils';


describe('Utils', () => {
  it('should be able to round to a specified decimal', () => {
    expect(round(Math.PI, 2)).toBe(3.14);
    expect(round(1.123456789, 5)).toBe(1.12346);
  });

  it('should be able to round and format decimals to string with numberFormatter', () => {
    expect(numberFormatter(Math.PI, 2)).toBe('3.14');
  });

  it('should be able to create a hash of a string', () => {
    expect(hashString('')).toBe(0);
    expect(hashString('foo')).toBe(101574);
    expect(hashString('bar')).toBe(97299);
  });

  it('should be able to debounce function calls with debouncer', (done) => {
    const delay = 10;

    let i = 0;

    const counter = () => i++;

    const debounce = debouncer(delay);

    debounce(counter);
    debounce(counter);
    debounce(counter);
    debounce(counter);
    debounce(counter);

    setTimeout(
      () => {
        expect(i).toBe(1);
        done();
      }, delay + 1);
  });
});
