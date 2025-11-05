import { CSSProperties } from 'react';

// A macro for making an object unselectable, preventing a blue border around it.
export const notSelectable: CSSProperties = {
  userSelect: 'none',
  WebkitUserSelect: 'none',
  MozUserSelect: 'none',
  msUserSelect: 'none',
  WebkitTapHighlightColor: 'transparent',
};
