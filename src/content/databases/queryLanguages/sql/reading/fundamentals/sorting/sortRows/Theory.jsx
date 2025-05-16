import { useRef } from 'react'

import { TheoryWarning, Drawing, Element, useRefWithBounds, Line, Rectangle, Circle, Curve, Text } from 'components'

export function Theory() {
	const drawingRef = useRef()
	window.drawingRef = drawingRef
	const [subRef1, elBounds1] = useRefWithBounds(drawingRef)
	const [subRef2, elBounds2] = useRefWithBounds(drawingRef)

	const points = [[100, 30], [30, 30], [100, 160], [30, 160]]

	return <>
		<TheoryWarning />
		<p>You can sort rows in a table by adding an "ORDER BY" clause at the end. You can order by one column, multiple columns, ascending or descending. In case of Null values you can add NULLS LAST as add-on. It is also possible to limit the rows in various ways.</p>
		<p style={{ fontWeight: 'bold', color: 'red' }}>The parts below are test elements for the new Theory pages.</p>
		<Drawing maxWidth={600} width={400} height={300} ref={drawingRef}>
			<Rectangle dimensions={[[20, 20], [380, 280]]} cornerRadius={20} style={{ fill: 'blue' }} />
			<Circle center={[70, 70]} radius={30} style={{ fill: 'green' }} />

			{points.map((point, index) => <Circle center={point} radius={2} key={index} style={{ fill: 'black' }} />)}
			<Curve points={points} through={false} spread={16} />

			<Element position={[250, 100]}><span style={{ fontWeight: 'bold', color: 'red' }}>This is a <span ref={subRef1} style={{ color: 'yellow', border: '1px solid yellow' }}>first</span> test</span></Element>
			<Element position={[250, 150]}><span style={{ fontWeight: 'bold', color: 'red' }}>This is a <span ref={subRef2} style={{ color: 'green', border: '1px solid green' }}>second</span> test</span></Element>
			<Element position={[250, 200]}><span style={{ fontWeight: 'bold', color: 'red' }}>This is a test</span></Element>

			<Text position={[250, 250]}>This is an SVG test</Text>

			{elBounds1 && <Rectangle dimensions={elBounds1} style={{ fill: 'green' }} />}
			{elBounds2 && <Rectangle dimensions={elBounds2} style={{ fill: 'yellow' }} />}

			{elBounds1 && elBounds2 && <Line points={[elBounds1.bottomLeft, elBounds2.topRight]} style={{ stroke: 'orange', strokeWidth: 1 }} />}
			{elBounds1 && elBounds2 && <Line points={[elBounds1.bottomRight, elBounds2.topLeft]} style={{ stroke: 'orange', strokeWidth: 1 }} />}
		</Drawing>
	</>
}
