/**
 * Helper methods for wellog specific DOM queries
 */
export default class UIHelper {
  /**
   * Find and return the element of elements positioned at a given
   * x-coordinate of its container element.
   * NOTE: Requires elements to be within the same containing DOM element
   * and stacked side-by-side horizontally.
   */
  static pickHStackedElement(elements: HTMLElement[], xpos: number) : HTMLElement {
    for (let i = 0; i < elements.length; i++) {
      const elm = elements[i];
      if (elm && xpos >= elm.offsetLeft && xpos <= elm.offsetLeft + elm.clientWidth) {
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
   */
  static pickVStackedElement(elements: HTMLElement[], ypos: number) : HTMLElement {
    for (let i = 0; i < elements.length; i++) {
      const elm = elements[i];
      if (elm && ypos >= elm.offsetTop && ypos <= elm.offsetTop + elm.clientHeight) {
        return elm;
      }
    }
    return null;
  }
}
