import { createContext, useContext, type ReactNode } from 'react'

import { Portal } from '@/utils'

import { useDrawingData } from './context'

interface PortalProps {
	children: ReactNode;
}

// Put elements in the htmlContents div.
export function HtmlPortal({ children }: PortalProps) {
	const { htmlContents } = useDrawingData()
	return <Portal target={htmlContents}>{children}</Portal>
}

// Put elements in the SVG part of the Drawing. Only do so for the first element encountered (like a Group) and not on descendants (like shapes inside that Group).
const IsInSvgPortalContext = createContext<boolean>(false);
export function SvgPortal({ children }: PortalProps) {
	const { svg } = useDrawingData();
	const isInSvgPortal = useContext(IsInSvgPortalContext);
	return isInSvgPortal ? children : <IsInSvgPortalContext.Provider value={true}>
		<Portal target={svg}>
			{children}
		</Portal>
	</IsInSvgPortalContext.Provider>
}

// Put elements in the SVG Defs part of the Drawing.
export function SvgDefsPortal({ children }: PortalProps) {
	const { svgDefs } = useDrawingData()
	return <Portal target={svgDefs}>{children}</Portal>
}
