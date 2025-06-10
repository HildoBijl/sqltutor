import { useState, useRef } from 'react'
import { useTheme } from '@mui/material'

import { Head, Par, Warning, SQL, Drawing, Element, Glyph, useRefWithBounds, Line, Rectangle, Circle, Curve, Text, useTextNodeBounds } from 'components'

export function Theory() {
	return <>
		{/* <Test /> */}

		<Par>When receiving a table filled with data from a query, we might want to order the rows in a certain way. For instance alphabetically by name, sorted by number of employees, or similar. How can we use SQL to sort rows in a table?</Par>

		<Head>Sorting on a single column</Head>
		<Par>To instruct SQL to sort rows, we add an <SQL>ORDER BY</SQL> command to the end of the query, followed by the name of the column by which it should be ordered.</Par>
		<FigureSingleColumnSorting />
		<Par>By adding the <SQL>ASC</SQL> (ascending) or <SQL>DESC</SQL> (descending) classifiers, we indicate the sorting direction.</Par>

		<Head>Sorting based on multiple columns</Head>
		<Par>If the sorting column has many equal values, it is helpful to add a second (or even a third and fourth) sorting column. We can do this by giving a list of column sortings, separated by commas. When rows have the same value within the first column, then the second column is used for comparison, and then the third, and so forth.</Par>
		<Drawing width={800} height={200}>
			<Rectangle dimensions={[[0, 0], [800, 200]]} style={{ fill: 'blue', opacity: 0.1 }} />
			<Element position={[50, 50]} anchor={[0, 0]}>
				<SQL>{`
SELECT *
FROM companies
ORDER BY country ASC, name DESC
			`}</SQL>
			</Element>
		</Drawing>

		<Head>Limiting the number of rows</Head>
		<Par>If not the whole table is needed, but only the first few rows, then we can limit the number of rows that are given. To do so, we add a <SQL>LIMIT</SQL> command after the <SQL>ORDER BY</SQL> command and specify how many rows we need.</Par>
		<Drawing width={800} height={200}>
			<Rectangle dimensions={[[0, 0], [800, 200]]} style={{ fill: 'blue', opacity: 0.1 }} />
			<Element position={[50, 50]} anchor={[0, 0]}>
				<SQL>{`
SELECT *
FROM companies
ORDER BY name DESC
LIMIT 2
			`}</SQL>
			</Element>
		</Drawing>
		<Par>It is also possible to first skip a few rows. This is done through the <SQL>OFFSET</SQL> command. It specifies how many rows should first be skipped.</Par>
		<Drawing width={800} height={200}>
			<Rectangle dimensions={[[0, 0], [800, 200]]} style={{ fill: 'blue', opacity: 0.1 }} />
			<Element position={[50, 50]} anchor={[0, 0]}>
				<SQL>{`
SELECT *
FROM companies
ORDER BY name DESC
LIMIT 2 OFFSET 1
			`}</SQL>
			</Element>
		</Drawing>
		<Warning>Though most database management systems use the <SQL>LIMIT</SQL> and <SQL>OFFSET</SQL> commands, there are a few DBMs that do not stick to this convention. If the usual commands do not work, even on simple queries, check out the specifications for your own DBM.</Warning>

		<Head>Dealing with NULL values</Head>
		<Par>If there are NULL values in the sorted column, we can indicate manually if we want them at the start or at the end. For this we use the <SQL>NULLS FIRST</SQL> or <SQL>NULLS LAST</SQL> additions.</Par>
		<Drawing width={800} height={200}>
			<Rectangle dimensions={[[0, 0], [800, 200]]} style={{ fill: 'blue', opacity: 0.1 }} />
			<Element position={[50, 50]} anchor={[0, 0]}>
				<SQL>{`
SELECT *
FROM companies
ORDER BY country ASC NULLS FIRST
			`}</SQL>
			</Element>
		</Drawing>
		<Par>By default, NULL values are "larger" than any other value. So the default for ascending sorting is <SQL>NULLS LAST</SQL>, while the default for descending sorting is <SQL>NULLS FIRST</SQL>.</Par>
	</>
}

