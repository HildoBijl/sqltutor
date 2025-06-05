import { useState, useRef } from 'react'

import { SQL, TheoryWarning, Drawing, Element, Glyph, useRefWithBounds, Line, Rectangle, Circle, Curve, Text, useTextNodeBounds, ArrowHead } from 'components'

const query = "SELECT *\nFROM companies\nWHERE country='Netherlands'"

export function Theory() {
	const drawingRef = useRef()
	const [sqlElement, setSqlElement] = useState()
	const [subRef1, elBounds1] = useRefWithBounds(drawingRef)
	const [subRef2, elBounds2] = useRefWithBounds(drawingRef)

	const points = [[100, 30], [30, 30], [100, 160], [30, 190]]

	const b1 = useTextNodeBounds(sqlElement, '*', drawingRef)
	const b2 = useTextNodeBounds(sqlElement, 'Netherlands', drawingRef)

	return <>
		<TheoryWarning />
		<p>You can sort rows in a table by adding an "ORDER BY" clause at the end. You can order by one column, multiple columns, ascending or descending. In case of Null values you can add NULLS LAST as add-on. It is also possible to limit the rows in various ways.</p>
		<p style={{ fontWeight: 'bold', color: 'red' }}>The parts below are test elements for the new Theory pages.</p>

		<Drawing maxWidth={600} width={400} height={300} ref={drawingRef}>
			<Rectangle dimensions={[[20, 20], [380, 280]]} cornerRadius={20} style={{ fill: 'blue', opacity: 0.2 }} />
			<Circle center={[130, 80]} radius={30} style={{ fill: 'green' }} />

			{points.map((point, index) => <Circle center={point} radius={2} key={index} style={{ fill: 'black' }} />)}
			<Line points={points} startArrow={true} color="red" size={3} />
			<Curve points={points} through={false} part={1} arrow={true} />

			{b2 && <Circle center={b2.leftTop} radius={2} style={{ fill: 'teal' }} />}
			{b2 && <Circle center={b2.rightTop} radius={2} style={{ fill: 'teal' }} />}
			{b2 && <Circle center={b2.leftBottom} radius={2} style={{ fill: 'teal' }} />}
			{b2 && <Circle center={b2.rightBottom} radius={2} style={{ fill: 'teal' }} />}

			<Glyph name="Database" position={[360, 80]} width={60} />
			<Glyph name="Database" position={[380, 180]} behind={false} />

			<Element position={[250, 100]}><span style={{ fontWeight: 'bold', color: 'red' }}>This is a <span ref={subRef1} style={{ color: 'yellow', border: '1px solid yellow' }}>first</span> test</span></Element>
			<Element position={[250, 150]} behind={true}><span style={{ fontWeight: 'bold', color: 'red' }}>This is a <span ref={subRef2} style={{ color: 'green', border: '1px solid green', background: 'red' }}>second</span> test</span></Element>
			<Element position={[250, 190]} passive={true}><span style={{ fontWeight: 'bold', color: 'red' }}>This is a test</span></Element>

			<Text position={[250, 270]}>This is an SVG test</Text>
			<Element position={[50, 190]} anchor={[0, 0]}><SQL onCreateEditor={view => setSqlElement(view?.contentDOM)}>{query}</SQL></Element>

			{elBounds1 && <Rectangle dimensions={elBounds1} style={{ fill: 'green' }} />}
			{elBounds2 && <Rectangle dimensions={elBounds2} style={{ fill: 'yellow', opacity: 0.3 }} />}

			{elBounds1 && elBounds2 && <Line points={[elBounds1.bottomLeft, elBounds2.bottomRight]} style={{ stroke: 'orange', strokeWidth: 2 }} />}
			{elBounds1 && elBounds2 && <Line points={[elBounds1.bottomRight, elBounds2.bottomLeft]} style={{ stroke: 'orange', strokeWidth: 2 }} />}

			<ArrowHead position={[300, 60]} color="yellow" />

			<Curve points={[[200, 40], [350, 40], [350, 100]]} color="red" arrow={true} through={false} spread={50} />

			{b1 && b2 && <Curve points={[b1.rightTop.add([1, 3]), [b2.middleTop.x - 16, b1.rightTop.y + 3], b2.middleTop.add([0, 1])]} size={2} color="#c81919" arrow={true} through={true} part={1.5} />}
			{/* {b2 && <ArrowHead position={b2.middleTop.add([-1.5, 5])} color="yellow" angle={Math.PI * 0.6} />} */}
		</Drawing>
	</>
}
