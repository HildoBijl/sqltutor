// For a DOM object, set up a list of all textNodes in it.
export function getTextNodes(element: Node | null | undefined): Text[] {
	if (!element)
		return [];
	if (element.nodeType === Node.TEXT_NODE)
		return [element as Text];
	const children = Array.from(element.childNodes);
	return children.flatMap(child => getTextNodes(child));
}

// For a given node (Element, Text) find the LayoutRoot: the first parent that is involved in positioning.
export function findLayoutRoot(node: Element | Text | null | undefined, stopAt?: Element): Element | null {
	if (!node)
		return null;

	// Walk up the tree until we find an element establishing layout.
	let el: Element | null = node instanceof Element ? node : node.parentElement;
	while (el) {
		const style = getComputedStyle(el);

		// Skip non-layout participants.
		if (style.display === "contents" || style.position === "fixed") {
			if (el === stopAt)
				break;
			el = el.parentElement;
			continue;
		}

		// These typically establish layout flow
		if (style.display === "block" || style.display === "flex" || style.display === "grid" || style.display === "inline-block")
			return el;

		el = el.parentElement;
	}

	return null;
}

// For a given set of nodes, find all (possibly shared) layout roots.
export function findLayoutRoots(nodes: (Element | Text | null | undefined)[], stopAt?: Element): Element[] {
	const roots = new Set<Element>();
	for (const node of nodes) {
		const root = findLayoutRoot(node, stopAt);
		if (root)
			roots.add(root);
	}
	return [...roots];
}
