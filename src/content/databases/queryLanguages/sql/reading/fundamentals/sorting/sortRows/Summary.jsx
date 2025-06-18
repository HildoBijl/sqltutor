import { useState, useRef } from 'react'

import { Vector } from 'util'
import { themeColor, Par, SQL, Drawing, Element, Line, Rectangle, Curve, useTextNodeBounds } from 'components'

export function Summary() {
	return <>
		<Par>To sort rows in tables, and/or limit the number of given rows, there is a variety of options we can add to the end of an SQL query.</Par>
		<MainFigure />
	</>
}

function MainFigure() {
	const drawingRef = useRef()
	const [queryElement, setQueryElement] = useState()

	// Find bounds of existing elements.
	const ascBounds = useTextNodeBounds(queryElement, 'ASC', drawingRef)
	const descBounds = useTextNodeBounds(queryElement, 'DESC', drawingRef)
	const limitBounds = useTextNodeBounds(queryElement, '3', drawingRef)
	const offsetBounds = useTextNodeBounds(queryElement, '1', drawingRef)

	// Define position data.
	const offset = 28 // Between text lines.
	const b1 = new Vector([450, 16])
	const b2 = new Vector([b1.x, b1.y + offset])
	const b3 = new Vector([b2.x, b2.y + offset])
	const b4 = new Vector([b3.x, b3.y + offset])
	const tableBase = 140
	const tableHeight = 160

	// Render the figuire.
	return <Drawing width={1000} height={300} ref={drawingRef}>

		{/* Query. */}
		<Element position={[150, 0]} anchor={[0, 0]}>
			<SQL setElement={setQueryElement}>{`
SELECT *
FROM companies
ORDER BY country ASC,
				 numEmployees DESC
LIMIT 3
OFFSET 1
			`}</SQL>
		</Element>

		{/* Explainer text. */}
		<Element position={b1} anchor={[0, 0.5]}><span style={{ textWrap: 'nowrap' }}>First sort ascending by country ...</span></Element>
		<Element position={b2} anchor={[0, 0.5]}><span style={{ textWrap: 'nowrap' }}>... and on equal country, sort descending by numEmployees.</span></Element>
		<Element position={b3} anchor={[0, 0.5]}><span style={{ textWrap: 'nowrap' }}>Only pick the first three rows ...</span></Element>
		<Element position={b4} anchor={[0, 0.5]}><span style={{ textWrap: 'nowrap' }}>... after skipping the first row.</span></Element>

		{/* Arrows to explainer text. */}
		{ascBounds && <Curve points={[ascBounds.middleRight.add([8, 0]), ascBounds.middleRight.add([28, 0]), b1.add([-22, 0]), b1.add([-2, 0])]} endArrow={true} />}
		{descBounds && <Curve points={[descBounds.middleRight.add([2, 0]), descBounds.middleRight.add([22, 0]), b2.add([-22, 0]), b2.add([-2, 0])]} endArrow={true} />}
		{limitBounds && <Curve points={[limitBounds.middleRight.add([3, 1]), limitBounds.middleRight.add([123, 1]), b3.add([-22, 0]), b3.add([-2, 0])]} endArrow={true} />}
		{offsetBounds && <Curve points={[offsetBounds.middleRight.add([3, 1]), offsetBounds.middleRight.add([123, 1]), b4.add([-22, 0]), b4.add([-2, 0])]} endArrow={true} />}

		{/* Dummy table 1. */}
		<Rectangle dimensions={[[0, tableBase], [140, tableBase + tableHeight]]} style={{ fill: themeColor, opacity: 0.2 }} />
		<Rectangle dimensions={[[150, tableBase], [290, tableBase + tableHeight]]} style={{ fill: themeColor, opacity: 0.2 }} />
		<Rectangle dimensions={[[300, tableBase], [440, tableBase + tableHeight]]} style={{ fill: themeColor, opacity: 0.2 }} />

		{/* Arrow between tables. */}
		<Line points={[[450, tableBase + tableHeight / 2], [550, tableBase + tableHeight / 2]]} endArrow={true} />

		{/* Dummy table 2. */}
		<Rectangle dimensions={[[560, tableBase], [700, tableBase + tableHeight]]} style={{ fill: themeColor, opacity: 0.2 }} />
		<Rectangle dimensions={[[710, tableBase], [850, tableBase + tableHeight]]} style={{ fill: themeColor, opacity: 0.2 }} />
		<Rectangle dimensions={[[860, tableBase], [1000, tableBase + tableHeight]]} style={{ fill: themeColor, opacity: 0.2 }} />

	</Drawing>
}
