import { Par, SQL } from 'components'

export function Summary() {
	return <>
		<Par>SQL is the world's most-used query language. SQL queries read a bit like regular sentences. We can for instance select all rows from the table TechCompanies through</Par>
		<SQL>{`
SELECT *
FROM TechCompanies;
		`}</SQL>
		<Par>Whitespace has no effect on queries, and keywords like "Select" and "From" are not case sensitive, though it's customary to write them in upper case for clarity.</Par>
		<Par>SQL (often pronounced as "sequel") has a long history, starting in the 1970s at IBM. Thanks to its adoption by the American National Standards Institute (ANSI) and the International Organization for Standardization (ISO) in 1986, the SQL Database Language standard is now well-defined, with many database management systems using it. Though different DBMSs sometimes have a slightly different interpretation of the standard, SQL queries can generally be used across different databases.</Par>
	</>
}
