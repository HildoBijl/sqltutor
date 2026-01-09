declare module 'react-katex' {
	import * as React from 'react'

	export interface KaTeXProps {
		children: string
		className?: string
		errorColor?: string
		renderError?: (error: Error) => React.ReactNode
	}

	export const InlineMath: React.FC<KaTeXProps>
	export const BlockMath: React.FC<KaTeXProps>
}