function FigureSingleColumnSorting() {
	const theme = useTheme()
	const drawingRef = useRef()
	const [element, setElement] = useState()
	const bounds = useTextNodeBounds(element, 'DESC', drawingRef)

	return <Drawing width={900} height={200} ref={drawingRef}>
		{/* <Rectangle dimensions={[[0, 0], [800, 200]]} style={{ fill: 'blue', opacity: 0.1 }} /> */}

		<Element position={[20, 20]} anchor={[0, 0]}>
			<SQL setElement={setElement}>{`
SELECT *
FROM companies
ORDER BY name DESC
			`}</SQL>
		</Element>

		<Rectangle dimensions={[[280, 20], [440, 180]]} style={{ fill: theme.palette.primary.main, opacity: 0.2 }} />
		<Rectangle dimensions={[[450, 20], [610, 180]]} style={{ fill: theme.palette.primary.main, opacity: 0.2 }} />
		<Rectangle dimensions={[[620, 20], [780, 180]]} style={{ fill: theme.palette.primary.main, opacity: 0.2 }} />

		{bounds && <>
			<Curve points={[bounds.topRight.add([0, 0]), [260, 0], [410, 0], [450, 20]]} color={theme.palette.primary.main} endArrow={true} />
			{/* <Rectangle dimensions={bounds} style={{ fill: 'white', opacity: 0.5 }} /> */}
		</>}
	</Drawing>
}

const query = "SELECT *\nFROM companies\nWHERE country='Netherlands'"
function Test() {
	const drawingRef = useRef()
	const [sqlElement, setSqlElement] = useState()
	const [subRef1, elBounds1] = useRefWithBounds(drawingRef)
	const [subRef2, elBounds2] = useRefWithBounds(drawingRef)

	const points = [[100, 30], [30, 30], [100, 160], [30, 190]]

	const b1 = useTextNodeBounds(sqlElement, '*', drawingRef)
	const b2 = useTextNodeBounds(sqlElement, 'Netherlands', drawingRef)

	return <>
		<Head>Testing section</Head>
		<Par style={{ fontWeight: 'bold', color: 'red' }}>The parts below are test elements for the new Theory pages.</Par>

		<Drawing maxWidth={600} width={400} height={300} ref={drawingRef}>
			<Rectangle dimensions={[[20, 20], [380, 280]]} cornerRadius={20} style={{ fill: 'blue', opacity: 0.2 }} />
			{/* <Circle center={[130, 80]} radius={30} style={{ fill: 'green' }} /> */}

			{points.map((point, index) => <Circle center={point} radius={2} key={index} style={{ fill: 'black' }} />)}
			<Line points={points} startArrow={true} color="red" size={3} />
			<Curve points={points} through={false} part={1} arrow={true} />

			<Curve points={[[100, 100], [100, 70], [250, 70], [250, 100]]} part={1} arrow={true} color="green" />

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
			<Element position={[50, 190]} anchor={[0, 0]}>
				<SQL onCreateEditor={view => setSqlElement(view?.contentDOM)}>{query}</SQL>
			</Element>

			{elBounds1 && <Rectangle dimensions={elBounds1} style={{ fill: 'green' }} />}
			{elBounds2 && <Rectangle dimensions={elBounds2} style={{ fill: 'yellow', opacity: 0.3 }} />}

			{elBounds1 && elBounds2 && <Line points={[elBounds1.bottomLeft, elBounds2.bottomRight]} style={{ stroke: 'orange', strokeWidth: 2 }} />}
			{elBounds1 && elBounds2 && <Line points={[elBounds1.bottomRight, elBounds2.bottomLeft]} style={{ stroke: 'orange', strokeWidth: 2 }} />}

			<Curve points={[[200, 40], [350, 40], [350, 100]]} color="red" arrow={true} through={false} spread={50} />

			{b1 && b2 && <Curve points={[b1.rightTop.add([1, 3]), [b2.middleTop.x - 16, b1.rightTop.y + 3], b2.middleTop.add([0, 1])]} size={2} color="#c81919" arrow={true} through={true} part={1.5} />}
		</Drawing>
	</>
}
