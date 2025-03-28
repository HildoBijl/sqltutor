import { TheoryWarning } from 'components'

export function Theory() {
	return <>
		<TheoryWarning />
		<p>You can choose columns in SQL by adding them after the SELECT statement. Columns can be renamed using the "as" operator, or this "as" can be omitted altogether.</p>
	</>
}
