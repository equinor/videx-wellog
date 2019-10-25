/**
 * Rounding function that rounds of to specified decimal
 * @param {number} v number value to round of
 * @param {number} decimals number of decimals to round of to
 * @returns {number} rounded value
 */
export function round(v, decimals) {
  const f = 10 ** decimals;
  return Math.round(v * f) / f;
}

/**
 * Format a numeric value as a string, rounded to the specified
 * number of decimals.
 * @param {number} v number to be formatted
 * @param {number} [decimals] number of decimals to round of to
 * @returns {string} numeric value formated as string
 */
export function numberFormatter(v, decimals = 1) {
  if (v === null || Number.isNaN(+v)) return '-';
  return round(v, decimals).toFixed(decimals);
}

/**
 * Simple and quick hashing function for strings
 * @param {string} str string to hash
 * @returns {number} hash value
 */
export function hashString(str) {
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
 * @param {number} [debounceInterval] debounce delay
 * @returns {function} debounce function
 */
export function debouncer(debounceInterval = 20) {
  const _debounces = {};
  /**
   * Throtteling of function calls
   * @param {function} func function to be called
   * @param  {...any} args arguments to be passed
   */
  function debounce(func, ...args) {
    const funcName = hashString(func.name || func.toString()).toString();
    if (_debounces[funcName]) {
      clearTimeout(_debounces[funcName]);
    }
    _debounces[funcName] = setTimeout(() => {
      func(...args);
      delete _debounces[funcName];
    }, debounceInterval);
  }

  return debounce;
}
