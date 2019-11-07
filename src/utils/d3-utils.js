/**
 * Set multiple attributes on all elements in selection
 * istead of using selection.attr for each attribute to set.
 * @param {d3.selection} selection
 * @param {object|function} attrs attributes
 */
export function setAttrs(selection, attrs) {
  if (typeof (attrs) === 'function') {
    selection.each(function applyAttrs(d) {
      const obj = attrs(d);
      Object.entries(obj).forEach(a => {
        this.setAttribute(a[0], a[1]);
      });
    });
    return selection;
  }
  Object.entries(attrs).forEach(a => {
    selection.attr(a[0], a[1]);
  });
  return selection;
}

/**
 * Set multiple styles on all elements in selection
 * istead of using selection.style for each style to set.
 * @param {d3.selection} selection
 * @param {object|function} styles styles to set
 */
export function setStyles(selection, styles) {
  if (typeof (styles) === 'function') {
    selection.each(function applyStyles(d) {
      const obj = styles(d);
      Object.entries(obj).forEach(s => {
        this.style.setProperty(s[0], s[1]);
      });
    });
    return selection;
  }
  Object.entries(styles).forEach(s => {
    selection.style(s[0], s[1]);
  });
  return selection;
}

/**
 * Wrapper for setAttrs and setStyles, setting both attributes and styles
 * on each element in seletion.
 * @param {d3.selection} selection
 * @param {{styles: object|function, attrs: object|function}} props styles and attributes to set
 */
export function setProps(selection, props) {
  if (props.attrs) {
    setAttrs(selection, props.attrs);
  }
  if (props.styles) {
    setStyles(selection, props.styles);
  }
  return selection;
}
