import { useState, useLayoutEffect, useMemo, RefObject } from "react";
import { ContentMeta } from "@/features/content";
import { computeConnectorPath } from "../utils/pathCalculations";

/*
* Hook to compute visible SVG paths for connectors between nodes in a skill tree.   
* @param contentItems - Array of content items (concepts and skills) with their metadata.
* @param containerRef - Ref to the container div for the tree layout.
* @param nodeRefs - Ref to a map of node IDs to their corresponding div elements.
* @param hoveredId - ID of the currently hovered node, or null if none.
* @param showAll - Boolean indicating whether to show all connectors or only those related to the hovered node.
* @param components - Object mapping content item IDs to their progress data (used to trigger recompute on progress change).
* @returns An array of objects representing visible SVG paths with their 'd' attribute and associated 'from' and 'to' node IDs.
*/
export function useTreeConnectors(
  contentItems: ContentMeta[],
  containerRef: RefObject<HTMLDivElement | null>,
  nodeRefs: RefObject<Map<string, HTMLDivElement | null>>,
  hoveredId: string | null,
  showAll: boolean,
  components: any
) {
  const [paths, setPaths] = useState<{ d: string; from: string; to: string }[]>([]);

  const recompute = () => {
    const container = containerRef.current;
    if (!container) return;
    const cRect = container.getBoundingClientRect();

    const newPaths: { d: string; from: string; to: string }[] = [];
    const byId = new Set(contentItems.map((i) => i.id));

    for (const item of contentItems) {
      for (const pre of item.prerequisites || []) {
        if (!byId.has(pre)) continue;
        const fromEl = nodeRefs.current?.get(pre);
        const toEl = nodeRefs.current?.get(item.id);
        if (!fromEl || !toEl) continue;

        const d = computeConnectorPath(fromEl, toEl, container, cRect);
        newPaths.push({ d, from: pre, to: item.id });
      }
    }
    setPaths(newPaths);
  };

  useLayoutEffect(() => {
    recompute();
    const onResize = () => recompute();
    window.addEventListener("resize", onResize);

    const currentContainer = containerRef.current;
    const ro =
      typeof ResizeObserver !== "undefined" && currentContainer
        ? new ResizeObserver(() => recompute())
        : null;
    if (ro && currentContainer) ro.observe(currentContainer);

    return () => {
      window.removeEventListener("resize", onResize);
      if (ro && currentContainer) ro.unobserve(currentContainer);
    };
  }, [contentItems, components]);

  const prereqMap = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const item of contentItems) m.set(item.id, item.prerequisites || []);
    return m;
  }, [contentItems]);

  const visiblePaths = useMemo(() => {
    if (showAll) return paths;
    if (!hoveredId) return [];

    // Compute full ancestor closure (including hovered)
    const ancestors = new Set<string>();
    const stack: string[] = [hoveredId];
    while (stack.length) {
      const id = stack.pop()!;
      if (ancestors.has(id)) continue;
      ancestors.add(id);
      const pres = prereqMap.get(id) || [];
      for (const p of pres) stack.push(p);
    }

    // Only show edges that point to a node in the ancestor closure
    return paths.filter((p) => ancestors.has(p.to));
  }, [paths, showAll, hoveredId, prereqMap]);

  return visiblePaths;
}
