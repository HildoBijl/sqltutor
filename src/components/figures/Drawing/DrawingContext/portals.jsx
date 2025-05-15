import { createContext, useContext } from 'react'

import { Portal } from 'util'

import { useDrawingData } from './context'

export function HtmlPortal({ children }) {
	const { htmlContents } = useDrawingData()
	return <Portal target={htmlContents}>{children}</Portal>
}

const IsInSvgPortalContext = createContext()
export function SvgPortal({ children }) {
	const { svg } = useDrawingData()
	const isInSvgPortal = useContext(IsInSvgPortalContext)
	return isInSvgPortal ? children : <IsInSvgPortalContext.Provider value={true}><Portal target={svg}>{children}</Portal></IsInSvgPortalContext.Provider> // Only set up a portal on the first SVG component encountered (like a Group) and not on descendants (like shapes inside that Group).
}

export function SvgDefsPortal({ children }) {
	const { svgDefs } = useDrawingData()
	return <Portal target={svgDefs}>{children}</Portal>
}
