import { useRef } from 'react'

import { TheoryWarning, Drawing, SvgPortal, Element, useRefWithBounds } from 'components'

export function Theory() {
	const drawingRef = useRef()
	window.drawingRef = drawingRef
	const [subRef1, elBounds1] = useRefWithBounds(drawingRef)
	const [subRef2, elBounds2] = useRefWithBounds(drawingRef)
	const [blockRef, blockBounds] = useRefWithBounds(drawingRef)
	const height = blockBounds?.height || 0

	return <>
		<TheoryWarning />
		<p>You can sort rows in a table by adding an "ORDER BY" clause at the end. You can order by one column, multiple columns, ascending or descending. In case of Null values you can add NULLS LAST as add-on. It is also possible to limit the rows in various ways.</p>
		<p style={{ fontWeight: 'bold', color: 'red' }}>The parts below are test elements for the new Theory pages.</p>
		<Drawing maxWidth={600} width={400} height={height || 300} ref={drawingRef}>
			<SvgPortal>
				<rect width="360" height="260" x="20" y="20" rx="20" ry="20" fill="blue" />
				{elBounds1 && elBounds2 && <line x1={elBounds1.middle.x} y1={elBounds1.max.y} x2={elBounds2.middle.x} y2={elBounds2.min.y} stroke="red" strokeWidth={4} />}
			</SvgPortal>
			<Element position={[200, 100]}><span style={{ fontWeight: 'bold', color: 'red' }}>This is a <span ref={subRef1} style={{ color: 'yellow', border: '1px solid yellow' }}>first</span> test</span></Element>
			<Element position={[200, 150]}><span style={{ fontWeight: 'bold', color: 'red' }}>This is a <span ref={subRef2} style={{ color: 'green', border: '1px solid green' }}>second</span> test</span></Element>
			<Element position={[200, 200]}><span style={{ fontWeight: 'bold', color: 'red' }}>This is a test</span></Element>
			<Element position={[350, height / 2]}><div ref={blockRef} style={{ background: 'pink', width: 20, height: 400 }}>This is a test</div></Element>
		</Drawing>
	</>
}
