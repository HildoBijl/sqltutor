import { useState, useRef } from 'react'

import { themeColor, Head, Par, Warning, SQL, Drawing, Element, Rectangle, Curve, useTextNodeBounds } from 'components'

export function Theory() {
	return <>
		<Par>When receiving a table filled with data from a query, we might want to order the rows in a certain way. For instance alphabetically by name, sorted by number of employees, or similar. How can we use SQL to sort rows in a table?</Par>

		<Head>Sort on a single column</Head>
		<Par>To instruct SQL to sort rows, we add an <SQL>ORDER BY</SQL> command to the end of the query, followed by the name of the column by which it should be ordered. By adding the <SQL>ASC</SQL> (ascending) or <SQL>DESC</SQL> (descending) classifiers, we indicate the sorting direction.</Par>
		<FigureSingleColumnSorting />

		<Head>Sort based on multiple columns</Head>
		<Par>If the sorting column has many equal values, it is helpful to add a second (or even a third and fourth) sorting column. We can do this by giving a list of column sortings, separated by commas. When rows have the same value within the first column, then the second column is used for comparison, and then the third, and so forth.</Par>
		<Drawing width={800} height={200}>
			<Rectangle dimensions={[[0, 0], [800, 200]]} style={{ fill: 'blue', opacity: 0.1 }} />
			<Element position={[50, 50]} anchor={[0, 0]}>
				<SQL>{`
SELECT *
FROM companies
ORDER BY
	country ASC,
	name DESC
			`}</SQL>
			</Element>
		</Drawing>

		<Head>Limit the number of rows</Head>
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

		<Head>Deal with NULL values</Head>
		<Par>When sorting, NULL values are always considered "larger" than any other values. So when sorting ascending they'll come last, and when sorting descending they'll come first. If this is not what we want, we could manually specify where we want the NULL values by adding <SQL>NULLS FIRST</SQL> or <SQL>NULLS LAST</SQL>. This is optional and can be done separately per sorting column.</Par>
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
	</>
}

function FigureSingleColumnSorting() {
	const drawingRef = useRef()
	const [queryElement, setQueryElement] = useState()
	const bounds = useTextNodeBounds(queryElement, 'DESC', drawingRef)

	return <Drawing width={800} height={200} ref={drawingRef}>

		<Element position={[0, 20]} anchor={[0, 0]}>
			<SQL setElement={setQueryElement}>{`
SELECT *
FROM companies
ORDER BY name DESC
			`}</SQL>
		</Element>

		<Rectangle dimensions={[[300, 20], [460, 180]]} style={{ fill: themeColor, opacity: 0.2 }} />
		<Rectangle dimensions={[[470, 20], [630, 180]]} style={{ fill: themeColor, opacity: 0.2 }} />
		<Rectangle dimensions={[[640, 20], [800, 180]]} style={{ fill: themeColor, opacity: 0.2 }} />

		{bounds && <Curve points={[bounds.topRight.add([0, 0]), [260, 0], [440, 0], [490, 40]]} color={themeColor} endArrow={true} />}

	</Drawing>
}
