import React, { useState, useEffect, useRef, Fragment } from 'react';
import htm from 'htm';

export const html = htm.bind((type, props, ...children) => {
  if (props && props.class) { props = { ...props, className: props.class }; delete props.class; }
  return React.createElement(type, props, ...children);
});

export { useState, useEffect, useRef, Fragment };
