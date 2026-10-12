import React, { useState, useEffect, useRef, useMemo, Fragment } from 'react';
import htm from 'htm';

/* JSX-like templates without a build step:
     html`<div class="box">${value}</div>`          a normal element
     html`<${MyComponent} title="Hi" count=${3} />`  a component
   Write class="..." exactly like in plain HTML. */
export const html = htm.bind((type, props, ...children) => {
  if (props && 'class' in props) { props = { ...props, className: props.class }; delete props.class; }
  return React.createElement(type, props, ...children);
});

export { useState, useEffect, useRef, useMemo, Fragment };
