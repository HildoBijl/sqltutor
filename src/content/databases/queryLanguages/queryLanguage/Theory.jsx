import { Link } from 'react-router-dom'

import { Par, Head, Term, List, SQL, Drawing, Element, Glyph, Curve } from 'components'

export function Theory() {
	return <>
		<Par>A database can contain large amounts of data. This data can help with answering complicated questions. How do we ask a Database Management System (DBMS) these questions, so they are answered properly?</Par>

		<Head>Queries: commands for the DBMS</Head>
		<Par>To do anything with the database, we have to send a so-called <Term>query</Term> to the DBMS. You can see a query as a request/command for the DBMS. It tells it what to do. Examples of queries might be:</Par>
		<List items={[
			<>Find all Tech Companies from "The Netherlands".</>,
			<>Make a list of the number of Tech Companies for each country.</>,
			<>Adjust the country for company "Unilever" from "The Netherlands" to "United Kingdom".</>,
		]} />
		<FigureQueryIdea />
		<Par>Often queries request data (so-called <Term>read queries</Term>) but queries can also adjust the data in the database (<Term>write queries</Term>). For write queries, we can distinguish further between <Term>create queries</Term> adding data, <Term>update queries</Term> adjusting data and <Term>delete queries</Term> removing data.</Par>

		<Head>Query language: how to set up queries</Head>
		<Par>A DBMS does not understand regular English, or any other spoken language. It needs its commands in a very specific format. The exact way in which a DBMS expects its commands - the list of commands it understands - is called the <Term>query language</Term>. You can think of a query as a small piece of computer code following the query language specifications. See for instance the following example.</Par>
		<SQL>{`
SELECT *
FROM TechCompanies
WHERE country="The Netherlands";
		`}</SQL>
		<Par>There is a large variety of query languages, each requiring its queries to be set up differently. Some would say that every DBMS has its own query language. However, in an effort to make this more uniform, most table-based databases have agreed to use a command standard: the <Link to="/c/sql">SQL query language</Link>, of which the above query is an example. As a result, SQL is by far the most often-used query language for databases.</Par>
	</>
}

export function FigureQueryIdea() {
	const h = 210
	const w = 800
	const y = h / 2 + 32
	const xUser = 60
	const xServer = w / 2
	const xDatabase = w - 60

	return <Drawing width={w} height={h}>
		<Glyph name="User" position={[xUser, y - 25]} width={100} />
		<Element position={[xUser, y + 38]}><span style={{ fontSize: '1em', fontWeight: 500 }}>User</span></Element>

		<Glyph name="Server" position={[xServer, y - 25]} width={60} />
		<Element position={[xServer, y + 50]}><span style={{ fontSize: '1em', fontWeight: 500 }}>DBMS</span></Element>

		<Glyph name="Database" position={[xDatabase, y - 25]} width={100} />
		<Element position={[xDatabase, y + 38]}><span style={{ fontSize: '1em', fontWeight: 500 }}>Database</span></Element>

		<Curve points={[[xUser + 26, y - 70], [(xUser + xServer) / 2, y - 120], [xServer - 35, y - 70]]} endArrow={true} />
		<Element position={[(xUser + xServer) / 2, y - 96]} anchor={[0.5, 1]}><p style={{ fontSize: '0.8em', lineHeight: '1.2em', fontWeight: 500 }}>Query</p></Element>

		<Curve points={[[xServer + 35, y - 70], [(xServer + xDatabase) / 2, y - 120], [xDatabase - 50, y - 70]]} endArrow={true} />
		<Element position={[(xServer + xDatabase) / 2, y - 96]} anchor={[0.5, 1]}><p style={{ fontSize: '0.8em', lineHeight: '1.2em', fontWeight: 500 }}>Internal requests</p></Element>

		<Curve points={[[xDatabase - 50, y + 20], [(xServer + xDatabase) / 2, y + 70], [xServer + 35, y + 20]]} endArrow={true} />
		<Element position={[(xServer + xDatabase) / 2, y + 42]} anchor={[0.5, 0]}><p style={{ fontSize: '0.8em', lineHeight: '1.2em', fontWeight: 500 }}>Internal responses</p></Element>

		<Curve points={[[xServer - 35, y + 20], [(xUser + xServer) / 2, y + 70], [xUser + 50, y + 20]]} endArrow={true} />
		<Element position={[(xUser + xServer) / 2, y + 42]} anchor={[0.5, 0]}><p style={{ fontSize: '0.8em', lineHeight: '1.2em', fontWeight: 500 }}>Query result</p></Element>
	</Drawing>
}
