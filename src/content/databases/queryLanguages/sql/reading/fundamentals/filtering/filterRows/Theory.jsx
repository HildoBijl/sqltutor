import { TheoryWarning } from 'components'

export function Theory() {
	return <>
		<TheoryWarning />
		<p>You can filter rows in SQL by adding a "WHERE" clause to an SQL query. How to set up the filter depends on the data type that's being considered. You can use "=", "&gt;", "&lt;" and "&lt;&gt;" and this is processed accordingly for numbers, strings, dates, etcetera. For strings, the filler "%" is useful. For lists, you can use lists as in "name IN ('Alice', 'Bob', 'Carl')". [Edit: perhaps move "IN" to the filtering rows on multiple criteria?]</p>
	</>
}
