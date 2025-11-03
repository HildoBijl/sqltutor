// A macro for making an object unselectable, preventing a blue border around it.
export const notSelectable: React.CSSProperties = {
  userSelect: 'none',
  WebkitUserSelect: 'none',
  MozUserSelect: 'none',
  msUserSelect: 'none',
  WebkitTapHighlightColor: 'transparent',
};
