/**
 * Find and return the element of elements positioned at a given
 * x-coordinate of its container element.
 * NOTE: Requires elements to be within the same containing DOM element
 * and stacked side-by-side horizontally.
 * @param {HTMLElement[]} elements html elements to search.
 * @param {number} xpos X position
 */
function pickHStackedElement(elements, xpos) {
  for (let i = 0; i < elements.length; i++) {
    const elm = elements[i];
    if (xpos >= elm.offsetLeft && xpos <= elm.offsetLeft + elm.clientWidth) {
      return elm;
    }
  }
  return null;
}

/**
 * Find and return the element of elements positioned at a given
 * y-coordinate of its container element.
 * NOTE: Requires elements to be within the same containing DOM element
 * and stacked top-by-down vertically.
 * @param {HTMLElement[]} elements html elements to search.
 * @param {number} ypos Y position
 */
function pickVStackedElement(elements, ypos) {
  for (let i = 0; i < elements.length; i++) {
    const elm = elements[i];
    if (ypos >= elm.offsetTop && ypos <= elm.offsetTop + elm.clientHeight) {
      return elm;
    }
  }
  return null;
}

export default {
  pickHStackedElement,
  pickVStackedElement,
};
