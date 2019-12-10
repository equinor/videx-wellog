export type DebounceFunction = (func: Function, ...args: any) => void;

/**
 * Rounding function that rounds of to specified decimal
 */
export function round(v: number, decimals: number) : number {
  const f = 10 ** decimals;
  return Math.round(v * f) / f;
}

/**
 * Format a numeric value as a string, rounded to the specified
 * number of decimals.
 */
export function numberFormatter(v: number, decimals: number = 1) : string {
  if (v === null || Number.isNaN(+v)) return '-';
  return round(v, decimals).toFixed(decimals);
}

/**
 * Simple and quick hashing function for strings
 */
export function hashString(str: string) : number {
  let hash = 0;
  if (str.length === 0) {
    return hash;
  }
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash &= hash; // Convert to 32bit integer
  }
  return hash;
}


/**
 * Creates a debounce function that can be used to easily
 * throttle function calls
 */
export function debouncer(debounceInterval: number = 20) : DebounceFunction {
  const _debounces = {};
  /**
   * Throtteling of function calls
   * @param {function} func function to be called
   * @param  {...any} args arguments to be passed
   */
  function debounce(func: Function, ...args : any) {
    const funcName = hashString(func.name || func.toString()).toString();
    if (_debounces[funcName]) {
      clearTimeout(_debounces[funcName]);
    }
    _debounces[funcName] = setTimeout(() => {
      delete _debounces[funcName];
      func(...args);
    }, debounceInterval);
  }

  return debounce;
}
