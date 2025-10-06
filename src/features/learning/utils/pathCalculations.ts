/*
* Utility function to compute SVG path data for connectors between nodes in the skill tree.   
* @param fromEl - The HTMLDivElement of the starting node.  
* @param toEl - The HTMLDivElement of the ending node.  
* @param container - The container HTMLDivElement that holds the entire tree layout.  
* @param cRect - The bounding client rect of the container element.  
* @returns A string representing the SVG path 'd' attribute for the connector line.
* 
* Note: The quadratic curves function is Claude generated. 
*/
export function computeConnectorPath(
  fromEl: HTMLDivElement,
  toEl: HTMLDivElement,
  container: HTMLDivElement,
  cRect: DOMRect
): string {
  const a = fromEl.getBoundingClientRect();
  const b = toEl.getBoundingClientRect();

  const x1 = a.left - cRect.left + a.width / 2 + (container.scrollLeft || 0);
  const rawY1 = a.bottom - cRect.top + (container.scrollTop || 0);
  const x2 = b.left - cRect.left + b.width / 2 + (container.scrollLeft || 0);
  const rawY2 = b.top - cRect.top + (container.scrollTop || 0);

  // Leave a small gap so lines don't touch/overlap nodes
  const distance = rawY2 - rawY1;
  let gap = 4;
  if (distance > 0 && distance < gap * 2 + 8) {
    gap = Math.max(2, Math.floor(distance / 4));
  }
  const y1 = rawY1 + gap;
  const y2 = rawY2 - gap;

  // Make the lines a bit curved, instead of straight right angles
  const midY = (y1 + y2) / 2;
  const radius = 10; // Curve radius in pixels

  // Use quadratic curves at corners
  const d = `
    M ${x1} ${y1}
    L ${x1} ${midY - radius}
    Q ${x1} ${midY} ${x1 + Math.sign(x2 - x1) * radius} ${midY}
    L ${x2 - Math.sign(x2 - x1) * radius} ${midY}
    Q ${x2} ${midY} ${x2} ${midY + radius}
    L ${x2} ${y2}
  `
    .replace(/\s+/g, " ")
    .trim();

  return d;
}
