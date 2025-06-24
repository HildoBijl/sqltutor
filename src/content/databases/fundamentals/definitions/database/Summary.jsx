import { themeColor, Par, Term, Link, Drawing, Element, Rectangle } from 'components'

import { FigureDatabaseUsage } from './Theory'

export function Summary() {
	return <>
		<Par>In its essence, a <Term>database</Term> is a collection of tables, each filled with data. There may be millions of records that are constantly being updated by multiple applications at the same time.</Par>
		<FigureTwoTables /> {/* ToDo: add actual tables here. */}
		<Par>A database is always accompanied by tools (software) used to efficiently enter, update and read the data. This set of tools is known as the <Term>Database Management System</Term> (DBMS). Popular examples are <Link to="https://www.postgresql.org/">PostgreSQL</Link>, <Link to="https://www.mysql.com/">MySQL</Link>, <Link to="https://www.oracle.com/database/">Oracle</Link> and <Link to="https://sqlite.org/">SQLite</Link>.</Par>
		<FigureDatabaseUsage />
	</>
}

function FigureTwoTables() {
	return <Drawing width={800} height={400}>
		<Element position={[0, 0]} anchor={[0, 0]}><span style={{ fontWeight: 500, fontSize: '0.8em' }}>Table TechCompanies</span></Element>
		<Rectangle dimensions={[[0, 25], [150, 195]]} style={{ fill: themeColor, opacity: 0.2 }} />
		<Rectangle dimensions={[[170, 25], [320, 195]]} style={{ fill: themeColor, opacity: 0.2 }} />
		<Rectangle dimensions={[[340, 25], [490, 195]]} style={{ fill: themeColor, opacity: 0.2 }} />

		<Element position={[310, 205]} anchor={[0, 0]}><span style={{ fontWeight: 500, fontSize: '0.8em' }}>Table Vacancies</span></Element>
		<Rectangle dimensions={[[310, 230], [460, 400]]} style={{ fill: themeColor, opacity: 0.2 }} />
		<Rectangle dimensions={[[480, 230], [630, 400]]} style={{ fill: themeColor, opacity: 0.2 }} />
		<Rectangle dimensions={[[650, 230], [800, 400]]} style={{ fill: themeColor, opacity: 0.2 }} />
	</Drawing>
}
