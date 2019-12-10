import { expect } from 'chai';
import {
  round,
  numberFormatter,
  hashString,
  debouncer,
} from '../src/utils/utils';


describe('Utils', () => {
  it('should be able to round to a specified decimal', () => {
    expect(round(Math.PI, 2)).to.eq(3.14);
    expect(round(1.123456789, 5)).to.eq(1.12346);
  });

  it('should be able to round and format decimals to string with numberFormatter', () => {
    expect(numberFormatter(Math.PI, 2)).to.eq('3.14');
  });

  it('should be able to create a hash of a string', () => {
    expect(hashString('')).to.eq(0);
    expect(hashString('foo')).to.eq(101574);
    expect(hashString('bar')).to.eq(97299);
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
        expect(i).to.eq(1);
        done();
      }, delay + 1);
  });
});
