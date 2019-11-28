import { D3Selection } from '../common/interfaces';
/**
 * Set multiple attributes on all elements in selection
 * instead of using selection.attr for each attribute to set.
 */
export function setAttrs(selection: D3Selection, attrs: object) : D3Selection {
  if (typeof (attrs) === 'function') {
    selection.each(function applyAttrs(d) {
      const obj = attrs(d);
      Object.entries(obj).forEach((a: [string, any]) => {
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
 * instead of using selection.style for each style to set.
 */
export function setStyles(selection: D3Selection, styles: object) : D3Selection {
  if (typeof (styles) === 'function') {
    selection.each(function applyStyles(d) {
      const obj = styles(d);
      Object.entries(obj).forEach((s:[string, any]) => {
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
 */
export function setProps(selection: D3Selection, props:{ attrs?: object, styles?: object}) : D3Selection {
  if (props.attrs) {
    setAttrs(selection, props.attrs);
  }
  if (props.styles) {
    setStyles(selection, props.styles);
  }
  return selection;
}
