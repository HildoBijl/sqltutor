import { Link } from 'react-router-dom'

import { Par, Term, SQL } from 'components'

import { FigureQueryIdea } from './Theory'

export function Summary() {
	return <>
		<Par>To do anything with a database, you need to send a <Term>query</Term> to the DBMS. This is a command like "Find all Tech Companies from The Netherlands" or similar.</Par>
		<FigureQueryIdea />
		<Par>Since database management systems don't understand natural language, actual queries often look like a chunk of computer code.</Par>
		<SQL>{`
SELECT *
FROM TechCompanies
WHERE country="The Netherlands";
		`}</SQL>
		<Par>The exact format that a query may have is called the <Term>query language</Term>. While every DBMS more or less uses its own query language, most table-based DBMSs have agreed to use a common standard, the <Link to="/c/sql">SQL query language</Link>, making this the most often-used query language.</Par>
	</>
}
