import { InlineMath, BlockMath } from 'react-katex';

import 'katex/dist/katex.min.css';
import './style.css';

export interface MathProps {
	children: string
	className?: string
}

export function M({ children, className }: MathProps) {
	return <InlineMath className={className}>
		{children}
	</InlineMath>
}

export function BM({ children, className }: MathProps) {
	return <BlockMath className={className}>
		{children}
	</BlockMath>
}
